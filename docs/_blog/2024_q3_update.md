---
title: "2024 Q3 Update: What Have We Been Up To?"
description: "2024 Q3 Update on the Bitcoin Dev Kit Project"
authors:
    - thunderbiscuit
date: "2024-11-07"
tags: ["BDK", "project"]
draft: false
---

The bitcoindevkit team has been hard at work for Q3 in 2024, polishing the API of our `bdk_wallet` crate and releasing 4 new beta versions (1, 2, 3, and 4!), and aiming to release a final 1.0 release by the end of 2024. Here are some of the notable changes and upgrades to the software libraries we maintain:
- **RBF by default on TxBuilder.** The transaction builder in BDK will now signal RBF by default.
- **New wallet builder API.** The new wallet builder offers flexibility and ease-of-development for future features. We've also been listening to user feedback, and brought back support for single-descriptor wallets.
- **MVP of the Book of BDK.** We are working on a high-level documentation website for BDK libraries called the Book of BDK. The MVP website is live at [bookofbdk.com](https://bookofbdk.com/).
- **Bug chasing and optimizations.** As feedback from early testers comes in, we are keeping a close eye on reported bugs and questions, and have been fixing a ton of smaller but very important snags!
- **Development of a CBF client crate and related bindings.** Work is ongoing on a crate to allow BDK users to interoperate with a new CBF library called [Kyoto](https://github.com/rustaceanrob/kyoto). Work has been done to integrate this with the language bindings for mobile users, and the preliminary integrations have been very positive.

The language bindings for iOS, Android, and Python have also seen some new beta releases and a ton of new features, in preparation for the 1.0 final release.
- **Exposing a much larger number of Wallet APIs.** The Wallet type in the language bindings now exposes most of what users will need for a 1.0 release.
- **Rework of the Kotlin and Swift build systems.** We have migrated the build workflows for bdk-jvm and bdk-android from Gradle scripts to shell scripts, making them easier to parse and consume for contributors and other libraries wanting to leverage our approach to bindings. We have also made it much easier to build the Swift package for iOS users.
- **Testing of Compact Block Filters for both Android and iOS.** Both our wallet examples have full examples of using the new [Kyoto](https://github.com/rustaceanrob/kyoto) client on mobile phones. Once the PR for the new client lands, users will have access to clear examples on how to leverage the new client!
- **Building bitcoin-ffi.** The team has been working on a crate called [bitcoin-ffi](https://github.com/bitcoindevkit/bdk-ffi), migrating the types we exposed from rust-bitcoin into a standalone crate that other projects building on uniffi can use. We have been stress-testing this in production and are finding new ways to leverage this approach.

### Our Grantees in Action
Full-time grants changes:
- Our lead Rust developer Evan is moving to a part-time grant while he goes and works for a company that leverages BDK!
In addition to our full-time grantees, the [BDK Foundation](https://bitcoindevkit.org/foundation/) provides part-time grants to folks on special projects. Q3 is funding 2 projects in particular:
- **Leonardo.** [Leo]()'s been working on our integration of the Tor Rust client into the Electrum and Esplora crates.
- **Rob.** [Rob]() is the brain behind the [Kyoto]() client, its BDK integration with `bdk_kyoto`, and the PR to wrap it all up into our language bindings!
- **Wei Chen.** [Wei](https://github.com/LagginTimes) is continuing his work on the lower-level BDK crates `bdk_chain` and `bdk_core`, as well as his work on the Electrum client.

We've also been active at conferences!
- Steve [was on a panel at the 2024 Bitcoin Conference](https://www.youtube.com/watch?v=Qlbwxbe7xHE) discussing with 2 teams that are building on BDK.
- The team was in Nashville for a week of hard work and collaboration between devs in the Rust bitcoin ecosystem we called the "Rust Bitcoin Summit". The event was so successful we're hoping to do it again next year! Here is a link to a [Citadel Dispatch podcast](https://serve.podhome.fm/episodepage/CitadelDispatch/cd136-rust-bitcoin-summit-with-poelstra-harding-myers-corallo-and-more) with some of the devs who hosted and participated.

### BDK in the Wild
In Q3, a number of new projects have started using BDK:
- The Protonmail team has released the latest tool in the Proton family: the [Proton Bitcoin Wallet App](https://proton.me/blog/proton-wallet-launch). The wallet is using the 1.0 beta version of the library. Welcome aboard Proton!
- The [bark Ark implementation]() started using the BDK beta releases for its wallet implementation.
- [Bitcoin Safe](https://bitcoin-safe.org/) released its first beta release.
- [Satsails](https://www.satsails.com/) is now live on the Play Store!
- [Strata](https://www.stratabtc.org/) has released a devnet version of their CLI wallet, which uses BDK.
- Our BDK Swift Example Wallet is [now available on iOS Testflight](https://testflight.apple.com/join/A3nAuYvZ)!
