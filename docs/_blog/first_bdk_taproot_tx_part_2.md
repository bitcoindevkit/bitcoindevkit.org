---
title: "The first BDK Taproot TX: a look at the code (Part 2)"
description: "A quick overview of the changes made to bdk, rust-miniscript and rust-bitcoin to make a Taproot transaction"
authors:
    - Alekos Filini
date: "2021-11-25"
tags: ["BDK", "taproot", "miniscript"]
permalink: "/blog/2021/11/first-bdk-taproot-tx-look-at-the-code-part-2"
---

This is the second part of a two-part blog series in which I talk through the changes made to BDK to make a Taproot transaction. If you haven't read it yet, check out [Part 1].

While in the first part I managed to show full raw commits, in this case I will only focus on the relevant changes, otherwise the post would get very long. You can always find the full diff here, if you are interested
in that.

## Shortcuts

As mentioned previously, the main goal of this journey for me was to find out what it really takes to support Taproot in BDK. The code shown here wasn't written to be readable and/or maintainable, so
some shortcuts were taken, in particular:

- No support for BIP32 extended keys: this is probably very quick to add, but in the first "proof of concept" I decided to only work with WIF keys for simplicity
- No support for `SIGHASH_DEFAULT`: this would require some minor changes to a few traits in BDK that still use the "legacy" `SigHashType` enum from rust-bitcoin

## Utilities

Let's start with some utilities:

```rust
pub fn ecdsa_to_schnorr(pk: &ecdsa::PublicKey) -> schnorr::PublicKey {
    schnorr::PublicKey::from_slice(&pk.to_bytes()[1..]).expect("Key conversion failure")
}

pub fn compute_merkle_root(
    leaf_hash: &taproot::TapLeafHash,
    control_block: &taproot::ControlBlock,
) -> taproot::TapBranchHash {
    taproot::TapBranchHash::from_inner(
        control_block
            .merkle_branch
            .as_inner()
            .iter()
            .fold(
                taproot::NodeInfo::new_hidden(
                    sha256::Hash::from_slice(leaf_hash.as_inner()).expect("Invalid TapLeafHash"),
                ),
                |acc, branch| {
                    taproot::NodeInfo::combine(acc, taproot::NodeInfo::new_hidden(*branch))
                        .expect("Invalid tree")
                },
            )
            .hash()
            .into_inner(),
    )
}
```

The first function "converts" an ECDSA key to a Schnorr key by dropping the first byte that encodes the key parity, since Schnorr keys are "x-only".

The second one constructs the merkle root of a taptree given a leaf hash and the corresponding control block.

## Wrap Fallible Methods

Many of the methods exposed by a `Descriptor` struct used to be infallible: for instance, it was always possible to "encode" a descriptor into a Bitcoin script by calling the `script_pubkey()` method.

Unfortunately, taproot descriptors need some more metadata to do that: they can be computed by calling the `spend_info()` method, and they will be cached inside the descriptor, but since it's not guaranteed by the
compiler that the method will be called before trying to encode it, the infallible methods had to be changed to return a `Result`, so that they can fail if the spend info is not present.

In BDK we call the `spend_info()` method right after "deriving" the descriptor, so it's guaranteed that we will never encounter that error: for this reason, we wrap those methods and call `expect()` on them, to keep
the original code mostly unchanged.

Here we call `spend_info()` right after deriving the descriptor, if it's a `Tr` variant:

```diff
@@ -136,10 +133,16 @@ impl AsDerived for Descriptor<DescriptorPublicKey> {
         index: u32,
         secp: &'s SecpCtx,
     ) -> Descriptor<DerivedDescriptorKey<'s>> {
-        self.derive(index).translate_pk_infallible(
+        let mut derived = self.derive(index).translate_pk_infallible(
             |key| DerivedDescriptorKey::new(key.clone(), secp),
             |key| DerivedDescriptorKey::new(key.clone(), secp),
-        )
+        );
+
+        if let Descriptor::Tr(tr) = &mut derived {
+            tr.spend_info(secp);
+        }
+
+        derived
     }
```

And here we wrap the `script_pubkey()` method and call `expect()` on it. Note that we only implement it on `DerivedDescriptor`, because it's not guaranteed that "extended descriptors" will have the cached metadata inside.

```rust
pub(crate) trait DerivedDescriptorSafeOps {
    /// The [`Descriptor::script_pubkey`] method can fail on `Tr` descriptors that don't have the
    /// `spend_info` inside. Since we generate those upon derivation, it's guaranteed that the
    /// method will not fail on `DerivedDescriptor`s.
    fn script_pubkey_derived(&self) -> Script;
}

impl<'s> DerivedDescriptorSafeOps for Descriptor<DerivedDescriptorKey<'s>> {
    fn script_pubkey_derived(&self) -> Script {
        self.script_pubkey()
            .expect("`spend_info` is always present in `DerivedDescriptor`s")
    }
}
```

## Descriptor Metadata

