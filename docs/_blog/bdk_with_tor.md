---
title: "Using BDK with Tor"
description: "How to integrate Tor client to sync BDK wallet with tor enabled blockchain service"
authors:
    - rorp
date: "2023-01-03"
tags: ["tutorial", "tor", "wallet", "blockchain"]
---

## Introduction

It’s easy to underestimate the importance of privacy tech for Bitcoin, 
especially when connecting to third party services. They can learn your 
IP address and associate the transactions you sent over it. You can only 
hope that this information will not be leaked anytime in the future with 
unpredictable consequences. In order to use Bitcoin privately, you need 
to encrypt and anonymize the data you send over the Internet.

Tor is one of the must-have privacy preserving tools for the Internet in 
general, and for Bitcoin in particular. Tor network consists of nodes that 
use clever cryptographic methods to encrypt user data and transfer them as 
anonymously as possible.

In this article we show how to integrate Tor with your BDK application.

## Prerequisite

First, you would need to have a Tor daemon up and running.

On Mac OS X you can install with Homebrew.

```bash
brew install tor
brew services start tor
```

On Ubuntu or other Debian-based distributions.

```bash
sudo apt install tor
```

In some cases you'll need to wait a minute or two for the bootstrapping to finish.
In general, Tor is not the fastest network, so if any of the examples below fail
due to timeout, simply restart it.

At the very end of the article we’ll show how to integrate Tor directly to 
your application.

