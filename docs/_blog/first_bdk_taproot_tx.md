---
title: "The first BDK Taproot TX: a look at the code (Part 1)"
description: "A quick overview of the changes made to bdk, rust-miniscript and rust-bitcoin to make a Taproot transaction"
authors:
    - Alekos Filini
date: "2021-11-15"
tags: ["BDK", "taproot", "miniscript"]
permalink: "/blog/2021/11/first-bdk-taproot-tx-look-at-the-code-part-1"
---

This is the first of a two-parts blog series in which I will try to explain all the changes that I made to BDK (and some of its dependencies) to make our first Taproot transaction in mainnet, which also
turned out to be the first ever use of the new `OP_CHECKSIGADD` opcode.

Hopefully this will give an insight into what kind of changes need to be made to a wallet in order to support spending `P2TR` outputs, both with key-spend and script-spend. BDK actually delegates
most of the hard work to rust-miniscript, and luckily most of the Taproot code was already implemented by the time I started working on it. I only had to patch a few little bugs here and there, and it ended up
working flawlessly in the end.

In this first part I will focus on the changes made to our dependencies, rust-bitcoin and rust-miniscript. In the second part I will talk about BDK itself.

## Backstory

On the evening of Thursday, November 11th I was attending our weekly Satoshi Spritz meetup in Milan. The activation of Taproot was right around the corner, and naturally that was the main discussion
topic that night. The activation was forecasted for the early afternoon of Sunday, November 14th, a little less than 72h later.

I began to wonder how hard it would be to patch BDK and add support for Taproot. I knew most of the work had already been done in our main dependencies, rust-bitcoin and rust-miniscript, and so I decided
to challenge myself: could I make it in time for the activation?

The following day I started digging into the topic. It didn't help that up until that time I only had a rather "high level" idea of how Taproot worked, but luckily all the BIPs were very well written and
straightforward to understand.

By Friday night (or rather, early Saturday morning) I had Taproot key-spend working, which made me pretty optimistic even though the activation date was actually moving closer, now being forecasted for
Sunday *morning*.

After a few hours of sleep I went back to work and by early Saturday afternoon I had Taproot key-spend working as well. This left me a few hours to coordinate with some friends and generate a vanity address
to deposit funds into temporarily, as we didn't trust sending them to Taproot addresses before the activation (as they were anyone-can-spend according to the pre-activation rules).

After another pretty short night, I woke up a 5:30 AM on Sunday to monitor the activation. I broadcasted our transactions shortly after 6:00 AM as the activation block was being mined. Unfortunately, the first
three blocks that were enforcing Taproot rules didn't include any Taproot transaction, which indicates that the miners weren't actually running the new Bitcoin Core 22.0 nodes. The fourth block, mined by Foundry
USA included my transaction and a few others.

In the end our transaction was the third Taproot script-spend in the block, but the first to use the new `OP_CHECKSIGADD` opcode, as the two preceeding it were respectively a single-sig and a 2-of-2 multisig
script, made with with two `OP_CHECKSIG(VERIFY)`s.

Now, with the context out of the way, we can begin talking about the code!

## rust-bitcoin