In BDK we have a few traits that in a way "unify" the interface of a descriptor: things like the `redeem_script` of an input has to be computed differently depending on the type of descriptor. The traits we define
are implemented on the `DerivedDescriptor` or `ExtendedDescriptor` structs and allow us to quickly get what we need without having to check the descriptor type manually.

Internally, they are essentially large `match`es that return different things depending on the descriptor variant. Due to some renaming that had been done recently in `miniscript` (not necessarily related to taproot)
we have to update them:

```diff
@@ -337,6 +339,7 @@ pub(crate) trait DerivedDescriptorMeta {

 pub(crate) trait DescriptorMeta {
     fn is_witness(&self) -> bool;
+    fn is_tap(&self) -> bool;
     fn get_extended_keys(&self) -> Result<Vec<DescriptorXKey<ExtendedPubKey>>, DescriptorError>;
     fn derive_from_hd_keypaths<'s>(
         &self,
@@ -358,23 +361,29 @@ pub(crate) trait DescriptorScripts {

 impl<'s> DescriptorScripts for DerivedDescriptor<'s> {
     fn psbt_redeem_script(&self) -> Option<Script> {
-        match self.desc_type() {
-            DescriptorType::ShWpkh => Some(self.explicit_script()),
-            DescriptorType::ShWsh => Some(self.explicit_script().to_v0_p2wsh()),
-            DescriptorType::Sh => Some(self.explicit_script()),
-            DescriptorType::Bare => Some(self.explicit_script()),
-            DescriptorType::ShSortedMulti => Some(self.explicit_script()),
+        match self {
+            Descriptor::Sh(ref sh) => match sh.as_inner() {
+                ShInner::Wsh(_) => Some(sh.inner_script().to_v0_p2wsh()),
+                _ => Some(sh.inner_script()),
+            },
+            Descriptor::Bare(ref bare) => Some(bare.inner_script()),
             _ => None,
         }
     }

     fn psbt_witness_script(&self) -> Option<Script> {
-        match self.desc_type() {
-            DescriptorType::Wsh => Some(self.explicit_script()),
-            DescriptorType::ShWsh => Some(self.explicit_script()),
-            DescriptorType::WshSortedMulti | DescriptorType::ShWshSortedMulti => {
-                Some(self.explicit_script())
-            }
+        match self {
+            Descriptor::Wsh(ref wsh) => Some(wsh.inner_script()),
             _ => None,
         }
     }
@@ -390,9 +399,14 @@ impl DescriptorMeta for ExtendedDescriptor {
                 | DescriptorType::ShWsh
                 | DescriptorType::ShWshSortedMulti
                 | DescriptorType::WshSortedMulti
+                | DescriptorType::Tr
         )
     }

+    fn is_tap(&self) -> bool {
+        self.desc_type() == DescriptorType::Tr
+    }
+
     fn get_extended_keys(&self) -> Result<Vec<DescriptorXKey<ExtendedPubKey>>, DescriptorError> {
         let mut answer = Vec::new();

@@ -477,31 +491,69 @@ impl DescriptorMeta for ExtendedDescriptor {
         }

         let descriptor = self.as_derived_fixed(secp);
-        match descriptor.desc_type() {
+        match (
+            &descriptor,
+            utxo,
+            psbt_input.redeem_script.as_ref(),
+            psbt_input.witness_script.as_ref(),
+        ) {
             // TODO: add pk() here
-            DescriptorType::Pkh | DescriptorType::Wpkh | DescriptorType::ShWpkh
-                if utxo.is_some()
-                    && descriptor.script_pubkey() == utxo.as_ref().unwrap().script_pubkey =>
-            {
+            (Descriptor::Pkh(ref pkh), Some(utxo), _, _) if utxo.script_pubkey == pkh.spk() => {
                 Some(descriptor)
             }
-            DescriptorType::Bare | DescriptorType::Sh | DescriptorType::ShSortedMulti
-                if psbt_input.redeem_script.is_some()
-                    && &descriptor.explicit_script()
-                        == psbt_input.redeem_script.as_ref().unwrap() =>
-            {
+            (Descriptor::Wpkh(ref wpkh), Some(utxo), _, _) if utxo.script_pubkey == wpkh.spk() => {
                 Some(descriptor)
             }
-            DescriptorType::Wsh
-            | DescriptorType::ShWsh
-            | DescriptorType::ShWshSortedMulti
-            | DescriptorType::WshSortedMulti
-                if psbt_input.witness_script.is_some()
-                    && &descriptor.explicit_script()
-                        == psbt_input.witness_script.as_ref().unwrap() =>
+            (Descriptor::Sh(ref sh), utxo, rscript, wscript) => {
+                match (sh.as_inner(), utxo, rscript, wscript) {
+                    (ShInner::Wpkh(ref wpkh), Some(utxo), _, _)
+                        if utxo.script_pubkey == wpkh.spk() =>
+                    {
+                        Some(descriptor)
+                    }
+                    (ShInner::Wsh(ref wsh), _, _, Some(wscript))
+                        if wscript == &wsh.inner_script() =>
+                    {
+                        Some(descriptor)
+                    }
+                    (_, _, Some(rscript), _) if rscript == &sh.inner_script() => Some(descriptor),
+                    _ => None,
+                }
+            }
+
+            (Descriptor::Wsh(ref wsh), _, _, Some(wscript)) if wscript == &wsh.inner_script() => {
+                Some(descriptor)
+            }
+            (Descriptor::Bare(ref bare), _, Some(rscript), _)
+                if rscript == &bare.inner_script() =>
             {
                 Some(descriptor)
             }
             _ => None,
         }
     }

```

