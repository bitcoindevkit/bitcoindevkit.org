---
title: "Miniscript Policy & Descriptors - Hidden Powers of Bitcoin"
description: "Introduction to Descriptor and Miniscript, making a Multisig Wallet and Testing Miniscript Policies"
authors:
    - Sandipan Dey
date: "2021-08-06"
tags: ["tutorial", "bdk", "bdk-cli", "miniscript", "descriptor", "bitcoin-cli"]
hidden: true
draft: false
---

To send people BTC - we simply scan a QR Code *(or paste an address)*, enter some amount and *whoosh* - sent!
Users might think, just like traditional currency, we can only exchange money using Bitcoin.
As it so happens, the underlying technology Bitcoin supports specify outputs not as addresses, but as programming scripts.
This opens us to a world of possibilities using Bitcoin.

### Script

Bitcoin supports [Script](https://en.bitcoin.it/wiki/Script), a **stack-based** lightweight programming language.
Any script written in **Script** *(pun intended)* contains only `OP_*` codes that Bitcoin Full Nodes understand and process.
Currently, there are `186` op-codes in use.
You can find a list of the op-codes straight from `bitcoin-core` code repository [here](https://github.com/bitcoin/bitcoin/blob/master/src/script/script.h#L65-L204).

Script is intentionally left [Turing incomplete](https://en.wikipedia.org/wiki/Turing_completeness) which is why there is no [halting problem](https://en.wikipedia.org/wiki/Halting_problem) with scripts.
There are no loops and overall, it's a very constrained programming language.

A transaction is considered valid only when an Output Script returns `true` at the end of execution.
Output Scripts define the conditions under which the coins associated with them can be spent.
Really, to spend the output of a particular coin implies finding an input *(signature)* that makes a particular script evaluate to `true`.

For example, a basic legacy `Pay-to-PubKey-Hash` transaction would look like:

```script
scriptPubKey: OP_DUP OP_HASH160 <pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG
scriptSig: <sig> <pubKey>
```

##### Examples of things achievable using Bitcoin Script:

1. `Pay Someone (p2pkh/p2wpkh)` - A specific public key must sign to use the coins.
2. `Escrow (2-of-3-multisig)` - Two parties need to sign together to use the coins.
3. `Vault (locked)` - A specific key will not be able to use the coins for some time but another master key will always be able to use them.
4. `HTLC` - The receiver needs to ACK the tx before a time, else the coins are transferred back to the payee.

##### Motivation for Policies

Unfortunately, due to its low-level and unusual stack-based nature, Script is pretty hard to reason about and use.
Despite being around since Bitcoin creation, writing and understanding Script is not trivial.
This is why the scripts for the above few examples are pretty lengthy and might not make sense at the first glance.
When writing a script, we would want to know that if the logic we wrote is **correct**, **optimal** and **efficient in size** (use lower [weight](https://en.bitcoin.it/wiki/Weight_units)).

The community wanted an easy alternative way of writing Script that would create the most optimized Script code.
This gave rise to **Miniscript**.

### Miniscript

[Miniscript](http://bitcoin.sipa.be/miniscript/) tackles the above problems head-on.
It is an expressive way to create policies on Bitcoin Scripts in a structured and simple fashion.
Using Miniscript, it's difficult to go wrong.

Another very important goal of Miniscript is to replace any key used in a policy with another policy.
This is important because people might have multiple keys and complicated timelocks in their existing setup.
While signing a new policy, they would want to use this existing setup of theirs and also generate addresses for this setup.
This is something accomplished using something called **Output Descriptors** which we will read about later.

Miniscript compiler compiles a **spending policy** down to Miniscript.
It doesn't contain any signature, it's mainly a combinator language for designing spending conditions.
You can try out the compiler online by using [this link](http://bitcoin.sipa.be/miniscript/#:~:text=Policy%20to%20Miniscript%20compiler).

##### Fragments

Here are some fragments which can be combined to create powerful expressions.

1. `pk(key)` - Specifies a given public key
2. `thresh(k, expr_1, expr_2, ..., expr_n)` - Specifies k of n multisig using expressions.
3. `older(T)` - Timelock for T blocks
4. `and(expr_1, expr_2)` - Both expressions should evaluate to true. 
5. `or(expr_1, expr_2)` - Any one of the expressions should evaluate to true.
6. `aor(expr_1, expr_2)` - Similar to `or` but `expr_1` has a more probability to evaluate to true.

Bitcoin Script allows us to use another alternate stack. The combinator functions use this second stack to evaluate expressions of `thresh`, `and`, `aor` and `or`.
The complete Miniscript Reference can be found [here](http://bitcoin.sipa.be/miniscript/#:~:text=Miniscript%20reference).

##### Example Policies

Here are the Miniscript Policies for the examples we looked at earlier. 
Note `A`, `B`, `C` are placeholders for keys *(or output descriptors)* involved in the tx.

1. Pay A (pay-to-public-key)
```
pk(A)
```

2. Escrow Account between A, B and third-party C.
```
thresh(2,pk(A),pk(B),pk(C))
```

3. Vault for A time-locked for T blocks with B as the master key.
```
aor(and(pk(A),time(T)),pk(B))
```

4. HTLC payment to B, which, if unspent for T blocks, returns to A.
```
aor(and(pk(A),time(T)),and(pk(B),hash(H))))
```

The Miniscript Policy Compiler is written in Rust and is present in [this repository](https://github.com/rust-bitcoin/rust-miniscript). 
In this blog, we will later use the same using [bitcoindevkit/bdk](https://github.com/bitcoindevkit/bdk), a lightweight descriptor-based wallet library
with a [cli](https://github.com/bitcoindevkit/bdk-cli). 

### Descriptors

Descriptors are a compact and efficient way to "describe" how scripts *(and addresses)* of a wallet should be generated.
They make it easier to deal with Multisig or complicated key setups.
Descriptors are super portable and can be easily used by any wallet to determine the list of all addresses that can be generated from the same.
This feature creates a common stage for all Bitcoin apps and software.
It's an abstract way to replace keys.

According to Bitcoin Core, Output Descriptors are "a simple language which can be used to describe collections of output scripts".
They bring in themselves, derivation paths, master xpub/xprv fingerprints and paths to generate addresses from.
Let's understand this with an example of an Output Descriptor:

```

Descriptor: pkh([d34db33f/44'/0'/0']xpub6ERaJH[...]LJRcEL/1/*)#ml40v0wf
            <1> <--------2---------><----------3---------><4> <---5--->

Sections:
1 - function type (here, P2PK)
2 - derivation path of this key
3 - xpub at m/44'/0'/0
4 - path to deriving keys/addresses at
5 - checksum for the descriptor
```

This was an example of a simple descriptor using one function but they can also be used in conjugation with multiple functions like `combo`, `multi` etc.
The concept of descriptor came into existence in 2018 and since then, a lot of wallets have added support for descriptors.

### Where it all comes together...

In this section, we are going to make a descriptor-based wallet and derive addresses from `bitcoin-cli` and then use `bdk-cli` to confirm that the addresses generated for descriptor wallets are deterministic for a given descriptor.

We will also try to create a vault miniscript policy and push funds to the vault with a lock time of 2 months. 
During this time, we will try to break our vault and see our transactions failing.

##### Tools and Armor

- [docker](https://docs.docker.com/engine/install/)
- [bdk-cli](https://github.com/bitcoindevkit/bdk-cli)
- [miniscriptc](https://bitcoindevkit.org/bdk-cli/compiler/#installation)

##### Setting Up

We require `bitcoind` to run in `regtest` mode.
The hard work has been already done in the `bitcoindevkit/electrs` docker image.
The electrs functionality will also prove significant because `bdk` can use this local `electrs` box and send the transactions that we're gonna do for testing.

```bash
alias elstart='docker run --detach --rm -p 127.0.0.1:18443-18444:18443-18444/tcp -p 127.0.0.1:60401:60401/tcp --name electrs bitcoindevkit/electrs:0.5.0'
alias elstop='docker kill electrs'
alias ellogs='docker container logs electrs'
alias elcli='docker exec -it electrs /root/bitcoin-cli -regtest -datadir=/root/.bitcoin $@'

# Start Bitcoin Core
elstart

# Delete default wallet created by bitcoindevkit/electrs
elcli unloadwallet "bdk-test"
```

Please note that `elcli` is an alias for `bitcoin-cli`.

#### Keys and Generating Addresses

Let us first generate an XPRV and create the wpkh wallet descriptor
```bash
XPRV=$(bdk-cli key generate | jq -r '.xprv')
EX_DESC="wpkh($XPRV/86'/1'/0'/0/*)"
EX_DESC_CS=$(elcli getdescriptorinfo $EX_DESC | jq -r '.checksum')
EX_DESC=$EX_DESC#$EX_DESC_CS

# Set this descriptor in a wallet in bitcoin-cli
elcli -named createwallet wallet_name="mywallet" descriptors=true
elcli -rpcwallet="mywallet" importdescriptors "[{\"desc\":\"$EX_DESC\", \"timestamp\":\"now\", \"active\": true, \"range\": [0,100]}]"

echo $EX_DESC
```

It should look something like this:
```
wpkh(tprv8ZgxMBicQKsPeuazF16EdPZw84eHj55AU8ZKgZgdhu3sXcHnFgjzskfDvZdTaAFHYNCbKqrurFo9onSaT7zGT1i3u3j7LKhVZF5sJA39WPN/86'/1'/0'/0/*)#40hv8z77
```

Now, we will generate 10 addresses using `bitcoin-cli` and thereafter `bdk-cli` using this above descriptor.
Notice how both of them output the same set of addresses.

```bash
# Generation via bdk-cli
❯ repeat 10 { bdk-cli -n regtest wallet --descriptor $EX_DESC -w mywallet get_new_address | jq -r ".address" }
bcrt1qc9wzxf8pthyexl00m23ug92pqrthagnzzf33wp
bcrt1qgnh7e72q92fqujwg3qxlg5kplxkm6rep0nerur
bcrt1qea6r8yvd0peupk29p94wm0xasvydgdsnyzkhez
bcrt1qm99230tpqflq0f8kpkn5d2tee02hgqcsw5sd99
bcrt1qd0afjfnl5udrsfkrj72rl34pss34yluma752qv
bcrt1qj2aymplrzxcp4m7vcxrzq93g58pmgm4fpluesy
bcrt1q4p4k63xglftez0h8yc7d4kmhsn5j5kecguu34j
bcrt1q29z2uanskweur7qrzr43gyv3l028s0pnd9ptvp
bcrt1qkzpeqz8sd73sucfythjxftez0e3ee30yhp9w67
bcrt1qptwd6ggy8ttryck2f6yjf4la68apruc3fs7elz

# Generation via bitcoin-cli
❯ repeat 10 { elcli -rpcwallet="mywallet" getnewaddress }
bcrt1qc9wzxf8pthyexl00m23ug92pqrthagnzzf33wp
bcrt1qgnh7e72q92fqujwg3qxlg5kplxkm6rep0nerur
bcrt1qea6r8yvd0peupk29p94wm0xasvydgdsnyzkhez
bcrt1qm99230tpqflq0f8kpkn5d2tee02hgqcsw5sd99
bcrt1qd0afjfnl5udrsfkrj72rl34pss34yluma752qv
bcrt1qj2aymplrzxcp4m7vcxrzq93g58pmgm4fpluesy
bcrt1q4p4k63xglftez0h8yc7d4kmhsn5j5kecguu34j
bcrt1q29z2uanskweur7qrzr43gyv3l028s0pnd9ptvp
bcrt1qkzpeqz8sd73sucfythjxftez0e3ee30yhp9w67
bcrt1qptwd6ggy8ttryck2f6yjf4la68apruc3fs7elz
```

Notes:
- The `repeat n {}` syntax will only work in `zsh`
- In case you get different outputs in either of the cases, try deleting `~/.bdk-bitcoin` and retrying (thanks [@Steve](https://twitter.com/notmandatory) for this tip!)

So now we have definitive proof that descriptors can make wallets portable. That single string will be able to make any wallet generate the same set of addresses and hence they can sync and broadcast transactions in the same manner!

#### Making a Secure Descriptor for Funds

In the real-life, most of us hold two kinds of savings accounts - one to store huge funds saved throughout our lifetime *(probably without internet banking functionalities)* 
and another for regular expenses.

In the Bitcoin world, to store huge funds, most people prefer to use a Multisig descriptor with a `2-of-3` or `3-of-4` setup. 
They can have one key stored in their PC, one key stored in a hardware wallet, one key stored in writing in a secure vault and another key learnt by heart.
In case of a mishap like a house burning on fire or permanent memory loss, they would still be able to recover their funds by using the other keys.

Here's how a secure `2-of-3` descriptor generation would look like:

```bash
# xprv generation
K1_XPRV=$(bdk-cli key generate | jq -r ".xprv")
K2_XPRV=$(bdk-cli key generate | jq -r ".xprv")
K3_XPRV=$(bdk-cli key generate | jq -r ".xprv")

# xpub generation
K1_XPUB=$(bdk-cli key derive --xprv $K1_XPRV --path "m/84'/1'/0'/0" | jq -r ".xpub")
K2_XPUB=$(bdk-cli key derive --xprv $K2_XPRV --path "m/84'/1'/0'/0" | jq -r ".xpub")
K3_XPUB=$(bdk-cli key derive --xprv $K3_XPRV --path "m/84'/1'/0'/0" | jq -r ".xpub")

# Descriptors for each key - Since we used BIP-84 generaion paths for xpubs, 
# we need to append the same to the xprvs so that our wallet can understand 
# which path to generate addresses and xpubs from
K1_DESC="wsh(multi(2,$K1_XPRV/84'/1'/0'/0/*,$K2_XPUB,$K3_XPUB))"
K2_DESC="wsh(multi(2,$K1_XPUB,$K2_XPRV/84'/1'/0'/0/*,$K3_XPUB))"
K3_DESC="wsh(multi(2,$K1_XPUB,$K2_XPUB,$K3_XPRV/84'/1'/0'/0/*))"
```

Now, let us generate some funds to an address generated by `K1`.
```bash
# Restart the docker container
elstop && elstart

# ask regtest to create a block with K1's address
elcli generatetoaddress 1 $(bdk-cli -n regtest wallet --server tcp://127.0.0.1:60401 \
	-w K1 -d $K1_DESC get_new_address | jq -r ".address")

# generate 100 more blocks so that we can spend the coins
# because regtest doesn't allow spending until 100 confirmations
elcli getnewaddress
elcli generatetoaddress 100 <address-from-last-step>
```

Let's check the balance of all `K1`, `K2` and `K3`.
```bash
❯ bdk-cli -n regtest wallet --server tcp://127.0.0.1:60401 -w K1 -d $K1_DESC sync
{}
❯ bdk-cli -n regtest wallet --server tcp://127.0.0.1:60401 -w K1 -d $K1_DESC get_balance
{
  "satoshi": 2500000000
}

❯ bdk-cli -n regtest wallet --server tcp://127.0.0.1:60401 -w K2 -d $K2_DESC sync
{}
❯ bdk-cli -n regtest wallet --server tcp://127.0.0.1:60401 -w K2 -d $K2_DESC get_balance
{
  "satoshi": 2500000000
}

❯ bdk-cli -n regtest wallet --server tcp://127.0.0.1:60401 -w K3 -d $K3_DESC sync
{}
❯ bdk-cli -n regtest wallet --server tcp://127.0.0.1:60401 -w K3 -d $K3_DESC get_balance
{
  "satoshi": 2500000000
}
```

Everyone has the same amount of balance. 
This happened because it was a multisig wallet.
Now, let's try to spend some balance.
We will give back some balance to the wallet maintained by `bitcoin-cli`.
But remember, this is a `2-of-3` multisig wallet.
That's why we will need atleast two keys to sign to make a transaction.

Here's where we will require to use a [PSBT](https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki) or a *partially signed bitcoin transaction*. 
Bitcoin uses PSBTs as the standard protocol to create a transaction and add one or more signatures to it before broadcasting the same to 
the network which finally can become a proper valid *transaction*.

```bash
# address to send tx to from this multisig wallet
elcli getnewaddress

# create the transaction, can be started by anyone
PSBT=$(bdk-cli -n regtest wallet --server tcp://127.0.0.1:60401 -w K2 -d $K2_DESC \
	create_tx --to "<address-from-last-step>:5555555" | jq -r ".psbt")

# Sign the transaction by K1 and look at the output
# it should say the psbt is not finalized since only one party has signed
bdk-cli -n regtest wallet --server tcp://127.0.0.1:60401 -w K1 -d $K1_DESC sign --psbt $PSBT
{
   "is_finalized": false,
   "psbt": "[...]"
}

# Saving the PSBT signed by K1
K1_SIGNED_PSBT=$(bdk-cli -n regtest wallet --server tcp://127.0.0.1:60401 -w K1 -d $K1_DESC sign 
	\ --psbt $PSBT | jq -r ".psbt")

# Sign by K3 - should be finalized this time
# Notice that this time, the input psbt was the signed PSBT of K1
bdk-cli -n regtest wallet --server tcp://127.0.0.1:60401 -w K3 -d $K3_DESC sign --psbt $K1_SIGNED_PSBT
{
   "is_finalized": true,
   "psbt": "[...]"
}

# Saving the PSBT signed by K3
SIGNED_PSBT=$(bdk-cli -n regtest wallet --server tcp://127.0.0.1:60401 -w K3 -d $K3_DESC sign \
	--psbt $K1_SIGNED_PSBT | jq -r ".psbt")

# Broadcast the transaction, again doesn't really matter who broadcasts
bdk-cli -n regtest wallet --server tcp://127.0.0.1:60401 -w K2 -d $K2_DESC broadcast \
	--psbt $SIGNED_PSBT
{
   "txid": "49e2706fc73c49605692bf1b9ce58baf1eb0307ea39b3118628994fd56c9b642"
}

# Sync and check balance - it should have gone down by 5555555 + tx fees
bdk-cli -n regtest wallet --server tcp://127.0.0.1:60401 -w K3 -d $K3_DESC sync
bdk-cli -n regtest wallet --server tcp://127.0.0.1:60401 -w K3 -d $K3_DESC get_balance
{
  "satoshi": 2494444255
}
```

So this proves we can definitely do transactions with multisig wallets with complicated descriptors.
Since for Bitcoin, having keys equal having access to the accounts, we need to keep our keys safe.
For legacy single key wallets, we used to keep backups of the mnemonic codes in multiple places.
It was pretty insecure because in case any one of those backups leaks, our entire account would be compromised.
Complicated multisig wallet descriptors are definitely a step forward - just in case a single key leak or are lost, no one would be able to take charge of the funds we hold.

### Retention Bonus - Smart Contract with Bitcoin

Let us consider that a company wants to give its employees a retention bonus for two months.
If an employee stays with that company for over 2 months, the employee would get 1 BTC as a reward.
This would be a smart contract between the company and an employee.
The employee should be able to see that he would get his funds after a year.
The company would require confidence that the employee would not be able to withdraw the reward before 1 year has passed.

The Miniscript policy for this contract would be as follows:
```
or(99@and(pk(E),older(8640)),pk(C))
```
where `E` is the employee and `C` is the company.

I should emphasize over here that this policy will let the company still transfer funds after the designated 2 months.
It's not possible to block them after the lock time has passed, atleast not in a single policy.

Surely, after two months, the funds can be unlocked by the employee but before that, the company can revoke the funds.
Let us compile this policy down to miniscript.

```bash
# The Descriptor will be on the log, the E and C are placeholders
❯ miniscriptc "or(99@and(pk(E),older(8640)),pk(C))" sh-wsh
[2021-08-05T12:25:40Z INFO  miniscriptc] Compiling policy: or(99@and(pk(E),older(8640)),pk(C))
[2021-08-05T12:25:40Z INFO  miniscriptc] ... Descriptor: sh(wsh(andor(pk(E),older(8640),pk(C))))#55wzucxa
Error: Descriptor(Miniscript(Unexpected("Key too short (<66 char), doesn't match any format")))
```

So the compiled miniscript is
```
sh(wsh(andor(pk(E),older(8640),pk(C))))
```

Let's make the keys, generate addresses using the above descriptor and fund it.
```bash
# xprvs
E_XPRV=$(bdk-cli key generate | jq -r ".xprv")
C_XPRV=$(bdk-cli key generate | jq -r ".xprv")

# xpubs
E_XPUB=$(bdk-cli key derive --xprv $E_XPRV --path "m/84'/1'/0'/0" | jq -r ".xpub")
C_XPUB=$(bdk-cli key derive --xprv $C_XPRV --path "m/84'/1'/0'/0" | jq -r ".xpub")

# descriptors using the compiled miniscript
# please note in case company or the employee was using a complicated multisig descriptor,
# it may as well have been added here like we did in the example before
E_DESC="sh(wsh(andor(pk($E_XPRV/84'/1'/0'/0/*),older(8640),pk($C_XPUB))))"
C_DESC="sh(wsh(andor(pk($E_XPUB),older(8640),pk($C_XPRV/84'/1'/0'/0/*))))"

# ask regtest to create a block with C's address
elcli generatetoaddress 1 $(bdk-cli -n regtest wallet --server tcp://127.0.0.1:60401 \
	-w C -d $C_DESC get_new_address | jq -r ".address")

# generate 100 more blocks so that we can spend the coins
# because regtest doesn't allow spending until 100 confirmations
elcli getnewaddress
elcli generatetoaddress 100 <address-from-last-step>

# here are their balances - both will have the same balance 
# but C should be able to use it while E will have to wait
bdk-cli -n regtest wallet --server tcp://127.0.0.1:60401 -w C -d $C_DESC sync
bdk-cli -n regtest wallet --server tcp://127.0.0.1:60401 -w C -d $C_DESC get_balance
{
  "satoshi": 2500000000
}

bdk-cli -n regtest wallet --server tcp://127.0.0.1:60401 -w E -d $E_DESC sync
bdk-cli -n regtest wallet --server tcp://127.0.0.1:60401 -w E -d $E_DESC get_balance
{
  "satoshi": 2500000000
}
```

From the transaction we have done, we have just been forwarded by 100 blocks.
According to the given logic, for `E` to try to transact his coins, he will have to wait for 8640 blocks.
But let's check to see what happens if `E` tries to transact before the designated 2 months.

```bash
# address to send the transaction to
elcli getnewaddress

# get external_policy id - this will be required in many steps so keep it copied
bdk-cli -n regtest wallet --server tcp://127.0.0.1:60401 -w E -d $E_DESC policies | jq -r ".id"

# create the tx (external_policy id from last step in my case is j7ncy3au
PSBT=$(bdk-cli -n regtest wallet --server tcp://127.0.0.1:60401 -w E -d $E_DESC create_tx \
	--to "<address-from-last-step>:9999999" --external_policy "{\"j7ncy3au\":[0]}" | jq -r ".psbt")

# signing
bdk-cli -n regtest wallet --server tcp://127.0.0.1:60401 -w E -d $E_DESC sign --psbt $PSBT
{
  "is_finalized": true,
  "psbt": "[...]"
}

# saving the above psbt
SIGNED_PSBT=$(bdk-cli -n regtest wallet --server tcp://127.0.0.1:60401 -w E -d $E_DESC sign --psbt $PSBT | jq -r ".psbt")

# not let's try to broadcast - and see it failing
❯ bdk-cli -n regtest wallet --server tcp://127.0.0.1:60401 -w E -d $E_DESC broadcast --psbt $SIGNED_PSBT
[2021-08-05T17:48:45Z ERROR bdk_cli] Electrum(Protocol(Object({"code": Number(2), "message": String("sendrawtransaction RPC error: {\"code\":-26,\"message\":\"non-BIP68-final\"}")})))
```

We get an error saying the transaction we sent is **Not BIP68 Final**.
[BIP68](https://github.com/bitcoin/bips/blob/master/bip-0068.mediawiki) is a relative lock-time specification that ensures consensus when a signed transaction is sent which is invalid at a given time because the lock time isn't passed.
So that's an expected error.

Now let's simulate two months passing and retry.

```bash
# generate address
elcli getnewaddress

# simulate two months
elcli generatetoaddress 8640 <address-from-last-step>

# create, sign and broadcast tx
PSBT=$(bdk-cli -n regtest wallet --server tcp://127.0.0.1:60401 -w E -d $E_DESC create_tx --to "<address-from-last-step>:9999999" --external_policy "{\"j7ncy3au\":[0]}" | jq -r ".psbt")
SIGNED_PSBT=$(bdk-cli -n regtest wallet --server tcp://127.0.0.1:60401 -w E -d $E_DESC sign --psbt $PSBT | jq -r ".psbt")
bdk-cli -n regtest wallet --server tcp://127.0.0.1:60401 -w E -d $E_DESC broadcast --psbt $SIGNED_PSBT
{
  "txid": "2a0919bb3ce6e26018698ad1169965301a9ceab6d3da2a3dcb41343dc48e0dba"
}
```

So this time it worked, because we have simulated 2 months passing by generating 8640 blocks.
Hence, we saw that we can generate some smart contracts using Bitcoin.

### Inspirations

1. [Descriptors from Bitcoin Core](https://github.com/bitcoin/bitcoin/blob/master/doc/descriptors.md)
1. [Miniscript](http://bitcoin.sipa.be/miniscript)
1. [Output Script Descriptors](https://bitcoinops.org/en/topics/output-script-descriptors)
1. [Descriptors in Bitcoin Dev Kit](https://bitcoindevkit.org/descriptors)
1. [Role of Descriptors](https://bitcoindevkit.org/blog/2020/11/descriptors-in-the-wild/#the-role-of-descriptors)
1. [Making a Taproot Descriptor Wallet using bitcoin-cli](https://gist.github.com/notmandatory/483c7edd098550c235da75d5babcf255)
1. [Miniscripts SBC '19 - Video](https://www.youtube.com/watch?v=XM1lzN4Zfks)
1. [Rethinking Wallet Architecture: Native Descriptor Wallets - Video](https://www.youtube.com/watch?v=xC25NzIjzog)

Special thanks to my mentor [Steve Myers](https://twitter.com/notmandatory) for the constant motivation and support he gave me and for clearing so many doubts!
Also, thanks to the folks at the `#miniscript` IRC channel to help me out with the Retention Bonus policy.

This blog was written during [Summer of Bitcoin 2021](https://summerofbitcoin.org) by [Sandipan Dey](https://twitter.com/@sandipndev).