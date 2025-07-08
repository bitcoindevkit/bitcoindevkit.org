---
title: "2025 Q2 Update: What Have We Been Up To?"
description: "2025 Q2 Update on the Bitcoin Dev Kit Project"
authors:
    - matthewramsden
date: "2025-07-02"
tags: ["BDK", "project"]
draft: false
---

The second quarter of 2025 was an exciting one for the Bitcoin Dev Kit. With major releases, new libraries, a YouTube launch, and ongoing contributions from our community of grantees and collaborators, BDK continues to push forward the frontier of building Bitcoin wallets.

Here are some of the notable releases and changes over Q2 to the software libraries we maintain:
- **The bdk_wallet 2.0 release!** Following on the heels of 1.0, we've released [BDK 2.0](https://github.com/bitcoindevkit/bdk_wallet/releases/tag/wallet-2.0.0) which includes a bug fix for handling stuck or evicted transactions, performance enhancements for large wallets, more extensive test coverage, and the return of TxDetails.
- **BDK CLI 1.0.** Our [command-line interface has reached its 1.0 milestone](https://github.com/bitcoindevkit/bdk-cli/releases/tag/v1.0.0), uses bdk_wallet 1.0.0 and integrates Kyoto, the new client for compact block filters in BDK. It sets SQLite as the default database and drops support for sled.
- **Language Bindings version 1.2 for iOS, Android, and Python 1.2** The [bdk-ffi 1.2 release](https://github.com/bitcoindevkit/bdk-ffi/releases/tag/v1.2.0) brings Compact Block Filter support through our Kyoto integration, making privacy-preserving light clients accessible to mobile developers. We've also published comprehensive [API documentation](https://bitcoindevkit.org/docs/) for Java and Android bindings.

There are also new projects and initiatives being built.
- **Silent Payments.** The new [bdk-sp](https://github.com/bitcoindevkit/bdk-sp) crate brings BIP352 Silent Payments functionality to BDK. It has delivered a complete CLI implementation with wallet initialization, PSBT creation and signing, and blockchain scanning capabilities, and full compatibility with BIP352 test vectors and integration examples with bdk-tx.
- **Transaction Building.** The experimental [bdk-tx](https://github.com/bitcoindevkit/bdk-tx) project represents an evolution of transaction building. This effort to decouple transaction building from the wallet, using rust-miniscript's planning module for optimal satisfaction-weight calculations and the new bdk_coin_select crate for policy-aware coin selection.
- **Streaming Electrum Client.** The [electrum_streaming_client](https://github.com/bitcoindevkit/electrum_streaming_client) is a streaming, sans-IO Electrum client for asynchronous and blocking Rust applications. This crate provides low-level primitives and high-level clients for communicating with Electrum servers over JSON-RPC. It supports both asynchronous (futures/tokio) and blocking transport models.

## Our Grantees in Action

We're excited to welcome new Silver [corporate members](https://bitcoindevkit.org/blog/_2025q1-new-foundation-members/) to the BDK Foundation and thank them for their financial support!
- [AnchorWatch](https://www.anchorwatch.com)
- [CleanSpark](https://www.cleanspark.com)
- [Proton Foundation](https://proton.me/foundation)

We're also excited to welcome new Associate members who are supporting the BDK Foundation by training & funding developers working on BDK!
- [Btrust](https://www.btrust.tech)
- [Vinteum](https://vinteum.org)

- ** Grantees**
BDK Project Maintainer
- [Leonardo](https://github.com/oleonardolima), funded by Vinteum, continues his work on Tor integration for the Electrum and Esplora crates, enhancing privacy options for BDK users.

Btrust Starter Grantees
- [Itoro Ukpong](https://github.com/ItoroD), working on the bdk-ffi language bindings and Android example wallet.
- [Peter Tyonum](https://github.com/tvpeter), upgrading bdk-cli to the latest bdk rust libraries and adding new features.

Thunderbiscuit is taking a 2-month break from BDK using an HRF grant to create an iOS version of [Padawan Wallet](https://play.google.com/store/apps/details?id=com.coyotebitcoin.padawanwallet)

- **BDK YouTube Channel.** We've launched our official [YouTube channel](https://www.youtube.com/@bitcoindevkit) featuring our [Technical Talks series of 6 videos](https://www.youtube.com/playlist?list=PLFQTgyPgNM1iP9vqO6-Oic02x-MhxrNQu), covering topics:
1. Language Bindings by [thunderbiscuit](https://github.com/thunderbiscuit)
2. Silent Payments by [nymius](https://github.com/nymius)
3. [Transaction Ordering](https://github.com/ValuedMammal/valuedmammal.github.io?tab=readme-ov-file#which-came-first) by [ValuedMammal](https://github.com/ValuedMammal)
4. CLI by [Peter Tyonum](https://github.com/tvpeter)
5. Compact Block Filters by [Robert Netzke](https://github.com/rustaceanrob)
6. Mobile by [Matthew Ramsden](https://github.com/reez)

## BDK in the Wild

- [Cove Wallet](https://covebitcoinwallet.com/) is a simple yet powerful bitcoin mobile wallet that is now officially released on the App Store.
- [Frostnap](https://frostsnap.com/) produces hardware and mobile apps that together form the ultimate bitcoin security system is now open for pre-orders.
