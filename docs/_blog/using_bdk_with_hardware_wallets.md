---
title: "Using BDK with hardware wallets"
description: "Tutorial showing how to send funds to a HW and then spend from it using BDK"
authors:
    - Daniela Brozzoni
date: "2022-10-27"
tags: ["BDK", "Development", "Hardware Wallets"]
hidden: true
draft: false
---

## Introduction

The bitcoindevkit organization maintains [rust-hwi](https://github.com/bitcoindevkit/rust-hwi), a Rust wrapper around Bitcoin Core's [HWI](https://github.com/bitcoin-core/HWI). rust-hwi makes it possible to use hardware wallets with BDK, which is exactly what we're going to do in this tutorial.

## Prerequisites

To follow along you'll need the [`hwi`](https://pypi.org/project/hwi/) python package installed on your system, and a hardware wallet.

Never use a hardware wallet with real funds for testing! Either buy a separate one to be used only for tests, or use a hardware wallet emulator, such as:
- [Speculos](https://github.com/LedgerHQ/speculos)
- [Trezor emulator](https://docs.trezor.io/trezor-firmware/core/emulator/index.html)
- [Coldcard emulator](https://github.com/Coldcard/firmware)

To check if `hwi` is installed, open a python terminal and try to import it:
```bash
$ python3
Python 3.9.13 (main, May 17 2022, 14:19:07) 
[GCC 11.3.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> import hwilib
```

If nothing happens, you're set! Instead, if you get a `ModuleNotFoundError`, follow the instructions in [HWI's README.md](https://github.com/bitcoin-core/HWI#bitcoin-hardware-wallet-interface) for installing.

Warning: if you're using macOS and `virtualenv`, you *may* encounter some problems with `rust-hwi`, as we internally use `PyO3`: https://github.com/PyO3/pyo3/issues/1741

## Initial setup

Start by creating a new Rust project:
```bash
$ cargo init bdk-hwi
     Created binary (application) package
$ cd bdk-hwi
```

Add `bdk` with the `hardware-signer` feature as a dependency in the `Cargo.toml`:
```toml
[package]
name = "bdk-hwi"
version = "0.1.0"
edition = "2021"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[dependencies]
bdk = { version = "0.24.0", features = [ "hardware-signer", ] }
```

(`bdk` re-exports `rust-hwi` since version `0.24.0` - if you're using `bdk` <= `0.23.0`, you have to separately declare `rust-hwi` as a dependency)

Now, open `src/main.rs` and slightly modify the `fn main()` method to return a `Result`:
```rust
fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("Hello, world!");
    Ok(())
}
```

and add these imports at the start of the file:

```rust
use bdk::bitcoin::{Address, Network};
use bdk::blockchain::{Blockchain, ElectrumBlockchain};
use bdk::database::MemoryDatabase;
use bdk::electrum_client::Client;
use bdk::hwi::{types::HWIChain, HWIClient};
use bdk::signer::SignerOrdering;
use bdk::wallet::{hardwaresigner::HWISigner, AddressIndex};
use bdk::{FeeRate, KeychainKind, SignOptions, SyncOptions, Wallet};
use std::str::FromStr;
use std::sync::Arc;
```

These little changes will come in handy later, as we won't have to care about imports or error handling.

Build and run the project - if everything goes smoothly it will print some warnings about the unused imports (no worries, we'll use them *eventually*), and a "Hello, world!".
```bash
$ cargo run
warning: unused import: ...
warning: unused import: ...
warning: unused import: ...
Hello, world!

```

## Finding the hardware wallet

In this step we'll make sure that `hwi` can see your hardware wallet. If you're using a physical HW, connect it to your laptop; if it's an emulator, start it.

We start by printing all the available hardware wallets:

```rust
fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Listing all the available hardware wallet devices...
    let devices = HWIClient::enumerate()?;
    println!("{:?}", &devices);
    Ok(())
}
```

When run, it should print an array of `HWIDevice` with one element:

```bash
$ cargo run
[HWIDevice { ... }]
```

If the array is empty instead, `hwi` is having troubles recognizing your device. Common issues are: the device is locked (unlock with the pin and open the "Bitcoin" app, if needed) or the udev rules aren't set.

## Receiving funds

In order to be able to receive funds we need to create the BDK `Wallet` using the HW descriptors.

We start by creating a `HWIClient` from the `HWIDevice` we found in the last step:

```rust
// Listing all the available hardware wallet devices...
let devices = HWIClient::enumerate()?;
let first_device = devices
    .first()
    .expect("No devices found. Either plug in a hardware wallet, or start a simulator.");
// ...and creating a client out of the first one
let client = HWIClient::get_client(first_device, true, HWIChain::Test)?;
println!("Look what I found, a {}!", first_device.model);
```

We then use the `HWIClient` to get the descriptors:

```rust
// Getting the HW's public descriptors
let descriptors = client.get_descriptors(None)?;
println!(
    "The hardware wallet's descriptor is: {}",
    descriptors.receive[0]
);
```

Now that we have the descriptors, we use BDK as we always do: we create a `Wallet`, we sync it, we check the balance, and if there aren't funds on it, we ask the user to send some:

```rust
let mut wallet = Wallet::new(
    &descriptors.receive[0],
    Some(&descriptors.internal[0]),
    Network::Testnet,
    MemoryDatabase::default(),
)?;

// create client for Blockstream's testnet electrum server
let blockchain =
    ElectrumBlockchain::from(Client::new("ssl://electrum.blockstream.info:60002")?);

println!("Syncing the wallet...");
wallet.sync(&blockchain, SyncOptions::default())?;

// get deposit address
let deposit_address = wallet.get_address(AddressIndex::New)?;

let balance = wallet.get_balance()?;
println!("Wallet balances in SATs: {}", balance);

if balance.get_total() < 10000 {
    println!(
        "Send some sats from the u01.net testnet faucet to address '{addr}'.\nFaucet URL: https://bitcoinfaucet.uo1.net/?to={addr}",
        addr = deposit_address.address
    );
    return Ok(());
}
```

Use a testnet faucet to send funds to the specified address, and then re-run the program to check that they arrived. You don't have to wait for them to be confirmed before going to the next step.

## Spending funds

We're going to send back the sats we just received to the testnet faucet. As always, we need to start by creating the transaction:

```rust
let return_address = Address::from_str("tb1ql7w62elx9ucw4pj5lgw4l028hmuw80sndtntxt")?;
let (mut psbt, _details) = {
    let mut builder = wallet.build_tx();
    builder
        .drain_wallet()
        .drain_to(return_address.script_pubkey())
        .enable_rbf()
        .fee_rate(FeeRate::from_sat_per_vb(5.0));
    builder.finish()?
};
```

We can't just call `sign` on the `psbt` as we'd normally do though, as the `Wallet` doesn't have any private keys, and doesn't even know that it's supposed to sign with the hardware wallet. (Go on and try to call `sign()`, if you're curious!)

We need to create a `HWISigner` object, and then manually add it to the `Wallet`, using `add_signer`. `add_signer` requires a `SignerOrdering`, which BDK uses to know which signer call first - in this case we just use the default, as we only have one signer.

```rust
// Creating a custom signer from the device
let custom_signer = HWISigner::from_device(first_device, HWIChain::Test)?;
// Adding the hardware signer to the BDK wallet
wallet.add_signer(
    KeychainKind::External,
    SignerOrdering::default(),
    Arc::new(custom_signer),
);
```

We can now sign and broadcast `psbt`:

```rust
// `sign` will call the hardware wallet asking for a signature
assert!(
    wallet.sign(&mut psbt, SignOptions::default())?,
    "The hardware wallet couldn't finalize the transaction :("
);

println!("Let's broadcast your tx...");
let raw_transaction = psbt.extract_tx();
let txid = raw_transaction.txid();

blockchain.broadcast(&raw_transaction)?;
println!("Transaction broadcasted! TXID: {txid}.\nExplorer URL: https://mempool.space/testnet/tx/{txid}", txid = txid);
```

## Conclusion

We just received coins on a hardware wallet and spent from it - how cool is that?!

See the [hardware signer example](https://github.com/bitcoindevkit/bdk/blob/master/examples/hardware_signer.rs) for the full code, and, if you have any questions or suggestions, head to our [Discord](https://discord.gg/dstn4dQ). See you there!