By default, Tor creates a [SOCKS5](https://en.wikipedia.org/wiki/SOCKS) proxy 
endpoint and listens on port 9050. Your application should connect to the 
proxy on `localhost:9050` and use it for its network activities.

## Setting Up

Create a new cargo project.

```bash
mkdir ~/tutorial
cd tutorial
cargo new bdk-tor
cd bdk-tor
```

Open `src/main.rs` file remove all its contents and add these lines.

```rust
use std::str::FromStr;
use bdk::bitcoin::util::bip32;
use bdk::bitcoin::util::bip32::ExtendedPrivKey;
use bdk::bitcoin::Network;
use bdk::database::MemoryDatabase;
use bdk::template::Bip84;
use bdk::{KeychainKind, SyncOptions, Wallet};

// add additional imports here

fn main() {
    let network = Network::Testnet;

    let xpriv = "tprv8ZgxMBicQKsPcx5nBGsR63Pe8KnRUqmbJNENAfGftF3yuXoMMoVJJcYeUw5eVkm9WBPjWYt6HMWYJNesB5HaNVBaFc1M6dRjWSYnmewUMYy";

    let xpriv = bip32::ExtendedPrivKey::from_str(xpriv).unwrap();

    let blockchain = create_blockchain();

    let wallet = create_wallet(&network, &xpriv);

    println!("Syncing the wallet...");

    wallet.sync(&blockchain, SyncOptions::default()).unwrap();

    println!(
        "The wallet synced. Height: {}",
        blockchain.get_height().unwrap()
    );
}

fn create_wallet(network: &Network, xpriv: &ExtendedPrivKey) -> Wallet<MemoryDatabase> {
    Wallet::new(
        Bip84(*xpriv, KeychainKind::External),
        Some(Bip84(*xpriv, KeychainKind::Internal)),
        *network,
        MemoryDatabase::default(),
    )
    .unwrap()
}
```

In this code we create a testnet wallet with `create_wallet()` function and 
try to sync it with a specific blockchain client implementation. We create a 
blockchain client using `create_blockchain()` function. We’ll implement it 
later for each type of blockchain client supported by BDK.

## ElectrumBlockchain

The Electrum client is enabled by default so the `Cargo.toml` dependencies 
section will look like this.

```toml
[dependencies]
bdk = { version = "^0.26"}
```

And the imports look like this.

```rust
use bdk::blockchain::{ElectrumBlockchain, GetHeight};
use bdk::electrum_client::{Client, ConfigBuilder, Socks5Config};
```

Here is the implementation of `create_blockchain()` function for the 
Electrum client.

```rust
fn create_blockchain() -> ElectrumBlockchain {
    let url = "ssl://electrum.blockstream.info:60002";
    let socks_addr = "127.0.0.1:9050";

    println!("Connecting to {} via {}", &url, &socks_addr);

    let config = ConfigBuilder::new()
        .socks5(Some(Socks5Config {
            addr: socks_addr.to_string(),
            credentials: None,
        }))
        .unwrap()
        .build();

    let client = Client::from_config(url, config).unwrap();

    ElectrumBlockchain::from(client)
}
```

In this example we create an instance of `Socks5Config` which defines the 
Tor proxy parameters for `ElectrumBlockchain`.

## Blocking EsploraBlockchain

The blocking version of `EsploraBlockchain` uses `ureq` crate to send HTTP 
requests to Eslora backends. By default, its SOCKS5 feature is disabled, 
so we need to enable it in `Cargo.toml`.

```toml
[dependencies]
bdk = { version = "^0.26", default-features = false, features = ["use-esplora-blocking"]}
```

The imports are

```rust
use bdk::blockchain::{EsploraBlockchain, GetHeight};
use bdk::blockchain::esplora::EsploraBlockchainConfig;
use bdk::blockchain::ConfigurableBlockchain;
```

And `create_blockchain()` implementation is

```rust
fn create_blockchain() -> EsploraBlockchain {
    let url = "http://mempoolhqx4isw62xs7abwphsq7ldayuidyx2v2oethdhhj6mlo2r6ad.onion/testnet/api";
    let socks_url = "socks5://127.0.0.1:9050";

    println!("Connecting to {} via {}", &url, &socks_url);

    let config = EsploraBlockchainConfig {
        base_url: url.into(),
        proxy: Some(socks_url.into()),
        concurrency: None,
        stop_gap: 20,
        timeout: Some(120),
    };

    EsploraBlockchain::from_config(&config).unwrap()
}
```

Here we use `proxy()` method of the config builder to set the Tor proxy 
address. Please note, that unlike the previous examples, the Esplora client 
builder requires not just a proxy address, but a URL 
“socks5://127.0.0.1:9050”.

## Asynchronous EsploraBlockchain

There’s no need in enabling SOCKS5 for the asynchronous Esplora client, 
so we are good to go without additional dependencies.

```toml
[dependencies]
bdk = { version = "^0.26", default-features = false, features = ["use-esplora-async"]}
```

The imports are the same as in previous example.

```rust
use bdk::blockchain::{EsploraBlockchain, GetHeight};
use bdk::blockchain::esplora::EsploraBlockchainConfig;
use bdk::blockchain::ConfigurableBlockchain;
```

`create_blockchain()` is almost identical.

```rust
fn create_blockchain() -> EsploraBlockchain {
    let url = "http://mempoolhqx4isw62xs7abwphsq7ldayuidyx2v2oethdhhj6mlo2r6ad.onion/testnet/api";
    let socks_url = "socks5h://127.0.0.1:9050";

    println!("Connecting to {} via {}", &url, &socks_url);

    let config = EsploraBlockchainConfig {
        base_url: url.into(),
        proxy: Some(socks_url.into()),
        concurrency: None,
        stop_gap: 20,
        timeout: Some(120),
    };

    EsploraBlockchain::from_config(&config).unwrap()
}
```

There are two notable differences though. First, we call `build_async()` to 
create an asynchronous Esplora client. Second the SOCKS5 URL scheme is 
“socks5h”. It’s not a typo. The async client supports two SOCKS5 schemes 
“socks5” and “socks5h”. The difference between them is that the former 
makes the client to resolve domain names, and the latter does not, so the 
client passes them to the proxy as is. A regular DNS resolver cannot 
resolve Tor onion addresses, so we should use “socks5h” here.

## CompactFiltersBlockchain

Add these lines to the dependencies section of `Cargo.toml` file to enable
BIP-157/BIP-158 compact filter support.

It can take a while to sync a wallet using compact filters over Tor, so be
patient.

```toml
[dependencies]
bdk = { version = "^0.26", default-features = false, features = ["compact_filters"]}
```

Now add the required imports into `src/main.rs`.

```rust
use std::sync::Arc;
use bdk::blockchain::compact_filters::{Mempool, Peer};
use bdk::blockchain::{CompactFiltersBlockchain, GetHeight};
```

`create_blockchain()` function will look like this.

```rust
fn create_blockchain() -> CompactFiltersBlockchain {
    let peer_addr = "neutrino.testnet3.suredbits.com:18333";
    let socks_addr = "127.0.0.1:9050";

    let mempool = Arc::new(Mempool::default());
    
    println!("Connecting to {} via {}", peer_addr, socks_addr);
    
    let peer =
        Peer::connect_proxy(peer_addr, socks_addr, None, mempool, Network::Testnet).unwrap();

    CompactFiltersBlockchain::new(vec![peer], "./wallet-filters", Some(500_000)).unwrap()
}
```

Here we use `Peer::connect_proxy()` which accepts the address to the SOCKS5
proxy and performs all the heavy lifting for us.

## Integrated Tor daemon

As an application developer you don’t have to rely on your users to install
and start Tor to use your application. Using `libtor` crate you can bundle 
Tor daemon with your app. 

`libtor` builds a Tor binary from the source files. Since Tor is written in C
you'll need a C compiler and build tools.

Install these packages on Mac OS X:

```bash
xcode-select --install
brew install autoconf
brew install automake
brew install libtool
brew install openssl
brew install pkg-config
export LDFLAGS="-L/opt/homebrew/opt/openssl/lib"
export CPPFLAGS="-I/opt/homebrew/opt/openssl/include"
```

Or these packages on Ubuntu or another Debian-based Linux distribution:

```bash
sudo apt install autoconf automake clang file libtool openssl pkg-config
``` 

Then add these dependencies to the `Cargo.toml` file.

```toml
[dependencies]
bdk = { version = "^0.26" }
libtor = "47.8.0+0.4.7.x"
```

This is an example of how we can use `libtor` to start a Tor daemon.

```rust
use std::fs::File;
use std::io::prelude::*;
use std::thread;
use std::time::Duration;

use libtor::LogDestination;
use libtor::LogLevel;
use libtor::{HiddenServiceVersion, Tor, TorAddress, TorFlag};

use std::env;

pub fn start_tor() -> String {
    let socks_port = 19050;

    let data_dir = format!("{}/{}", env::temp_dir().display(), "bdk-tor");
    let log_file_name = format!("{}/{}", &data_dir, "log");

    println!("Staring Tor in {}", &data_dir);

    truncate_log(&log_file_name);

    Tor::new()
        .flag(TorFlag::DataDirectory(data_dir.into()))
        .flag(TorFlag::LogTo(
            LogLevel::Notice,
            LogDestination::File(log_file_name.as_str().into()),
        ))
        .flag(TorFlag::SocksPort(socks_port))
        .flag(TorFlag::Custom("ExitPolicy reject *:*".into()))
        .flag(TorFlag::Custom("BridgeRelay 0".into()))
        .start_background();

    let mut started = false;
    let mut tries = 0;
    while !started {
        tries += 1;
        if tries > 120 {
            panic!(
                "It took too long to start Tor. See {} for details",
                &log_file_name
            );
        }

        thread::sleep(Duration::from_millis(1000));
        started = find_string_in_log(&log_file_name, &"Bootstrapped 100%".into());
    }

    println!("Tor started");

    format!("127.0.0.1:{}", socks_port)
}
```

First, we create a Tor object, and then we call `start_background()` method 
to start it in the background. After that, we continuously try to find 
“Bootstrapped 100%” string in the log file. Once we find it, Tor is 
ready to proxy our connections. We use port 19050 because, the user can 
have their own instance of Tor running already.

Next you can modify `create_blockchain()` like this

```rust
fn create_blockchain() -> ElectrumBlockchain {
    let url = "ssl://electrum.blockstream.info:60002";
    let socks_addr = start_tor();
    
    ...
}
```

In this example we start Tor first, then use the address returned by 
`start_tor()` function as proxy address.

We omitted `find_string_in_log()` and `truncate_log()` for brevity. You 
can find their implementations in [esplora_backend_with_tor.rs](https://github.com/bitcoindevkit/bdk/blob/master/examples/esplora_backend_with_tor.rs)
