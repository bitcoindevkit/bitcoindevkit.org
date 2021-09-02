---
title: "Release v0.9.0"
description: "Announcing the v0.9.0 release of BDK"
authors:
    - Alekos Filini
date: "2021-07-11"
tags: ["rust", "release"]
hidden: true
draft: false
---

A new release of BDK is out: [`v0.9.0`] brings support for Bitcoin Core backends, more sanity checks and bugfixes.

You can find the full [v0.9.0 changelog][changelog] on GitHub.

## What's new in v0.9.0

Below are some highlights of the new release:

## Bitcoin Core `Blockchain` Backend

This release finally adds support for using a Bitcoin Core node as the `Blockchain` backend for a wallet, through the RPC. This is still considered experimental for the time being, since there are a few missing
things that we'd like to add, and adding those could force us to change the API a little.

Nonetheless, if you don't mind a breaking-change later on it's already fully functional.

The backend works by importing addresses in Bitcoin Core using the `importmulti` call.

Using it is pretty straightforward, here's a quick example:

```rust
let config = RpcConfig {
    url: "127.0.0.1:18332".to_string(),
    auth: bitcoincore_rpc::Auth::CookieFile("/home/user/.bitcoin/.cookie".into()),
    network: bdk::bitcoin::Network::Testnet,
    wallet_name: "wallet_name".to_string(),
    skip_blocks: None,
};
let blockchain = RpcBlockchain::from_config(&config);
```

Similarly to the compact filters backend, the `skip_blocks` field allows for starting a rescan of the blockchain at a given height rather than the genesis, saving some time. The rescan is only performed once, the
first time an address is imported. Afterwards every `sync()` call will only perform a few queries on the node and it will be much faster.

## Updated `TransactionDetails` Struct

To better accomodate the Bitcoin Core RPC and potentially more future new backends, the [`TransactionDetails`] structure have been updated as follows:

- The `fees` field has been renamed to `fee` and it has been made optional. `Blockchain` backends can set this to `None` when they have no way of computing the fee of a transaction
- The `timestamp` and `height` fields have been merged into an optional [`ConfirmationTime`] struct

## Verify Downloaded TXs

This release also introduces an opt-in feature called `verify` that can be enabled to verify the unconfirmed transactions that BDK downloads from untrusted sources like Electrum servers.

Verifying the transactions against the consensus rules can be an additional protection against some kind of attacks that could trick a wallet into creating wrong RBF (BIP 125) "bump" transactions. Check out [the issue][issue_verify]
for more details.

## Contributors

A huge thanks to everybody who contributed to this new release with suggestions, pull requests and bug reports.

Since the `v0.8.0` release around a month ago, we've had `45` new commits made by `6` different contributors for a total of `1336` additions and `266` deletions. Here's the [full diff][gh_diff].

A special thanks to the new contributor for this release:

- [@jb55][@jb55] - William Casarin

[changelog]: https://github.com/bitcoindevkit/bdk/blob/7a9b691f68c41116dc7857bc0267a2e3b2eafdd3/CHANGELOG.md
[gh_diff]: https://github.com/bitcoindevkit/bdk/compare/v0.8.0...v0.9.0

[issue_verify]: https://github.com/bitcoindevkit/bdk/issues/352

[`TransactionDetails`]: https://docs.rs/bdk/0.9.0/bdk/struct.TransactionDetails.html
[`ConfirmationTime`]: https://docs.rs/bdk/0.9.0/bdk/struct.ConfirmationTime.html

[`v0.9.0`]: https://crates.io/crates/bdk/0.9.0
