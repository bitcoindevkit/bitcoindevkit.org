# Bitcoin Dev Kit

The [Bitcoin Dev Kit (BDK)](https://github.com/bitcoindevkit) project (originally called Magical Bitcoin 🧙) aims to build a collection of tools and libraries that are designed to be a solid foundation for cross platform Bitcoin wallets, along with a fully working *reference implementation* wallets for various platforms.
All BDK components are designed to be lightweight and modular so that they can be adapted for virtually any use-case: from single-sig mobile wallets to multi-billion-dollar cold storage vaults.

The main long-term goal is to concentrate the development efforts of multiple people and companies into one open source and very well reviewed project, instead of dispersing them over multiple closed/semi-closed or
poorly designed projects.

While some parts of the library are still considered "experimental" (check the docs for more info), the core [`Wallet`](https://docs.rs/bdk/latest/bdk/wallet/struct.Wallet.html) architecture is now considered stable. We still can't commit to keeping this same exact API forever,
but we are not expecting to do any major breaking change in that area.

If you want to try out the library for your projects, now it's finally a good time to do it! You can start by checking out the ["getting started"](/getting-started/) section in our blog or joining our [Discord](https://discord.gg/dstn4dQ)
server to chat with us.

## Initial Configuration

Most Rust projects use Cargo to download and build the libraries the code depends on. To configure BDK package in the `Cargo.toml`, the following line can be added:

```
[dependencies]
bdk = "0.20.0"
```

Or it is possible to install only the features that will be used in the project.

```
[dependencies]
bdk = { version = "0.20.0", default-feature = false, features = ["all-keys", "key-value-db",  "rpc"] }
```

BDK uses a set of [feature flags](https://doc.rust-lang.org/cargo/reference/manifest.html#the-features-section) to reduce the amount of compiled code by allowing projects to only enable the features they need.

By default, BDK enables two internal features, `key-value-db` and `electrum`.

It is recommended that new users use the default features which will enable basic descriptor wallet functionality. More advanced users can disable the `default` features (`--no-default-features`) and build the BDK library with only the necessary features.

Below is a list of the available feature flags and the additional functionality they provide.

* `all-keys`: all features for working with bitcoin keys
* `async-interface`: async functions in bdk traits
* `keys-bip39`: [BIP-39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) mnemonic codes for generating deterministic keys

## Internal Features

These features do not expose any new API, but influence internal implementation aspects of BDK.

* `compact_filters`: [compact_filters](https://docs.rs/bdk/latest/bdk/blockchain/compact_filters/index.html) client protocol for interacting with the bitcoin P2P network
* `electrum`: [electrum](https://docs.rs/bdk/latest/bdk/blockchain/electrum/index.html) client protocol for interacting with electrum servers
* `esplora`: [esplora](https://docs.rs/bdk/latest/bdk/blockchain/esplora/index.html) client protocol for interacting with blockstream [electrs](https://github.com/Blockstream/electrs) servers
* `key-value-db`: key value [database](https://docs.rs/bdk/latest/bdk/database/index.html) based on [sled](https://crates.io/crates/sled) for caching blockchain data


## Playground

As a way of demonstrating the flexibility of this project, a minimalistic command line tool (called `bdk-cli`) is available as a debugging tool in the [`bdk-cli`](https://github.com/bitcoindevkit/bdk-cli)
repo. It has been compiled to WebAssembly and can be used directly from the browser. See the [playground](/bdk-cli/playground) section to give it a try!

The playground relies on [Esplora](https://blockstream.info) to monitor the blockchain and is currently locked in testnet-only mode, for obvious safety reasons. The native command line tool can also be used in regtest mode when installed on
a computer. See the [bdk-cli](/bdk-cli) section to learn more.

## Descriptors

One of the original milestones of this project was to provide wallets with "almost magical" support for very complex spending policies, without having to individually translate them into code. It may sound disappointing, but there isn't, in fact,
any real magic in this wallet: the generalization is achieved thanks to [*descriptors*](https://github.com/bitcoin/bitcoin/blob/master/doc/descriptors.md), that are now slowly starting to see adoption in a few other Bitcoin projects as well.

The author of this project strongly believes descriptors will be a big part of the future generation of Bitcoin wallets, since they provide a very flexible scripting language that can also be extended as the
technology and tooling of Bitcoin evolves and changes (Schnorr signatures, Taproot, etc).

To learn more, check out the specific [Descriptors section](/descriptors).

The following code shows how to generate a random mnemonic, the extended (and deterministic) keys from that mnemonic and finally the descriptors from the extended private keys.

To be able to run this code, the `bdk` dependency in `Cargo.toml` must be set as follows:

```
[dependencies]
bdk = { version = "0.15.0", default-feature = false, features = ["all-keys"] }
```

```rust
use bdk::bitcoin::Network;
use bdk::database::MemoryDatabase;
use bdk::keys::{DerivableKey, GeneratableKey, GeneratedKey, ExtendedKey, bip39::{Mnemonic, WordCount, Language}};
use bdk::template::Bip84;
use bdk::{miniscript, Wallet, KeychainKind};

fn main() {
    println!("Hello, world!");

    let network = Network::Testnet; // Or this can be Network::Bitcoin, Network::Signet or Network::Regtest

    // Generate fresh mnemonic
    let mnemonic: GeneratedKey<_, miniscript::Segwitv0> = Mnemonic::generate((WordCount::Words12, Language::English)).unwrap();
    // Convert mnemonic to string
    let mnemonic_words = mnemonic.to_string();
    // Parse a mnemonic
    let mnemonic  = Mnemonic::parse(&mnemonic_words).unwrap();
    // Generate the extended key
    let xkey: ExtendedKey = mnemonic.into_extended_key().unwrap();
    // Get xprv from the extended key
    let xprv = xkey.into_xprv(network).unwrap();

    // Create a BDK wallet structure using BIP 84 descriptor ("m/84h/1h/0h/0" and "m/84h/1h/0h/1")
    let wallet = Wallet::new_offline(
        Bip84(xprv, KeychainKind::External),
        Some(Bip84(xprv, KeychainKind::Internal)),
        network,
        MemoryDatabase::default(),
    )
    .unwrap();

    println!("mnemonic: {}\n\nrecv desc (pub key): {:#?}\n\nchng desc (pub key): {:#?}",
        mnemonic_words,
        wallet.get_descriptor_for_keychain(KeychainKind::External).to_string(),
        wallet.get_descriptor_for_keychain(KeychainKind::Internal).to_string());
}
```

More information about each component used in the code can be found in [BDK Documentation](https://docs.rs/bdk/latest/bdk/index.html).