The first dependency I had to update was rust-bitcoin. Most of the taproot stuff were already merged in `master` (altough they hadn't been released yet). One notable missing part was the support for `BIP371`,
which is an extension of `BIP174`, aka the `Partially Signed Bitcoin Transaction` BIP. This new BIP defines a few new fields that are required to properly handle Taproot transactions.

Luckily most of the work had already been done by sanket1729, so I forked his branch and made only few very minor changes, just to expose a structure that I will have to use later which in his code wasn't `public`.

You can find all the commits mentioned here in my rust-bitcoin `taproot-testing` branch.

```
$ git diff 187234f f830df9
```

```diff
diff --git a/src/lib.rs b/src/lib.rs
index 87d9c36..d5e5802 100644
--- a/src/lib.rs
+++ b/src/lib.rs
@@ -54,7 +54,6 @@
 #![deny(unused_mut)]
 #![deny(dead_code)]
 #![deny(unused_imports)]
-#![deny(missing_docs)]
 #![deny(unused_must_use)]
 #![deny(broken_intra_doc_links)]

diff --git a/src/util/taproot.rs b/src/util/taproot.rs
index 674eeee..3d56cbc 100644
--- a/src/util/taproot.rs
+++ b/src/util/taproot.rs
@@ -440,7 +440,7 @@ impl TaprootBuilder {
 // Internally used structure to represent the node information in taproot tree
 #[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
 #[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]
-pub(crate) struct NodeInfo {
+pub struct NodeInfo {
     /// Merkle Hash for this node
     pub(crate) hash: sha256::Hash,
     /// information about leaves inside this node
@@ -448,8 +448,12 @@ pub(crate) struct NodeInfo {
 }

 impl NodeInfo {
+    pub fn hash(&self) -> &sha256::Hash {
+        &self.hash
+    }
+
     // Create a new NodeInfo with omitted/hidden info
-    fn new_hidden(hash: sha256::Hash) -> Self {
+    pub fn new_hidden(hash: sha256::Hash) -> Self {
         Self {
             hash: hash,
             leaves: vec![],
@@ -457,7 +461,7 @@ impl NodeInfo {
     }

     // Create a new leaf with NodeInfo
-    fn new_leaf_with_ver(script: Script, ver: LeafVersion) -> Self {
+    pub fn new_leaf_with_ver(script: Script, ver: LeafVersion) -> Self {
         let leaf = LeafInfo::new(script, ver);
         Self {
             hash: leaf.hash(),
@@ -466,7 +470,7 @@ impl NodeInfo {
     }

     // Combine two NodeInfo's to create a new parent
-    fn combine(a: Self, b: Self) -> Result<Self, TaprootBuilderError> {
+    pub fn combine(a: Self, b: Self) -> Result<Self, TaprootBuilderError> {
         let mut all_leaves = Vec::with_capacity(a.leaves.len() + b.leaves.len());
         for mut a_leaf in a.leaves {
             a_leaf.merkle_branch.push(b.hash)?; // add hashing partner

```

There isn't much to explain here: I disabled the `missing_docs` lint so that the compiler wouldn't complain about the new public methods that aren't documented.
Then, I added a getter for the `hash` field of `NodeInfo` and made the strcut itself and a bunch of methods public.

We will use this structure later to recover the merkle root of a Taproot script tree, given one leaf and the other "hidden" branches.

## rust-miniscript

Moving on to rust-miniscript: once again, most of the work required to support Taproot had already been done by sanket1729, but this time I was working with very "early" prototype-like code, so I was prepared to
make some changes to the code to get it to work how I wanted.

Instead of showing one big diff I will talk about the commits individually, which I think will help making more clear what I was doing.

Once again, you can find all the commits referenced here in my rust-miniscript `taproot` branch.

```
$ git show 34cf15b
```

```diff
commit 34cf15b3aac1d8c2693af1b9749b888f3f29e510
Author: Alekos Filini <alekos.filini@gmail.com>
Date:   Fri Nov 12 12:06:35 2021 +0100

    Fix TapTree iter depth

diff --git a/src/descriptor/tr.rs b/src/descriptor/tr.rs
index 79d3c05..314c7f4 100644
--- a/src/descriptor/tr.rs
+++ b/src/descriptor/tr.rs
@@ -65,7 +65,7 @@ impl<Pk: MiniscriptKey> TapTree<Pk> {
 
     /// Iterate over all miniscripts
     pub fn iter(&self) -> TapTreeIter<Pk> {
-        TapTreeIter { stack: vec![self] }
+        TapTreeIter { stack: vec![(0, self)] }
     }
 
     // Helper function to translate keys
@@ -262,7 +262,7 @@ pub struct TapTreeIter<'a, Pk: MiniscriptKey>
 where
     Pk: 'a,
 {
-    stack: Vec<&'a TapTree<Pk>>,
+    stack: Vec<(usize, &'a TapTree<Pk>)>,
 }
 
 impl<'a, Pk> Iterator for TapTreeIter<'a, Pk>
@@ -273,13 +273,13 @@ where
 
     fn next(&mut self) -> Option<Self::Item> {
         while !self.stack.is_empty() {
-            let last = self.stack.pop().expect("Size checked above");
+            let (depth, last) = self.stack.pop().expect("Size checked above");
             match &*last {
                 TapTree::Tree(l, r) => {
-                    self.stack.push(&r);
-                    self.stack.push(&l);
+                    self.stack.push((depth + 1, &r));
+                    self.stack.push((depth + 1, &l));
                 }
-                TapTree::Leaf(ref ms) => return Some((self.stack.len(), ms)),
+                TapTree::Leaf(ref ms) => return Some((depth, ms)),
             }
         }
         None
```

`TapTreeIterator` is an iterator that goes through a `TapTree` and yields a `(depth, node)` pair. This is then fed to `TaprootBuilder` (src/descriptor/tr.rs#183), which returns an error if trying to insert nodes
in an order that is not DFS.

The way the depth was computed before made the builder always fail for non-trivial trees (i.e. more than 1 node).

Here I decided to play the safe card, and just keep track of the depth explicitly: I think there might be a way to compute the depth just knowing the `self.stack.len()` (assuming the tree has a specific structure,
which I'm not sure applies here), but anyway I didn't have much time to think about it and I just went for the "dumb but idiot-proof" way which ended up working fine.

```
$ git show f4a3459
```

```diff
commit f4a3459128e37ca0c2701b8b6da064d4952296ff
Author: Alekos Filini <alekos.filini@gmail.com>
Date:   Sat Nov 13 14:15:52 2021 +0100

    Switch rust-bitcoin rev

diff --git a/Cargo.toml b/Cargo.toml
index 12825e8..8240024 100644
--- a/Cargo.toml
+++ b/Cargo.toml
@@ -17,7 +17,7 @@ rand = ["bitcoin/rand"]

 [dependencies]
 # bitcoin = "0.27"
-bitcoin = {git = "https://github.com/sanket1729/rust-bitcoin", branch = "taproot_psbt"}
+bitcoin = { git = "https://github.com/afilini/rust-bitcoin.git", branch = "taproot-testing" }

 [dependencies.serde]
 version = "1.0"
```

Trivial commit, switch to my fork of `rust-bitcoin` so that I can make changes if necessary.

```
$ git show 0446b16
```

```diff
commit 0446b1631cec9f7118d46f0f4c94ccd20de29f94
Author: Alekos Filini <alekos.filini@gmail.com>
Date:   Sat Nov 13 14:25:18 2021 +0100

    Parse x-only keys

diff --git a/src/descriptor/key.rs b/src/descriptor/key.rs
index 4108d00..b7f90b5 100644
--- a/src/descriptor/key.rs
+++ b/src/descriptor/key.rs
@@ -283,9 +283,9 @@ impl FromStr for DescriptorPublicKey {

     fn from_str(s: &str) -> Result<Self, Self::Err> {
         // A "raw" public key without any origin is the least we accept.
-        if s.len() < 66 {
+        if s.len() < 64 {
             return Err(DescriptorKeyParseError(
-                "Key too short (<66 char), doesn't match any format",
+                "Key too short (<64 char), doesn't match any format",
             ));
         }

@@ -301,6 +301,14 @@ impl FromStr for DescriptorPublicKey {
                 derivation_path,
                 wildcard,
             }))
+        } else if key_part.len() == 64 {
+            // x-only pubkey, prefix it with `02`
+            let key = bitcoin::PublicKey::from_str(&format!("02{}", key_part))
+                .map_err(|_| DescriptorKeyParseError("Error while parsing x-only public key"))?;
+            Ok(DescriptorPublicKey::SinglePub(DescriptorSinglePub {
+                key,
+                origin,
+            }))
         } else {
             if key_part.len() >= 2
                 && !(&key_part[0..2] == "02" || &key_part[0..2] == "03" || &key_part[0..2] == "04")
diff --git a/src/lib.rs b/src/lib.rs
index e168b16..3a2335e 100644
--- a/src/lib.rs
+++ b/src/lib.rs
@@ -95,8 +95,6 @@
 #![deny(non_snake_case)]
 #![deny(unused_mut)]
 #![deny(dead_code)]
-#![deny(unused_imports)]
-#![deny(missing_docs)]

 pub extern crate bitcoin;
 #[cfg(feature = "serde")]
```

This, I'm not really sure of: Taproot uses x-only public keys, which means that the first byte (which is usually a `03` or a `02`) that indicates the parity of the EC point is completely dropped, and it's implicit
that the point is even (= `02`). Check out BIP340 for a much better explanation.

So here when I find a string that is only 64 characters long I will assume it's an x-only pubkey, and I will parse it as a normal `bitcoin::PublicKey` by prefixing it with `02`.

I guess one alternative could have been to try and parse it as a `schnorr::PublicKey` and then "convert" it to a `ecdsa::PublicKey` which should be supported, but once again I just wanted to get it done quickly and
this worked fine.

I also disabled the `unused_imports` and `missing_docs` lint so that the compiler wouldn't whine too much.

```
$ git show 87316ff
```

```diff
commit 87316fffd06ab3bdf300fd1a958ddaa2789a6696
Author: Alekos Filini <alekos.filini@gmail.com>
Date:   Sat Nov 13 14:26:01 2021 +0100

    Parse `tr()` descriptors

diff --git a/src/descriptor/mod.rs b/src/descriptor/mod.rs
index 06d98e1..4190786 100644
--- a/src/descriptor/mod.rs
+++ b/src/descriptor/mod.rs
@@ -610,6 +610,7 @@ where
             ("wpkh", 1) => Descriptor::Wpkh(Wpkh::from_tree(top)?),
             ("sh", 1) => Descriptor::Sh(Sh::from_tree(top)?),
             ("wsh", 1) => Descriptor::Wsh(Wsh::from_tree(top)?),
+            ("tr", _) => Descriptor::Tr(Tr::from_tree(top)?),
             _ => Descriptor::Bare(Bare::from_tree(top)?),
         })
     }
diff --git a/src/expression.rs b/src/expression.rs
index 1cef614..11a68d3 100644
--- a/src/expression.rs
+++ b/src/expression.rs
@@ -100,7 +100,12 @@ impl<'a> Tree<'a> {

                 sl = &sl[n + 1..];
                 loop {
-                    let (arg, new_sl) = Tree::from_slice_helper_round(sl, depth + 1)?;
+                    let (arg, new_sl) = if sl.contains('{') {
+                        Tree::from_slice_helper_curly(sl, depth + 1)?
+                    } else {
+                        Tree::from_slice_helper_round(sl, depth + 1)?
+                    };
+
                     ret.args.push(arg);

                     if new_sl.is_empty() {
```

When trying to parse a descriptor (essentially turning a recursive string of `operator(args)` into an abstract tree in memory) use a *curly-bracket-aware* parser if there is one in the string.

The code to then build a `Tr` struct given an `expression::Tree` (and the `from_slice_helper_curly` function) were already implemented by sanket1729, so it was just a matter of correctly
building the abstract tree by parsing curly brackets in descriptors.

```
$ git show 3055cab
```

```diff
commit 3055cabef8bd51eda344ce501b03c533fd367b4f
Author: Alekos Filini <alekos.filini@gmail.com>
Date:   Sat Nov 13 14:26:30 2021 +0100

    Fix control block creation when satisfying `Tr`

diff --git a/src/descriptor/tr.rs b/src/descriptor/tr.rs
index 314c7f4..8487d56 100644
--- a/src/descriptor/tr.rs
+++ b/src/descriptor/tr.rs
@@ -571,17 +571,14 @@ impl<Pk: MiniscriptKey> DescriptorTrait<Pk> for Tr<Pk> {
                 } else {
                     let ver = LeafVersion::default();
                     let leaf_script = (ms.encode(), ver);
-                    let control_block_set = spend_info
-                        .as_script_map()
-                        .get(&leaf_script)
-                        .expect("Control block must exist in script map for every known leaf");
+                    // let control_block_set = spend_info
+                    //     .as_script_map()
+                    //     .get(&leaf_script)
+                    //     .expect("Control block must exist in script map for every known leaf");
+                    let control_block = spend_info.control_block(&leaf_script).expect("Control block must exist in script map for every known leaf");
                     wit.push(leaf_script.0.into_bytes()); // Push the leaf script
                                                           // There can be multiple control blocks for a (script, ver) pair
                                                           // Find the smallest one amongst those
-                    let control_block = control_block_set
-                        .iter()
-                        .min_by(|x, y| x.as_inner().len().cmp(&y.as_inner().len()))
-                        .expect("Atleast one control must exist for a known leaf");
                     wit.push(control_block.serialize());
                     // Finally, save the minimum
                     min_wit = Some(wit);

```

This is where things get more interesting: this section of code builds the witness to satisfy a Taproot descriptor. In case of a script-spend, we need to prove that the script we are using had been commited
into the public key of our `P2TR` input. We do this by adding a "control block", that contains data about the parity of the key, the leaf version used, and the merkle path from the leaf we are using to spend
up to the merkle root, which is committed into the public key.

Before my patch the code was only getting the set of merkle paths that could lead from the root to the leaves that contain a given script. For context, the signature of `TaprootSpendInfo::as_script_map(&self)` is:

```rust
/// Access the internal script map
pub fn as_script_map(&self) -> &BTreeMap<(Script, LeafVersion), BTreeSet<TaprootMerkleBranch>> {}
```

Then the code would look for the "shortest" path to that specific script, as it would save size in the final transaction (leaves that are more "deep" in the tree than others naturally have more hidden branches
in their path to the root, and thus require a longer control block to reveal them all).

The issue here is that the `control_block` variable is then serialized directly into the witness. But this is not a control block, it's just a set of merkle paths! A control block only has *one* merkle path, and
incldues the leaf version and the key parity bit.

Conveniently, the `TaprootSpendInfo` struct also has this other method (I'm including the implementation as well, because it shows that internally it does the same "trick" to find the shortest path):

```rust
/// Obtain a [`ControlBlock`] for particular script with the given version.
/// Returns [`None`] if the script is not contained in the [`TaprootSpendInfo`]
/// If there are multiple ControlBlocks possible, this returns the shortest one.
pub fn control_block(&self, script_ver: &(Script, LeafVersion)) -> Option<ControlBlock> {
    let merkle_branch_set = self.script_map.get(script_ver)?;
    // Choose the smallest one amongst the multiple script maps
    let smallest = merkle_branch_set
        .iter()
        .min_by(|x, y| x.0.len().cmp(&y.0.len()))
        .expect("Non-empty iterator");
    Some(ControlBlock {
        internal_key: self.internal_key,
        output_key_parity: self.output_key_parity,
        leaf_version: LeafVersion::default(),
        merkle_branch: smallest.clone(),
    })
}
```

So to fix this code we just have to use that method instead, and we can get it done in one single line!

Instead of removing the old code at the time I only commented it out, because I initially thought I would still have to look for the shortest script myself, and I figured the "sorting" code would come in handy
later on.

Also, if you are an acute observer, you might have noticed that there's a bug in this last snippet of code. Feel free to think about it a little bit, then check out the [PR][fix-control-block-bug-pr] I made
if you wanna know the answer!

```
git show 35378ad
```

```diff
commit 35378ad01a6f2b8161a3f36448b24d031f8aeaec
Author: Alekos Filini <alekos.filini@gmail.com>
Date:   Sat Nov 13 14:27:14 2021 +0100

    Consider key-spend max satisfaction weight

diff --git a/src/descriptor/tr.rs b/src/descriptor/tr.rs
index 8487d56..fabf860 100644
--- a/src/descriptor/tr.rs
+++ b/src/descriptor/tr.rs
@@ -593,7 +593,7 @@ impl<Pk: MiniscriptKey> DescriptorTrait<Pk> for Tr<Pk> {
     }

     fn max_satisfaction_weight(&self) -> Result<usize, Error> {
-        let mut max_wieght = None;
+        let mut max_wieght = Some(65);
         for (depth, ms) in self.iter_scripts() {
             let script_size = ms.script_size();
             let max_sat_elems = match ms.max_satisfaction_witness_elements() {
```

This is a little bug in the code that tries to compute what the maximum satisfaction weight would be for a descriptor. For instance, we use this in BDK to compute how many extra sats of fees we need to pay
in order to target a given fee rate, assuming the descriptor is satisfied with the worst (larger and most expensive) path.

For Taproot descriptors, it's just a matter of iterating over the leaves in the tree and pick the most expensive one... or is it? This doesn't take into account that Taproot outputs can also be spent with
key-spend, which means just pushing a signature to the witness. This signature is 64 bytes long when using the new `SIGHASH_DEFAULT` sighash, or 65 otherwise. Since we are thinking about the maximum satisfaction
weight, or the worst case possible, we natuarlly pick the latter.

Note that theoretically you could build a Taproot address "without" an available key-path spend (by using an unspendable Schnorr public key), but the code here in rust-miniscript doesn't take that into
account, as there's no way that I'm aware of to specificy in a `tr()` descriptor that the key is unspendable. So, while theoretically here we should first check whether the key-spend path is available before
accounting for its weight, in practice this is always true in miniscript so we just use that as our starting worst case and update it later if necessary while iterating the tree leaves.

```
$ git show b4878f8
```

```diff
commit b4878f816e9ede11d5ed947c06e03aa988e3e26f
Author: Alekos Filini <alekos.filini@gmail.com>
Date:   Sat Nov 13 14:27:53 2021 +0100

    Look for taproot stuff in psbts

diff --git a/src/psbt/mod.rs b/src/psbt/mod.rs
index 9a8b17d..42c6ce8 100644
--- a/src/psbt/mod.rs
+++ b/src/psbt/mod.rs
@@ -25,13 +25,14 @@ use bitcoin;
 use bitcoin::hashes::{hash160, ripemd160, sha256, sha256d};
 use bitcoin::secp256k1::{self, Secp256k1};
 use bitcoin::util::psbt::PartiallySignedTransaction as Psbt;
+use bitcoin::util::taproot::TapLeafHash;
 use bitcoin::Script;

 use interpreter;
 use miniscript::limits::SEQUENCE_LOCKTIME_DISABLE_FLAG;
 use miniscript::satisfy::{After, Older};
 use Satisfier;
-use {BitcoinECSig, Preimage32};
+use {BitcoinECSig, BitcoinSchnorrSig, Preimage32};
 use {MiniscriptKey, ToPublicKey};

 mod finalizer;
@@ -231,6 +232,24 @@ impl<'psbt> PsbtInputSatisfier<'psbt> {
 }

 impl<'psbt, Pk: MiniscriptKey + ToPublicKey> Satisfier<Pk> for PsbtInputSatisfier<'psbt> {
+    fn lookup_tap_key_spend_sig(&self) -> Option<BitcoinSchnorrSig> {
+        if let Some((sig, hash_ty)) = self.psbt.inputs[self.index].tap_key_sig {
+            Some(BitcoinSchnorrSig { sig, hash_ty })
+        } else {
+            None
+        }
+    }
+
+    fn lookup_tap_leaf_script_sig(&self, pk: &Pk, lh: &TapLeafHash) -> Option<BitcoinSchnorrSig> {
+        let pk = pk.to_x_only_pubkey();
+
+        if let Some((sig, hash_ty)) = self.psbt.inputs[self.index].tap_script_sigs.get(&(pk, *lh)) {
+            Some(BitcoinSchnorrSig { sig: *sig, hash_ty: *hash_ty })
+        } else {
+            None
+        }
+    }
+
     fn lookup_ec_sig(&self, pk: &Pk) -> Option<BitcoinECSig> {
         if let Some(rawsig) = self.psbt.inputs[self.index]
             .partial_sigs
```

This commit implements the Taproot-specific `Satisfier` methods on `PsbtInputSatisfier`. The code to produce a valid witness (i.e. *satisfy*) a descriptor by looking for Taproot key-spend or script-spend signatures
is already implemented, so it's just a matter of actually returning those, if they are present in a PSBT.

```
$ git show 80da0ba
```

```diff
commit 80da0ba9b742b2dee23e7302e2f95a6e96b1d6ed
Author: Alekos Filini <alekos.filini@gmail.com>
Date:   Sat Nov 13 16:54:27 2021 +0100

    Iter keys in `MultiA`

diff --git a/src/miniscript/iter.rs b/src/miniscript/iter.rs
index 36c4b69..a54a371 100644
--- a/src/miniscript/iter.rs
+++ b/src/miniscript/iter.rs
@@ -121,7 +121,7 @@ impl<Pk: MiniscriptKey, Ctx: ScriptContext> Miniscript<Pk, Ctx> {
     pub fn get_leaf_pk(&self) -> Vec<Pk> {
         match self.node {
             Terminal::PkK(ref key) => vec![key.clone()],
-            Terminal::Multi(_, ref keys) => keys.clone(),
+            Terminal::Multi(_, ref keys) | Terminal::MultiA(_, ref keys) => keys.clone(),
             _ => vec![],
         }
     }
@@ -139,7 +139,7 @@ impl<Pk: MiniscriptKey, Ctx: ScriptContext> Miniscript<Pk, Ctx> {
         match self.node {
             Terminal::PkH(ref hash) => vec![hash.clone()],
             Terminal::PkK(ref key) => vec![key.to_pubkeyhash()],
-            Terminal::Multi(_, ref keys) => keys.iter().map(Pk::to_pubkeyhash).collect(),
+            Terminal::Multi(_, ref keys) | Terminal::MultiA(_, ref keys) => keys.iter().map(Pk::to_pubkeyhash).collect(),
             _ => vec![],
         }
     }
@@ -155,7 +155,7 @@ impl<Pk: MiniscriptKey, Ctx: ScriptContext> Miniscript<Pk, Ctx> {
         match self.node {
             Terminal::PkH(ref hash) => vec![PkPkh::HashedPubkey(hash.clone())],
             Terminal::PkK(ref key) => vec![PkPkh::PlainPubkey(key.clone())],
-            Terminal::Multi(_, ref keys) => keys
+            Terminal::Multi(_, ref keys) | Terminal::MultiA(_, ref keys) => keys
                 .into_iter()
                 .map(|key| PkPkh::PlainPubkey(key.clone()))
                 .collect(),
@@ -170,7 +170,7 @@ impl<Pk: MiniscriptKey, Ctx: ScriptContext> Miniscript<Pk, Ctx> {
     pub fn get_nth_pk(&self, n: usize) -> Option<Pk> {
         match (&self.node, n) {
             (&Terminal::PkK(ref key), 0) => Some(key.clone()),
-            (&Terminal::Multi(_, ref keys), _) => keys.get(n).cloned(),
+            (&Terminal::Multi(_, ref keys), _) | (&Terminal::MultiA(_, ref keys), _) => keys.get(n).cloned(),
             _ => None,
         }
     }
@@ -186,7 +186,7 @@ impl<Pk: MiniscriptKey, Ctx: ScriptContext> Miniscript<Pk, Ctx> {
         match (&self.node, n) {
             (&Terminal::PkH(ref hash), 0) => Some(hash.clone()),
             (&Terminal::PkK(ref key), 0) => Some(key.to_pubkeyhash()),
-            (&Terminal::Multi(_, ref keys), _) => keys.get(n).map(Pk::to_pubkeyhash),
+            (&Terminal::Multi(_, ref keys), _) | (&Terminal::MultiA(_, ref keys), _) => keys.get(n).map(Pk::to_pubkeyhash),
             _ => None,
         }
     }
@@ -199,7 +199,7 @@ impl<Pk: MiniscriptKey, Ctx: ScriptContext> Miniscript<Pk, Ctx> {
         match (&self.node, n) {
             (&Terminal::PkH(ref hash), 0) => Some(PkPkh::HashedPubkey(hash.clone())),
             (&Terminal::PkK(ref key), 0) => Some(PkPkh::PlainPubkey(key.clone())),
-            (&Terminal::Multi(_, ref keys), _) => {
+            (&Terminal::Multi(_, ref keys), _) | (&Terminal::MultiA(_, ref keys), _) => {
                 keys.get(n).map(|key| PkPkh::PlainPubkey(key.clone()))
             }
             _ => None,
```

Taproot descriptors add a new miniscript operator called `multi_a()` which behaves like `multi()` in non-Taproot descriptors, but uses the new `OP_CHECKSIGADD` opcode when serialized in a script.

When this was added, somebody forgot to update the various methods that iterate over the public keys of a descriptor to correctly return the keys contained in `multi_a()` - essentially, it was falling back in
the default case used by the operators that don't contain any key, but this one does!

```
$ git show 8b108c5
```

```diff
commit 8b108c5c0bf50b66b7220746525742b71f6cd4b4
Author: Alekos Filini <alekos.filini@gmail.com>
Date:   Sat Nov 13 17:26:53 2021 +0100

    Fix witness generation for `MultiA`

diff --git a/src/miniscript/satisfy.rs b/src/miniscript/satisfy.rs
index 655436e..ab43707 100644
--- a/src/miniscript/satisfy.rs
+++ b/src/miniscript/satisfy.rs
@@ -1264,7 +1264,7 @@ impl Satisfaction {
                 // Collect all available signatures
                 let mut sig_count = 0;
                 let mut sigs = vec![vec![vec![]]; keys.len()];
-                for (i, pk) in keys.iter().enumerate() {
+                for (i, pk) in keys.iter().rev().enumerate() {
                     match Witness::signature::<_, _, Ctx>(stfr, pk, leaf_hash) {
                         Witness::Stack(sig) => {
                             sigs[i] = sig;
```

And finally, the last little fix: the `multi_a()` operator is satisfied by pushing to the witness either a signature (if you have one available for that specific public key) or an empty stack element. The problem is,
they have to be in the right order to match the order of public keys in your Taproot script.

rust-miniscript was pushing them in reverse order, so script validation was always failing for multisigs that had more than 1 key. Adding a `.rev()` to the iterator fixed the issue.

## Conclusion

And that was it! We now have a fully working rust-bitcoin and rust-miniscript ready for Taproot.

In Part 2 I will go over the code changes in BDK, but I think it's now time for you and I to take a break :)

[fix-control-block-bug-pr]: https://github.com/rust-bitcoin/rust-bitcoin/pull/703