## Policy

Our `policy` module contains code to "distill" the content of a descriptor into a more human- or machine-readable format that clearly explains what's needed to satisfy a descriptor.

For instance, for a `multi(2,Alice,Bob)` descriptor the policy module will tell you that both `Alice` and `Bob` need to sign to spend from the descriptor.

It can also tell you whether you can do anything (if `Alice` runs this analysis on her descriptor the answer will be something like "you can sign but Bob also has to") and if somebody has already signed a given PSBT,
but that's not important for us right now.

The policies are recursive structures that form a tree: at its core there's the `SatisfiableItem` enum, which has some "leaf" variants (like `Signature`, `Preimage`, etc) and a `Thresh` variant that is used to piece
together multiple sub-trees: `Thresh` defines a set of sub-policies that are policies trees (hence the recusiveness of this structure) and a numeric threshold that needs to be reached to satisfy the descriptor.

For instance, the `and_v(or_c(pk(Service),v:older(12960)),pk(User))` descriptor will be turned into a tree containing two `Thresh` items (one for the `and_v` and one for the `or_c`) and a total of three leaves
(two `Signature`s, one for `User` and one for `Service` and a timelock). Logically, the `and_v` will be translated into a thresh with value `2` (both sub-trees need to be satisfied) and the `or_c` will
have a value of `1`.

Taproot descriptors can be seen as a large logical "or": you can spend with the key-path OR with one of the n leaves in the tapscript tree. Translated into code it looks like this:

```diff
@@ -842,7 +842,7 @@ impl<Ctx: ScriptContext> ExtractPolicy for Miniscript<DescriptorPublicKey, Ctx>
             Terminal::Hash160(hash) => {
                 Some(SatisfiableItem::Hash160Preimage { hash: *hash }.into())
             }
-            Terminal::Multi(k, pks) => {
+            Terminal::Multi(k, pks) | Terminal::MultiA(k, pks) => {
                 Policy::make_multisig(pks, signers, build_sat, *k, false, secp)?
             }
             // Identities
@@ -969,6 +969,19 @@ impl ExtractPolicy for Descriptor<DescriptorPublicKey> {
                 WshInner::SortedMulti(ref keys) => make_sortedmulti(keys, signers, build_sat, secp),
             },
             Descriptor::Bare(ms) => Ok(ms.as_inner().extract_policy(signers, build_sat, secp)?),
+            Descriptor::Tr(tr) => {
+                let mut items = vec![signature(tr.internal_key(), signers, build_sat, secp)];
+                items.append(
+                    &mut tr
+                        .iter_scripts()
+                        .filter_map(|(_, ms)| {
+                            ms.extract_policy(signers, build_sat, secp).transpose()
+                        })
+                        .collect::<Result<Vec<_>, _>>()?,
+                );
+
+                Ok(Policy::make_thresh(items, 1)?)
+            }
         }
     }
 }
```

We essentially construct a vector of items by always inserting the `Signature` leaf for the key-spend branch and then appending the policy of all the tapscript leaves. The threshold value is `1`, since satisfying any of
those items is enough to fully satisfy the descriptor.

## Signer

Taproot (Segwit v1) scripts are satisfied with Schnorr signatures instead of ECDSA which was used for legacy and Segwit v0 scripts. Moreover, the *sighash* algorithm has been changed to make it better suited for the
unique needs of Taproot (the signature could either be used in a key-spend or script-spend branch, and in the latter case it should commit to the specific leaf used to spend, so that the same key can be safely
used in multiple leaves without worrying about "reply" attacks).

The new sighash algorithm also fixes the infamous "segwit bug", that a malicious software could use to trick external signers like hardware wallets into burning a lot of the user's funds by sending a very large fee.
We will get back to this later on.

There are a lot of changes made to our signing code, I'll try to break them down in more manageable chunks:

```diff
 pub(crate) trait ComputeSighash {
+    type SigHash;
+    type Extra;
+
     fn sighash(
         psbt: &psbt::PartiallySignedTransaction,
         input_index: usize,
-    ) -> Result<(SigHash, SigHashType), SignerError>;
+        extra: Self::Extra,
+    ) -> Result<(Self::SigHash, SigHashType), SignerError>;
 }
```

First of all, we update our internal `ComputeSighash` trait so that it can optionally take "extra" data and return a custom `SigHash` type.

