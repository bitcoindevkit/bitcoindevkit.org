---
title: "Using BDK to build a wallet backed by a Bitcoin Core full node"
description: "Tutorial showing usage of Bitcoin core backend with BDK wallet"
authors:
    - Rajarshi Maitra
date: "2021-08-21"
tags: ["tutorial", "BDK", "Bitcoin Core", "RPC", "Wallet"]
hidden: true
draft: false
---

## Introduction
BDK wallet developer library can be used to easily deploy wallets with various kinds of blockchain backend support, like [`electrum`](https://github.com/romanz/electrs), [`esplora`](https://github.com/Blockstream/esplora), `compact-filters` ([BIP157](https://github.com/bitcoin/bips/blob/master/bip-0157.mediawiki)) etc. With the latest release of BDK [`v0.10.0`](https://github.com/bitcoindevkit/bdk/releases/tag/v0.10.0), BDK now supports Bitcoin Core as a blockchain backend. BDK talks with Bitcoin Core using rust-bitcoin's [bitcoincore-rpc](https://github.com/rust-bitcoin/rust-bitcoincore-rpc) library.

This allows wallet devs to quickly deploy their wallet that can talk to a bitcoin full node (home raspi nodes) out of the box. Wallet devs don't need to worry about connecting to a full node with correct RPC calls, all of that is handled by BDK under the hood. All they need is to identify the full node's RPC IP address and the correct RPC credentials.

In this tutorial we will see how to write a very simplistic wallet code that can connect to a bitcoin core node and maintain its balance and make transactions.

Unlike other tutorials, we will not use `bdk-cli` tools, but instead write rust code directly using `BDK` devkit. In the end we will end up with our own simple bitcoin wallet.

## Prerequisite
To run with this tutorial you would need to have a bitcoin core node running in regtest mode. Get the bitcoin core binary either from the [bitcoin core repo](https://bitcoincore.org/bin/bitcoin-core-0.21.1/) or [build from source](https://github.com/bitcoin/bitcoin/blob/v0.21.1/doc/build-unix.md).

Then configure the node with a following `bitcoin.conf` file
```txt
regtest=1
fallbackfee=0.0001
server=1
txindex=1
rpcuser=admin
rpcpassword=password
```

Apart from that, you would need to install rust in your system. Grab the installation one-liner from [here](https://www.rust-lang.org/tools/install). 

## Setting Up
Create a new cargo binary repository.
```shell
mkdir ~/tutorial
cd tutorial
cargo new bdk-example
cd bdk-example
```
This will create a new project folder named `bdk-example` with `src/main.rs` and a `cargo.toml`. 
```shell
$ tree -L 3 .
.
├── Cargo.toml
└── src
    └── main.rs

1 directory, 2 files
```
Opening `main.rs` you will see some predefined code like this

``` rust
fn main() {
    println!("Hello, world!");
}
```
Try running `cargo run` and if everything is set, you should see "Hello, world!" printed in your terminal
```shell
$ cargo run
    Compiling bdk-example v0.1.0 (/home/raj/github-repo/tutorial/bdk-example)
    Finished dev [unoptimized + debuginfo] target(s) in 0.95s
    Running `target/debug/bdk-example`
Hello, world!
```
Of course we will not use the given `println!()` statement, but we will put our main code in the `main()` function.

`cargo new` will also produce a skeleton `Cargo.toml` file like this
```toml
[package]
name = "bdk-example"
version = "0.1.0"
edition = "2018"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[dependencies]
```

## Setting dependencies
Once the rust binary is compiled and running, we now need to specify the dependencies we need to work on our library.

Remember that BDK provides almost everything we would need to build a wallet out of the box. So we don't need any more dependencies apart from BDK. We will use another small rust crate called [`dirs_next`](https://crates.io/crates/dirs-next) to find our home directory and store wallet files in a subfolder there.

Add the dependencies into `Cargo.toml` like below
```toml
[package]
name = "bdk-example"
version = "0.1.0"
edition = "2018"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[dependencies]
bdk = { version = "^0.10", default-features = false, features = ["all-keys", "key-value-db", "rpc"]}
dirs-next = "2.0"
```
We disabled the default BDK feature (which specifies blockchain backend as an electrum server) and we requested the following features:
 - **all-keys**: Adds BIP39 key derivation capabilities
 - **key-value-db**: Adds a persistance storage capability
 - **rpc**: Adds the RPC blockchain backend capability.

Now that we have the dependcies added, we can import them in the `main.rs` file to use in our code.
Add the following imports at the start of `main.rs`

```rust
use bdk::bitcoin::Network;
use bdk::bitcoin::secp256k1::Secp256k1;
use bdk::bitcoin::util::bip32::{DerivationPath, KeySource};
use bdk::bitcoin::Amount;
use bdk::bitcoincore_rpc::{Auth as rpc_auth, Client, RpcApi};

use bdk::blockchain::rpc::{Auth, RpcBlockchain, RpcConfig, wallet_name_from_descriptor};
use bdk::blockchain::{ConfigurableBlockchain, NoopProgress};

use bdk::keys::bip39::{Mnemonic, Language, MnemonicType};
use bdk::keys::{GeneratedKey, GeneratableKey, ExtendedKey, DerivableKey, DescriptorKey};
use bdk::keys::DescriptorKey::Secret;

use bdk::miniscript::miniscript::Segwitv0;

use bdk::Wallet;
use bdk::wallet::{AddressIndex, signer::SignOptions};

use bdk::sled;

use std::str::FromStr;
```
With this we are now ready to add our wallet code.

## Getting Descriptors

BDK is a descriptor based wallet library. That means when we specify our wallet key-chain we need to tell BDK about it in the format of a descriptor. You can read up on descriptors more [here](https://bitcoindevkit.org/descriptors/). A descriptor string looks like this
`"wpkh([b8b575c2/84'/1'/0'/0]tprv8icWtRzy9CWgFxpGMLSdAeE4wWyz39XGc6SwykeTo13tYm14JkVVQAf7jz8WDDarCgNJrG3aEPJEqchDWeJdiaWpS3FwbLB9SzsN57V7qxB/*)"`.

This describes a SegwitV0 descriptor of a key derived at path `m/84'/1'/0'/0`. If you already have a descriptor from other sources, you can use that. Otherwise, BDK has your back. BDK can be used to generate a fresh master key with mnemonic, and then derive child keys from it given a specific path. Putting the key in a descriptor is as simple as wrapping it with a `wpkh()` string.

We will use a dedicated function that will create fresh receive and change descriptors from BDK for our purpose. It will also generate the mnemonic word list for later regenerating the wallet. But we will ignore that for our scope.

Add a function named `get-descriptor()` below the `main()` function as shown
```rust
fn main() {
    ...
}

// generate fresh descriptor strings and return them via (receive, change) tuple
fn get_descriptors() -> (String, String) {
    // Create a new secp context
    let secp = Secp256k1::new();
     
    // You can also set a password to unlock the mnemonic
    let password = Some("random password".to_string());

    // Generate a fresh mnemonic, and from there a privatekey
    let mnemonic: GeneratedKey<_, Segwitv0> =
                Mnemonic::generate((MnemonicType::Words12, Language::English)).unwrap();
    let mnemonic = mnemonic.into_key();
    let xkey: ExtendedKey = (mnemonic, password).into_extended_key().unwrap();
    let xprv = xkey.into_xprv(Network::Regtest).unwrap();

    // Create derived privkey from the above master privkey
    // We use the following derivation paths for receive and change keys
    // receive: "m/84h/1h/0h/0"
    // change: "m/84h/1h/0h/1" 
    let mut keys = Vec::new();

    for path in ["m/84h/1h/0h/0", "m/84h/1h/0h/1"] {
        let deriv_path: DerivationPath = DerivationPath::from_str(path).unwrap();
        let derived_xprv = &xprv.derive_priv(&secp, &deriv_path).unwrap();
        let origin: KeySource = (xprv.fingerprint(&secp), deriv_path);
        let derived_xprv_desc_key: DescriptorKey<Segwitv0> =
        derived_xprv.into_descriptor_key(Some(origin), DerivationPath::default()).unwrap();

        // Wrap the derived key with the wpkh() string to produce a descriptor string
        if let Secret(key, _, _) = derived_xprv_desc_key {
            let mut desc = "wpkh(".to_string();
            desc.push_str(&key.to_string());
            desc.push_str(")");
            keys.push(desc);
        }
    }
    
    // Return the keys as a tuple
    (keys[0].clone(), keys[1].clone())
}
```

To check that the above added function is working as expected, call it in the main function and print the descriptors
``` rust
use ...

fn main() {
    let (receive_desc, change_desc) = get_descriptors();
    println!("recv: {:#?}, \nchng: {:#?}", receive_desc, change_desc);
}

fn get_descriptors() -> (String, String) {
    ...
}
```
Running the binary should produces the following result
```shell
$ cargo run
recv: "wpkh([89df6a67/84'/1'/0'/0]tprv8iSRXyLtTKJN9qt1jyPVqwhDMEaYztXunPaRQznaH1z8gj8e2g7RnF2ZoHP56VEXwMn76AiV1Je6nJmZbFistwAQCrRGmSrsoKfdqfTDNA1/*)", 
chng: "wpkh([89df6a67/84'/1'/0'/1]tprv8iSRXyLtTKJNCECQxBJ19cgx2ueS7mC7GNq7VqTWY3RNPMBY7DfTb9HUnXpJqa14jCJNRmi4yGxfoTVS4WLBXDkvTLq4vujeAD9NfDtSxGP/*)"
```
Voila! Now we have nice descriptors strings handy to use for our BDK wallet construction.

## Talking to Bitcoin Core Programmatically
Like all other tutorials we will use two wallets to send coins back and forth. A Bitcoin Core wallet accessible via `bitcoin-cli` command line tools, and a BDK wallet maintained by BDK library.    

But unlike other tutorials, we won't be using `bitcoin-cli` to talk to the Core wallet (we can, but let's spice things up). Instead, we will use the `bitcoin-rpc` library, to talk with our core node listening at `127.0.0.1:18443`, from inside our main function. This will allow us to write code, that will handle both the core and BDK wallet, from inside of the same function, and we won't have to switch terminals!

Remember we imported `use bdk::bitcoincore_rpc::{Auth as rpc_auth, Client, RpcApi};`? Thats exactly for this purpose.

Start the `bitcoind` node.

you should see bitcoind listening at port 18443
```shell
$ sudo netstat -nptl | grep 18443 
tcp        0      0 0.0.0.0:18443           0.0.0.0:*               LISTEN      135532/bitcoind 
```

Lets create a core rpc interface in our main function.
```rust
fn main() {
    ...
    
    // Create a RPC interface
    let rpc_auth = rpc_auth::UserPass(
        "admin".to_string(),
        "password".to_string()
    ); 
    let core_rpc = Client::new("http://127.0.0.1:18443/wallet/test".to_string(), rpc_auth).unwrap();
    println!("{:#?}", core_rpc.get_blockchain_info().unwrap());
}
```
We have provided our RPC authentication `username` and `password` (same as provided in `bitcoin.conf` file).
We have provided the RPC address of our local bitcoin node, with the path to a wallet file, named `test`. And then asked the rpc client to give us the current blockchain info.
If everything goes well, running `cargo run` you should see an output like below:
```shell
$ cargo run
...
GetBlockchainInfoResult {
    chain: "regtest",
    blocks: 0,
    headers: 0,
    best_block_hash: 0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206,
    difficulty: 0.00000000046565423739069247,
    median_time: 1296688602,
    verification_progress: 1.0,
    initial_block_download: true,
    ...
```
Thats it. Now we can programmatically talk to our core node.

## Get some balance in core wallet.
We have told our rpc client that we would use a wallet named `test`. But currently, our core node doesn't have such a wallet. So let's create the wallet and fund it with some test coins.
```rust
fn main() {
    ...

    // Create the test wallet 
    core_rpc.create_wallet("test", None, None, None, None).unwrap();
    
    // Get a new address
    let core_address = core_rpc.get_new_address(None, None).unwrap();
    
    // Generate 101 blocks and use the above address as coinbase
    core_rpc.generate_to_address(101, &core_address).unwrap();
    
    // fetch the new balance
    let core_balance = core_rpc.get_balance(None, None).unwrap();
    
    // Show balance
    println!("core balance: {:#?}", core_balance);
}
```
This will create a wallet in bitcoin core named `test`. generate 101 blocks and use a new address from the wallet as coinbase wallet. Because required coinbase maturity in bitcoin is 100 blocks, by generating 101 blocks, we will have the balance of the first coinbase block reward available for use.
The last `println!()` statement will show the new updated balance as 50 BTC.
```shell
$ cargo run
...
core balance: Amount(50.00000000 BTC)       
```
Great! We now have 50 regtest BTC to play with.

## Setup the BDK wallet
Now that we are done setting up the core wallet. The last remaining step is to setup the BDK wallet. For this we will use the previous descriptor generation function and write code as below.

**Note**: You might want to comment out the previous code in `main()`, as running them again will create more coins in core, which isn't an issue, but might be confusing.

```rust
fn main() {
    ...

    // Get receive and change descriptor
    let (receive_desc, change_desc) = get_descriptors();
    
    // Use deterministic wallet name derived from descriptor
    let wallet_name = wallet_name_from_descriptor(
        &receive_desc,
        Some(&change_desc),
        Network::Regtest,
        &Secp256k1::new()
    ).unwrap();

    // Create the datadir to store wallet data
    let mut datadir = dirs_next::home_dir().unwrap();
    datadir.push(".bdk-example");
    let database = sled::open(datadir).unwrap();
    let db_tree = database.open_tree(wallet_name.clone()).unwrap();

    // Set RPC username, password and url
    let auth = Auth::UserPass {
        username: "admin".to_string(),
        password: "password".to_string()
    };
    let mut rpc_url = "http://".to_string();
    rpc_url.push_str("127.0.0.1:18443");

    // Setup the RPC configuration
    let rpc_config = RpcConfig {
        url: rpc_url,
        auth,
        network: Network::Regtest,
        wallet_name,
        skip_blocks: None,
    };

    // Use the above configuration to create a RPC blockchain backend
    let blockchain = RpcBlockchain::from_config(&rpc_config).unwrap();

    // Combine everything and finally create the BDK wallet structure
    let wallet = Wallet::new(&receive_desc, Some(&change_desc), Network::Regtest, db_tree, blockchain).unwrap();

    // Sync the wallet
    wallet.sync(NoopProgress, None).unwrap();

    // Fetch a fresh address to receive coins
    let address = wallet.get_address(AddressIndex::New).unwrap().address;

    println!("bdk address: {:#?}", address);
}
```
That's a lot of code. They are divided into logical sections. Let's discuss each step one by one.
 - First we used our previous `get_descriptors()` function to generate two descriptor strings. One for generating receive addresses and one for change addresses.
 - Then we used a special function from BDK called `wallet_name_from_descriptor()` to derive a name of the wallet from our descriptors. This allows us to have wallet names deterministically linked with descriptors. So in future if we use a different descriptor, the wallet will automatically have a different name. This allows us to not mix wallet names with same descriptor, and given the descriptors we can always determine what was the name we used. It is recommended to derive wallet names like this while using a core backend. Note that this wallet will be created inside the core node. So just like we accessed the `test` wallet, we could also access this wallet.
 - Then we created a data directory at path `/home/username/.bdk-example`. We use `dirs_next` to find our home path, and then appended that with `.bdk-example`. All the BDK wallet files will be created and maintained in that directory. In the Database we instructed BDK to create a new `Tree` with `wallet_name`, so given a descriptor, BDK will always know which DB Tree to refer (`Tree` is a `sled` specific term).
 - Then like we did previously, we created the rpc username/password authentication, and specified the rpc url. Note that we cannot use the same `rpc_auth` we used before for `core_rpc` as BDK auth and bitcoin-rpc auth are slightly separate structures.
 - We combined all this information and created an `RpcConfig` structure.
 - We used the rpc configuration to create a `RpcBlockchain` structure.
 - Finally we used the Descriptors, Database, and Blockchain to create our final BDK `wallet` structure.

Now that we have a our wallet cooked, in the end, we instructed it to sync with the bitcoin core backend, and fetch us a new address.

If all goes well, you should see an address printed in the terminal.

```shell
cargo run
    Finished dev [unoptimized + debuginfo] target(s) in 2.99s
    Running `target/debug/bdk-example`
bdk address: bcrt1q9vkmujggvzs0rd4z6069v3v0jucje7ua7ap308
```

## Sending Sats Around

Now that we have covered all the groundwork, we have all we need to send coins back and forth between core and BDK wallet.

We will keep things simple here and make the following actions
 - Send 10 BTC from Core to BDK
 - Send back 5 BTC from BDK to Core
 - Display balance of two wallets

In the last line of previous section we got a new address from BDK wallet. We will start from there. Without further discussion lets jump straight into code.

```rust
fn main() {
    ...

    // Fetch a fresh address to receive coins
    let address = wallet.get_address(AddressIndex::New).unwrap().address;

    // Send 10 BTC from Core to BDK
    core_rpc.send_to_address(&address, Amount::from_btc(10.0).unwrap(), None, None, None, None, None, None).unwrap();

    // Confirm transaction by generating some blocks
    core_rpc.generate_to_address(1, &core_address).unwrap();

    // Sync the BDK wallet
    wallet.sync(NoopProgress, None).unwrap();
    
    // Create a transaction builder
    let mut tx_builder = wallet.build_tx();

    // Set recipient of the transaction
    tx_builder.set_recipients(vec!((core_address.script_pubkey(), 500000000)));

    // Finalise the transaction and extract PSBT
    let (mut psbt, _) = tx_builder.finish().unwrap();

    // Set signing option
    let signopt = SignOptions {
        assume_height: None,
        ..Default::default()
    };

    // Sign the above psbt with signing option
    wallet.sign(&mut psbt, signopt).unwrap();

    // Extract the final transaction
    let tx = psbt.extract_tx();

    // Broadcast the transaction
    wallet.broadcast(tx).unwrap();

    // Confirm transaction by generating some blocks
    core_rpc.generate_to_address(1, &core_address).unwrap();

    // Sync the BDK wallet
    wallet.sync(NoopProgress, None).unwrap();

    // Fetch and display wallet balances
    let core_balance = core_rpc.get_balance(None, None).unwrap();
    let bdk_balance = Amount::from_sat(wallet.get_balance().unwrap());
    println!("core wallet balance: {:#?}", core_balance);
    println!("BDK wallet balance: {:#?}", bdk_balance);
}
```

The above code segment is mostly straight forward. The only new thing added is `wallet.build_tx()` which returns a `TxBuilder`. BDK allows us to have very fine grained control of cooking up transactions. Almost everything that is possible to do with a Bitcoin transaction can be done in BDK. Here we have a very simple vanilla transaction with no added magic. To get full list of capabilities that `TxBuilder` supports scour its implementation [here](https://github.com/bitcoindevkit/bdk/blob/38d1d0b0e29d38cd370c740d798d96a3c9fcaa1f/src/wallet/tx_builder.rs#L123-L153).

Finally to step through what we did above:
 - We asked core wallet to send 10 BTC to bdk wallet address.
 - We confirmed the transaction, and synced the wallet.
 - We asked BDK to create a transaction sending 5 BTC to core wallet address.
 - We signed and broadcast the transaction. BDK will use the same core node to broadcast the transaction to network.
 - We confirmed the transaction by mining a block, and synced the wallet.
 - We fetched and displayed balance of both core and BDK wallet.

If all goes well, you should see the final updated balance as below:
```shell
$ cargo run
    Compiling bdk-example v0.1.0 (/home/raj/github-repo/bdk-example/bdk-example)
    Finished dev [unoptimized + debuginfo] target(s) in 3.57s
    Running `target/debug/bdk-example`
core wallet balance: Amount(144.99998590 BTC)
BDK wallet balance: Amount(4.99999859 BTC)
```
Voila! We have ~145 BTC (150 - 5) in core wallet and 5 BTC (10 - 5) in BDK wallet. The slight deficiency in the amount are due to transaction fees. Because we are using regtest, the fee is some standard value hardcoded in core node.

Check out the data directory where BDK has created the wallet data files.

```shell
$ ls ~/.bdk-example/
blobs  conf  db  snap.0000000000023CAB
```

And finally, this is what the final `main.rs` file looks like.

```rust
use bdk::bitcoin::Network;
use bdk::bitcoin::secp256k1::Secp256k1;
use bdk::bitcoin::util::bip32::{DerivationPath, KeySource};
use bdk::bitcoin::Amount;
use bdk::bitcoincore_rpc::{Auth as rpc_auth, Client, RpcApi};

use bdk::blockchain::rpc::{Auth, RpcBlockchain, RpcConfig, wallet_name_from_descriptor};
use bdk::blockchain::{ConfigurableBlockchain, NoopProgress};

use bdk::keys::bip39::{Mnemonic, Language, MnemonicType};
use bdk::keys::{GeneratedKey, GeneratableKey, ExtendedKey, DerivableKey, DescriptorKey};
use bdk::keys::DescriptorKey::Secret;

use bdk::miniscript::miniscript::Segwitv0;

use bdk::Wallet;
use bdk::wallet::{AddressIndex, signer::SignOptions};

use bdk::sled;

use std::str::FromStr;

fn main() {
    // Create a RPC interface
    let rpc_auth = rpc_auth::UserPass(
        "admin".to_string(),
        "password".to_string()
    ); 
    let core_rpc = Client::new("http://127.0.0.1:18443/wallet/test".to_string(), rpc_auth).unwrap();

    // Create the test wallet 
    core_rpc.create_wallet("test", None, None, None, None).unwrap();
    
    // Get a new address
    let core_address = core_rpc.get_new_address(None, None).unwrap();
    
    // Generate 101 blocks and use the above address as coinbase
    core_rpc.generate_to_address(101, &core_address).unwrap();

    // Get receive and change descriptor
    let (receive_desc, change_desc) = get_descriptors();
    
    // Use deterministic wallet name derived from descriptor
    let wallet_name = wallet_name_from_descriptor(
        &receive_desc,
        Some(&change_desc),
        Network::Regtest,
        &Secp256k1::new()
    ).unwrap();

    // Create the datadir to store wallet data
    let mut datadir = dirs_next::home_dir().unwrap();
    datadir.push(".bdk-example");
    let database = sled::open(datadir).unwrap();
    let db_tree = database.open_tree(wallet_name.clone()).unwrap();

    // Set RPC username and password
    let auth = Auth::UserPass {
        username: "admin".to_string(),
        password: "password".to_string()
    };

    // Set RPC url
    let mut rpc_url = "http://".to_string();
    rpc_url.push_str("127.0.0.1:18443");

    // Setup the RPC configuration
    let rpc_config = RpcConfig {
        url: rpc_url,
        auth,
        network: Network::Regtest,
        wallet_name,
        skip_blocks: None,
    };

    // Use the above configuration to create a RPC blockchain backend
    let blockchain = RpcBlockchain::from_config(&rpc_config).unwrap();

    // Combine everything and finally create the BDK wallet structure
    let wallet = Wallet::new(&receive_desc, Some(&change_desc), Network::Regtest, db_tree, blockchain).unwrap();

    // Sync the wallet
    wallet.sync(NoopProgress, None).unwrap();

    // Fetch a fresh address to receive coins
    let address = wallet.get_address(AddressIndex::New).unwrap().address;

    // Send 10 BTC from Core to BDK
    core_rpc.send_to_address(&address, Amount::from_btc(10.0).unwrap(), None, None, None, None, None, None).unwrap();

    // Confirm transaction by generating some blocks
    core_rpc.generate_to_address(1, &core_address).unwrap();

    // Sync the BDK wallet
    wallet.sync(NoopProgress, None).unwrap();

    // Create a transaction builder
    let mut tx_builder = wallet.build_tx();

    // Set recipient of the transaction
    tx_builder.set_recipients(vec!((core_address.script_pubkey(), 500000000)));

    // Finalise the transaction and extract PSBT
    let (mut psbt, _) = tx_builder.finish().unwrap();

    // Set signing option
    let signopt = SignOptions {
        assume_height: None,
        ..Default::default()
    };

    // Sign the above psbt with signing option
    wallet.sign(&mut psbt, signopt).unwrap();

    // Extract the final transaction
    let tx = psbt.extract_tx();

    // Broadcast the transaction
    wallet.broadcast(tx).unwrap();

    // Confirm transaction by generating some blocks
    core_rpc.generate_to_address(1, &core_address).unwrap();

    // Sync the BDK wallet
    wallet.sync(NoopProgress, None).unwrap();

    // Fetch and display wallet balances
    let core_balance = core_rpc.get_balance(None, None).unwrap();
    let bdk_balance = Amount::from_sat(wallet.get_balance().unwrap());
    println!("core wallet balance: {:#?}", core_balance);
    println!("BDK wallet balance: {:#?}", bdk_balance);
}

// generate fresh descriptor strings and return them via (receive, change) tupple 
fn get_descriptors() -> (String, String) {
    // Create a new secp context
    let secp = Secp256k1::new();

    // You can also set a password to unlock the mnemonic
    let password = Some("random password".to_string());

    // Generate a fresh menmonic, and from their, a fresh private key xprv
    let mnemonic: GeneratedKey<_, Segwitv0> =
                Mnemonic::generate((MnemonicType::Words12, Language::English)).unwrap();
    let mnemonic = mnemonic.into_key();
    let xkey: ExtendedKey = (mnemonic, password).into_extended_key().unwrap();
    let xprv = xkey.into_xprv(Network::Regtest).unwrap();

    // Derive our dewscriptors to use
    // We use the following paths for recieve and change descriptor
    // recieve: "m/84h/1h/0h/0"
    // change: "m/84h/1h/0h/1" 
    let mut keys = Vec::new();

    for path in ["m/84h/1h/0h/0", "m/84h/1h/0h/1"] {
        let deriv_path: DerivationPath = DerivationPath::from_str(path).unwrap();
        let derived_xprv = &xprv.derive_priv(&secp, &deriv_path).unwrap();
        let origin: KeySource = (xprv.fingerprint(&secp), deriv_path);
        let derived_xprv_desc_key: DescriptorKey<Segwitv0> =
        derived_xprv.into_descriptor_key(Some(origin), DerivationPath::default()).unwrap();

        // Wrap the derived key with the wpkh() string to produce a descriptor string
        if let Secret(key, _, _) = derived_xprv_desc_key {
            let mut desc = "wpkh(".to_string();
            desc.push_str(&key.to_string());
            desc.push_str(")");
            keys.push(desc);
        }
    }
    
    // Return the keys as a tupple
    (keys[0].clone(), keys[1].clone())
}
```

## Conclusion
In this tutorial we saw some very basic BDK wallet functionality with a bitcoin core backend as the source and sync of blockchain data. This is just tip of the iceberg of BDK capabilities. BDK allows flexibility in all the dimensions of a bitcoin wallet, that is key chain, blockchain backend and database management. With all that power, we just implemented a trustless, non-custodial, private bitcoin wallet, backed by a bitcoin full node, with less than 200 lines of code (including lots of comments).

BDK thus allows wallet devs, to only focus on stuff that they care about, writing wallet logic. All the backend stuff like blockchain, key management, and databases are abstracted away under the hood.

To find and explore more about the BDK capabilities and how it can fit your development need refer the following resources.

 - [source code](https://github.com/bitcoindevkit/bdk)
 - [dev docs](https://docs.rs/bdk/0.10.0/bdk/)
 - [community](https://discord.com/invite/d7NkDKm)

