```diff
impl ComputeSighash for Legacy {
+    type SigHash = bitcoin::SigHash;
+    type Extra = ();
+
     fn sighash(
         psbt: &psbt::PartiallySignedTransaction,
         input_index: usize,
-    ) -> Result<(SigHash, SigHashType), SignerError> {
+        _: (),
+    ) -> Result<(Self::SigHash, SigHashType), SignerError> {
         if input_index >= psbt.inputs.len() || input_index >= psbt.global.unsigned_tx.input.len() {
             return Err(SignerError::InputIndexOutOfRange);
         }
@@ -545,10 +658,14 @@ fn p2wpkh_script_code(script: &Script) -> Script {
 }

 impl ComputeSighash for Segwitv0 {
+    type SigHash = bitcoin::SigHash;
+    type Extra = ();
+
     fn sighash(
         psbt: &psbt::PartiallySignedTransaction,
         input_index: usize,
-    ) -> Result<(SigHash, SigHashType), SignerError> {
+        _: (),
+    ) -> Result<(Self::SigHash, SigHashType), SignerError> {
         if input_index >= psbt.inputs.len() || input_index >= psbt.global.unsigned_tx.input.len() {
             return Err(SignerError::InputIndexOutOfRange);
         }
```

The implementation on `Legacy` and `Segwitv0` is updated accordingly: they don't need any extra data, so the `Extra` type will be an empty tuple, and they return the "legacy" rust-bitcoin `SigHash` type.

```rust
fn tap_signature(
    key: &PrivateKey,
    psbt: &mut psbt::PartiallySignedTransaction,
    input_index: usize,
    secp: &SecpCtx,
) -> Result<(), SignerError> {
    let mut keypair = schnorr::KeyPair::from_seckey_slice(secp, key.key.as_ref())?;
    let public = ecdsa_to_schnorr(&key.public_key(secp));

    fn make_sig<H: AsRef<[u8]>>(
        secp: &SecpCtx,
        keypair: &schnorr::KeyPair,
        hash: H,
    ) -> bitcoin::secp256k1::schnorrsig::Signature {
        secp.schnorrsig_sign(&Message::from_slice(hash.as_ref()).unwrap(), &keypair)
    }

    let psbt_input = &psbt.inputs[input_index];
    let mut new_psbt_input = psbt::Input::default();

    debug!(
        "tap_internal: {}, public: {}",
        psbt_input.tap_internal_key.as_ref().unwrap(),
        public
    );

    match (
        psbt_input.tap_internal_key,
        psbt_input.tap_merkle_root,
        psbt_input.tap_key_origins.get(&public),
    ) {
        // Key Spend
        (Some(internal_key), _, _) if internal_key == public => {
            let tweak = taproot::compute_tap_tweak(
                psbt_input
                    .tap_merkle_root
                    .map(|r| bitcoin::hashes::sha256::Hash::from_slice(&r).unwrap()),
                public,
            );
            keypair
                .tweak_add_assign(&secp, &tweak)
                .expect("TapTweakHash::from_key_and_tweak is broken");

            let (hash, sighash_type) = Tap::sighash(psbt, input_index, None)?;
            let signature = make_sig(secp, &keypair, &hash);
            new_psbt_input.tap_key_sig = Some((signature, sighash_type.into()));
        }

        // Script Spend
        (_, Some(merkle_root), Some((leaf_hashes, _))) => {
            for leaf_hash in leaf_hashes {
                // check if a control block is valid for this leaf hash
                // this sucks but I can't think of a better way to do it
                for (control_block, script_ver) in &psbt_input.tap_scripts {
                    if merkle_root == compute_merkle_root(leaf_hash, control_block) {
                        let (hash, sighash_type) =
                            Tap::sighash(psbt, input_index, Some(script_ver.clone()))?;
                        let signature = make_sig(secp, &keypair, &hash);

                        new_psbt_input
                            .tap_script_sigs
                            .insert((public, *leaf_hash), (signature, sighash_type.into()));
                    }
                }
            }
        }

        // We can't do anything
        _ => {}
    }

    psbt.inputs[input_index]
        .merge(new_psbt_input)
        .expect("Unable to merge PSBT inputs");

    Ok(())
}
```

Then, we write a function to produce the taproot signatures given a private key and a PSBT.

Internally we check if the key matches the `internal_key` metadata (and in that case we make a key-spend signature by tweaking our key with the taptree merkle root), otherwise we get all the leaves that
involve our key (`psbt_input.tap_key_origins.get(&public)`), iterate on them and produce a signature for each of them.

Unfortunately due to a limitation of the current rust-bitcoin API, we have to come up with the full Bitcoin script in order to produce the signature: this is technically not required, because the sighash only
contains the leaf hash, but rust-bitcoin doesn't allow us to pass in a simple hash, it wants the full script and leaf version and computes the hash internally.

So the "hack" I came up with is: iterate on all the `tap_scripts` contained in the PSBT (this is a `ControlBlock` -> (`Script`, `LeafVersion`) map), try to compute the merkle tree assuming that the control block is the right one for
the `leaf_hash` we are looking at (if it is the computed merkle root will match the one stored in the PSBT) and if so produce a signature using the script.

This is obviously computationally intensive and totally useless, but there was no other way around it. I opened a PR to change the rust-bitcoin API so that a leaf hash can be passed in directly. With that change the
code will look something like this:

```rust
for leaf_hash in leaf_hashes {
    let (hash, sighash_type) =
        Tap::sighash(psbt, input_index, Some(leaf_hash))?;
    let signature = make_sig(secp, &keypair, &hash);

    new_psbt_input
        .tap_script_sigs
        .insert((public, *leaf_hash), (signature, sighash_type.into()));
}
```

With a function to produce the raw Schnorr signature, we implement our `ComputeSighash` trait on the `Tap` context:

```rust
impl ComputeSighash for Tap {
    type SigHash = taproot::TapSighashHash;
    type Extra = Option<(bitcoin::Script, taproot::LeafVersion)>;

    fn sighash(
        psbt: &psbt::PartiallySignedTransaction,
        input_index: usize,
        extra: Self::Extra,
    ) -> Result<(Self::SigHash, SigHashType), SignerError> {
        if input_index >= psbt.inputs.len() || input_index >= psbt.global.unsigned_tx.input.len() {
            return Err(SignerError::InputIndexOutOfRange);
        }

        let psbt_input = &psbt.inputs[input_index];
        let tx_input = &psbt.global.unsigned_tx.input[input_index];

        let sighash_type = psbt_input.sighash_type.unwrap_or(SigHashType::All);
        let witness_utxos = psbt
            .inputs
            .iter()
            .cloned()
            .map(|i| i.witness_utxo)
            .collect::<Vec<_>>();
        let mut all_witness_utxos = vec![];

        let mut cache = sighash::SigHashCache::new(&psbt.global.unsigned_tx);
        let prevouts = if sighash_type.as_u32() & 0x80 != 0 {
            sighash::Prevouts::One(
                input_index,
                witness_utxos[input_index]
                    .as_ref()
                    .ok_or(SignerError::MissingWitnessUtxo)?,
            )
        } else if witness_utxos.iter().all(Option::is_some) {
            all_witness_utxos.extend(witness_utxos.into_iter().filter_map(|x| x));
            sighash::Prevouts::All(&all_witness_utxos)
        } else {
            return Err(SignerError::MissingWitnessUtxo);
        };

        // Assume no OP_CODESEPARATOR
        let extra = extra
            .as_ref()
            .map(|(script, version)| sighash::ScriptPath::new(script, 0xFFFFFFFF, *version));

        Ok((
            cache.taproot_signature_hash(
                input_index,
                &prevouts,
                None,
                extra,
                sighash_type.into(),
            )?,
            sighash_type,
        ))
    }
}
```

In this case we do have some "extra data", the optional `(Script, LeafVersion)` tuple: if present, we make a script-spend signature for that leaf, otherwise we make a key-spend signature.

Also, the `SigHash` type in this case is the "new" `taproot::TapSighashHash` enum.

Finally, we integrate this in our "main" signing code that decides which kind of signature to produce: if the PSBT input contains one of the taproot-specific metadata, like the `tap_internal_key` or
a `tap_merkle_root` we produce a taproot signature, otherwise we continue with the original code.

```diff
@@ -283,6 +382,12 @@ impl Signer for PrivateKey {
             return Ok(());
         }

+        if psbt.inputs[input_index].tap_internal_key.is_some()
+            || psbt.inputs[input_index].tap_merkle_root.is_some()
+        {
+            return tap_signature(self, psbt, input_index, secp);
+        }
+
         let pubkey = self.public_key(secp);
         if psbt.inputs[input_index].partial_sigs.contains_key(&pubkey) {
             return Ok(());
@@ -293,8 +398,8 @@ impl Signer for PrivateKey {
         // these? The original idea was to declare sign() as sign<Ctx: ScriptContex>() and use Ctx,
         // but that violates the rules for trait-objects, so we can't do it.
         let (hash, sighash) = match psbt.inputs[input_index].witness_utxo {
-            Some(_) => Segwitv0::sighash(psbt, input_index)?,
-            None => Legacy::sighash(psbt, input_index)?,
+            Some(_) => Segwitv0::sighash(psbt, input_index, ())?,
+            None => Legacy::sighash(psbt, input_index, ())?,
         };

         let signature = secp.sign(
```

## PSBT Metadata

In our signer code we use the taproot-specific PSBT metadata to produce the right signatures, so we should also include them in the PSBTs we create!

```diff
@@ -1401,18 +1408,66 @@ where
         };

         let desc = self.get_descriptor_for_keychain(keychain);
-        let derived_descriptor = desc.as_derived(child, &self.secp);
+        let mut derived_descriptor = desc.as_derived(child, &self.secp);
         psbt_input.bip32_derivation = derived_descriptor.get_hd_keypaths(&self.secp)?;

         psbt_input.redeem_script = derived_descriptor.psbt_redeem_script();
         psbt_input.witness_script = derived_descriptor.psbt_witness_script();

+        if let Descriptor::Tr(tr) = &mut derived_descriptor {
+            let internal_key = ecdsa_to_schnorr(&tr.internal_key().to_public_key());
+
+            // add taproot metadata
+            psbt_input.tap_internal_key = Some(internal_key);
+
+            let spend_info = tr.spend_info(&self.secp).clone();
+            psbt_input.tap_merkle_root = spend_info.merkle_root.map(|h| {
+                taproot::TapBranchHash::from_slice(h.as_ref()).expect("Invalid TapBranchHash")
+            });
+
+            debug!("spend_info = {:#?}", spend_info);
+
+            let mut key_map_leaves = BTreeMap::new();
+
+            for (_, script) in tr.iter_scripts() {
+                trace!("checking script: {}", script.encode());
+
+                let script_ver = (script.encode(), taproot::LeafVersion::default());
+                let leaf_hash = taproot::TapLeafHash::from_slice(&taproot::compute_leaf_hash(
+                    &script_ver.0,
+                    script_ver.1,
+                ))
+                .expect("Invalid TapLeafHash");
+                // println!("leaf_hash: {}", leaf_hash);
+
+                for key in script.iter_pk() {
+                    let key = ecdsa_to_schnorr(&key.to_public_key());
+                    key_map_leaves
+                        .entry(key)
+                        .or_insert(vec![])
+                        .push(leaf_hash.clone());
+
+                    // println!("key {} in script {:?}", key, script);
+                }
+
+                if let Some(control_block) = spend_info.control_block(&script_ver) {
+                    psbt_input.tap_scripts.insert(control_block, script_ver);
+                }
+            }
+
+            psbt_input.tap_key_origins = key_map_leaves
+                .into_iter()
+                .map(|(pk, leaf_hash)| (pk, (leaf_hash, Default::default())))
+                .collect();
+            debug!("psbt_input = {:#?}", psbt_input);
+        }
```

If our descriptor is a `Tr` variant, we include the `internal_key` in the PSBT, the `merkle_root` (if present) and then iterate on all the scripts and all the keys in every scripts and populate the `tap_scripts`
and `tap_key_origins` maps. Since we don't support extended keys for the time being, we use an empty (`Default::default()`) key origin, but all the other fields are populated with the right values.

Remember when I said that the taproot sighash algorithm fixes the "segwit bug"? This means that we don't have to include the full previous transaction (`non_witness_utxo`) for every input, since it's safe to just
use the previous UTXO (`witness_utxo`). We also change this:

```diff
         // If we aren't allowed to use `witness_utxo`, ensure that every input but finalized one
         // has the `non_witness_utxo`
-        if !sign_options.trust_witness_utxo
+        if !self.descriptor.is_tap() && !sign_options.trust_witness_utxo // TODO: should be separate for the two descriptors
             && psbt
                 .inputs
                 .iter()

         // <snip>

         let prev_output = utxo.outpoint;
         if let Some(prev_tx) = self.database.borrow().get_raw_tx(&prev_output.txid)? {
             if desc.is_witness() {
                 psbt_input.witness_utxo = Some(prev_tx.output[prev_output.vout as usize].clone());
             }
-            if !desc.is_witness() || !only_witness_utxo {
+            if (!desc.is_witness() || !only_witness_utxo) && !desc.is_tap() {
                 psbt_input.non_witness_utxo = Some(prev_tx);
             }
         }
```

## `descriptor!()` Macro

Finally, we update the `descriptor!()` macro to correctly parse `tr()` descriptors and the new `multi_a()` operator:

### `tr()` Descriptors

```diff
@@ -73,6 +73,38 @@ macro_rules! impl_top_level_pk {
     }};
 }

+#[doc(hidden)]
+#[macro_export]
+macro_rules! impl_top_level_tr {
+    ( $internal_key:expr, $tap_tree:expr ) => {{
+        use $crate::miniscript::descriptor::{Descriptor, DescriptorPublicKey, Tr};
+        use $crate::miniscript::Tap;
+
+        #[allow(unused_imports)]
+        use $crate::keys::{DescriptorKey, IntoDescriptorKey};
+        let secp = $crate::bitcoin::secp256k1::Secp256k1::new();
+
+        $internal_key
+            .into_descriptor_key()
+            .and_then(|key: DescriptorKey<Tap>| key.extract(&secp))
+            .map_err($crate::descriptor::DescriptorError::Key)
+            .and_then(|(pk, mut key_map, mut valid_networks)| {
+                let tap_tree = $tap_tree.map(|(tap_tree, tree_keymap, tree_networks)| {
+                    key_map.extend(tree_keymap.into_iter());
+                    valid_networks = $crate::keys::merge_networks(&valid_networks, &tree_networks);
+
+                    tap_tree
+                });
+
+                Ok((
+                    Descriptor::<DescriptorPublicKey>::Tr(Tr::new(pk, tap_tree)?),
+                    key_map,
+                    valid_networks,
+                ))
+            })
+    }};
+}
+
 #[doc(hidden)]
 #[macro_export]
 macro_rules! impl_leaf_opcode {
@@ -228,6 +260,62 @@ macro_rules! impl_sortedmulti {

 }

+#[doc(hidden)]
+#[macro_export]
+macro_rules! parse_tap_tree {
+    ( @merge $tree_a:expr, $tree_b:expr) => {{
+        use std::sync::Arc;
+        use $crate::miniscript::descriptor::TapTree;
+
+        $tree_a
+            .and_then(|tree_a| Ok((tree_a, $tree_b?)))
+            .and_then(|((a_tree, mut a_keymap, a_networks), (b_tree, b_keymap, b_networks))| {
+                a_keymap.extend(b_keymap.into_iter());
+                Ok((TapTree::Tree(Arc::new(a_tree), Arc::new(b_tree)), a_keymap, $crate::keys::merge_networks(&a_networks, &b_networks)))
+            })
+
+    }};
+
+    // Two sub-trees
+    ( { { $( $tree_a:tt )* }, { $( $tree_b:tt )* } } ) => {{
+        let tree_a = $crate::parse_tap_tree!( { $( $tree_a )* } );
+        let tree_b = $crate::parse_tap_tree!( { $( $tree_b )* } );
+
+        $crate::parse_tap_tree!(@merge tree_a, tree_b)
+    }};
+
+    // One leaf and a sub-tree
+    ( { $op_a:ident ( $( $minisc_a:tt )* ), { $( $tree_b:tt )* } } ) => {{
+        let tree_a = $crate::parse_tap_tree!( $op_a ( $( $minisc_a )* ) );
+        let tree_b = $crate::parse_tap_tree!( { $( $tree_b )* } );
+
+        $crate::parse_tap_tree!(@merge tree_a, tree_b)
+    }};
+    ( { { $( $tree_a:tt )* }, $op_b:ident ( $( $minisc_b:tt )* ) } ) => {{
+        let tree_a = $crate::parse_tap_tree!( { $( $tree_a )* } );
+        let tree_b = $crate::parse_tap_tree!( $op_b ( $( $minisc_b )* ) );
+
+        $crate::parse_tap_tree!(@merge tree_a, tree_b)
+    }};
+
+    // Two leaves
+    ( { $op_a:ident ( $( $minisc_a:tt )* ), $op_b:ident ( $( $minisc_b:tt )* ) } ) => {{
+        let tree_a = $crate::parse_tap_tree!( $op_a ( $( $minisc_a )* ) );
+        let tree_b = $crate::parse_tap_tree!( $op_b ( $( $minisc_b )* ) );
+
+        $crate::parse_tap_tree!(@merge tree_a, tree_b)
+    }};
+
+    // Single leaf
+    ( $op:ident ( $( $minisc:tt )* ) ) => {{
+        use std::sync::Arc;
+        use $crate::miniscript::descriptor::TapTree;
+
+        $crate::fragment!( $op ( $( $minisc )* ) )
+            .map(|(a_minisc, a_keymap, a_networks)| (TapTree::Leaf(Arc::new(a_minisc)), a_keymap, a_networks))
+    }};
+}
+
 #[doc(hidden)]
 #[macro_export]
 macro_rules! apply_modifier {
@@ -441,6 +529,15 @@ macro_rules! descriptor {
     ( wsh ( $( $minisc:tt )* ) ) => ({
         $crate::impl_top_level_sh!(Wsh, new, new_sortedmulti, Segwitv0, $( $minisc )*)
     });
+
+    ( tr ( $internal_key:expr ) ) => ({
+        $crate::impl_top_level_tr!($internal_key, None)
+    });
+    ( tr ( $internal_key:expr, $( $taptree:tt )* ) ) => ({
+        let tap_tree = $crate::parse_tap_tree!( $( $taptree )* );
+        tap_tree
+            .and_then(|tap_tree| $crate::impl_top_level_tr!($internal_key, Some(tap_tree)))
+    });
 }
```

The `parse_tap_tree!()` macro parses the second (and optional) argument of a `tr()` descriptor: curly brackets are used to build a tree of descriptor. The macro matches the four possible cases individually:

1. Two sub-trees: `{{ "\{\{...}{...\}\}" }}`
2. Operator on the left side, sub-tree on the right: `{op(),{...}`
3. Operator on the right side, sub-tree on the left: `{{...},op()}`
4. Just a single operator: `op()`

In the main `descriptor!()` macro we add two new variant:

- One matches the simple "single-key" taproot descriptor: `tr(internal_key)`
- The other one matches a key and a taptree: `tr(internal_key,{...})`

### `multi_a()` Operator

```diff
@@ -480,6 +577,23 @@ impl<A, B, C> From<(A, (B, (C, ())))> for TupleThree<A, B, C> {
     }
 }

+#[doc(hidden)]
+#[macro_export]
+macro_rules! group_multi_keys {
+    ( $( $key:expr ),+ ) => {{
+        use $crate::keys::IntoDescriptorKey;
+
+        let keys = vec![
+            $(
+                $key.into_descriptor_key(),
+            )*
+        ];
+
+        keys.into_iter().collect::<Result<Vec<_>, _>>()
+            .map_err($crate::descriptor::DescriptorError::Key)
+    }};
+}
+
 #[doc(hidden)]
 #[macro_export]
 macro_rules! fragment_internal {
@@ -640,21 +754,22 @@ macro_rules! fragment {
             .and_then(|items| $crate::fragment!(thresh_vec($thresh, items)))
     });
     ( multi_vec ( $thresh:expr, $keys:expr ) ) => ({
-        $crate::keys::make_multi($thresh, $keys)
+        let secp = $crate::bitcoin::secp256k1::Secp256k1::new();
+
+        $crate::keys::make_multi($thresh, $crate::miniscript::Terminal::Multi, $keys, &secp)
     });
     ( multi ( $thresh:expr $(, $key:expr )+ ) ) => ({
-        use $crate::keys::IntoDescriptorKey;
+        $crate::group_multi_keys!( $( $key ),* )
+            .and_then(|keys| $crate::fragment!( multi_vec ( $thresh, keys ) ))
+    });
+    ( multi_a_vec ( $thresh:expr, $keys:expr ) ) => ({
         let secp = $crate::bitcoin::secp256k1::Secp256k1::new();

-        let keys = vec![
-            $(
-                $key.into_descriptor_key(),
-            )*
-        ];
-
-        keys.into_iter().collect::<Result<Vec<_>, _>>()
-            .map_err($crate::descriptor::DescriptorError::Key)
-            .and_then(|keys| $crate::keys::make_multi($thresh, keys, &secp))
+        $crate::keys::make_multi($thresh, $crate::miniscript::Terminal::MultiA, $keys, &secp)
+    });
+    ( multi_a ( $thresh:expr $(, $key:expr )+ ) ) => ({
+        $crate::group_multi_keys!( $( $key ),* )
+            .and_then(|keys| $crate::fragment!( multi_a_vec ( $thresh, keys ) ))
     });

     // `sortedmulti()` is handled separately
```

To share the code with the `multi_vec()` operator we create an external macro to group a vec of keys, and then use it in both places. We also generalize the `make_multi()` function, so that it returns a
`Terminal::Multi()` when used with `multi()` or `multi_vec()` and `Terminal::MultiA()` when used with `multi_a()` or `multi_a_vec()`:

```diff
@@ -769,13 +769,18 @@ pub fn make_pkh<Pk: IntoDescriptorKey<Ctx>, Ctx: ScriptContext>(

 // Used internally by `bdk::fragment!` to build `multi()` fragments
 #[doc(hidden)]
-pub fn make_multi<Pk: IntoDescriptorKey<Ctx>, Ctx: ScriptContext>(
+pub fn make_multi<
+    Pk: IntoDescriptorKey<Ctx>,
+    Ctx: ScriptContext,
+    V: Fn(usize, Vec<DescriptorPublicKey>) -> Terminal<DescriptorPublicKey, Ctx>,
+>(
     thresh: usize,
+    variant: V,
     pks: Vec<Pk>,
     secp: &SecpCtx,
 ) -> Result<(Miniscript<DescriptorPublicKey, Ctx>, KeyMap, ValidNetworks), DescriptorError> {
     let (pks, key_map, valid_networks) = expand_multi_keys(pks, secp)?;
-    let minisc = Miniscript::from_ast(Terminal::Multi(thresh, pks))?;
+    let minisc = Miniscript::from_ast(variant(thresh, pks))?;

     minisc.check_minsicript()?;
```

And this concludes our journey into the deep technical details of taproot and BDK!

With this changes all it took to make our taproot transaction was:

```rust
let unspendable_key = bitcoin::PublicKey::from_str("020000000000000000000000000000000000000000000000000000000000000001").unwrap();
let taproot_key = bitcoin::PrivateKey::from_str("<redacted>").unwrap();
let taproot_key_2 = bitcoin::PrivateKey::from_str("<redacted>").unwrap();
let wallet = Wallet::new(
    bdk::descriptor!(tr(unspendable_key,multi_a(1,taproot_key,taproot_key_2)))?,
    None,
    Network::Bitcoin,
    MemoryDatabase::new(),
    Arc::clone(&blockchain),
)?;

wallet.sync(noop_progress(), None)?;
println!("wallet balance: {}", wallet.get_balance()?);

let (mut psbt, details) = {
    let mut builder = wallet.build_tx();
    builder
        .drain_to(p2pkh_addr.script_pubkey())
        .add_data("gm taproot \u{1F955} https://bitcoindevkit.org".as_bytes())
        .ordering(TxOrdering::Untouched)
        .drain_wallet()
        .enable_rbf()
        .fee_rate(fee_rate);
    builder.finish()?
};

assert!(wallet.sign(&mut psbt, SignOptions::default())?);
wallet.broadcast(&psbt.extract_tx())?;
```

[Part 1]: /blog/2021/11/first-bdk-taproot-tx-look-at-the-code-part-1
