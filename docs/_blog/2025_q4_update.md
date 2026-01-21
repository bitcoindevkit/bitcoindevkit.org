---
title: "2025 Q4 Update: What Have We Been Up To?"
description: "2025 Q4 Update on the Bitcoin Dev Kit Project"
authors:
    - thunderbiscuit
date: "2026-01-21"
tags: ["BDK", "project"]
draft: false
---

Q4 saw two new feature releases of the bdk_wallet library (`2.2.0` and `2.3.0`), continued work on documentation, and a strong presence at TABConf where four team members presented talks and workshops. We also had a productive three-day summit in Nashville where a large part of the team met with other Rust + Bitcoin developers.

Here are some of the notable releases and changes over Q4 to the software libraries we maintain:
- **Release 2.2 and 2.3 of `bdk_wallet`.** These releases continue to build on the 2.0 foundation with new features and improvements. Along came the [2.2](https://github.com/bitcoindevkit/bdk-ffi/releases/tag/v2.2.0) release of bdk-ffi, including the Swift, Android, JVM, and Python libraries.
- **Release 0.24.1 of `rust-electrum-client`.** This release fixed some long-standing issues identified by users of the library.
- **PayJoin support added to bdk-cli.** We've added a PayJoin feature to bdk-cli to test basic integration with BDK. See [the PR](https://github.com/bitcoindevkit/bdk-cli/pull/200) for details.
- **New Book of BDK section: Release Guide.** We've added a comprehensive [Release Guide](https://bookofbdk.com/release-guide/guide/) to help developers understand our release process.
- **Library Tiers defined.** We now have clearly defined [Library Tiers](https://bookofbdk.com/getting-started/tiers/) to help developers understand the maturity and stability of our various libraries.
- **MetaMask adds self-custodial Bitcoin snap built with bdk-wasm.** MetaMask wallet announced a new self-custodial Bitcoin "snap" (plugin) built using our bdk-wasm library, bringing BDK to a massive user base.

## Our Grantees in Action

We had a strong presence at TABConf this year with four presentations from the team:
- [Luis](https://github.com/luisschwab) presented "Merkle Trees is the Perfect Place for UTXOs: Floresta as a chain source for BDK" ([Day 4](https://github.com/TABConf/7.tabconf.com/issues/33))
- [ValuedMammal](https://github.com/ValuedMammal) presented "Planning ahead: building transactions with complex spending conditions in BDK" ([Day 4](https://github.com/TABConf/7.tabconf.com/issues/52))
- [Thunderbiscuit](https://github.com/thunderbiscuit) presented "Documenting BDK" ([Day 4](https://github.com/TABConf/7.tabconf.com/issues/38))
- [Nymius](https://github.com/nymius) hosted a workshop "Adding silent payments support to BDK" ([Day 4](https://github.com/TABConf/7.tabconf.com/issues/32))

Following TABConf, the BDK team met with other Rust and Bitcoin-based developers in Nashville for a three-day summit, collaborating on initiatives and planning for the year ahead.

## BDK in the Wild

Q4 saw new projects integrating BDK into their software and being added to our [adoption page](https://bitcoindevkit.org/adoption/):
- [Eigenwallet](https://eigenwallet.org/)
- [Satsigner](https://satsigner.com/)
- [MetaMask](https://metamask.io/)
- [SatGo](https://satgo.io/)

Other notable integrations:
- **Bitcoin Safe released Kyoto on Mainnet.** Bitcoin Safe is now running Kyoto, our Compact Block Filters client, on mainnet!
- **rust-cktap in iOS.** Our [rust-cktap](https://github.com/bitcoindevkit/rust-cktap) library is being used in [SatsBuddy](https://github.com/reez/SatsBuddy), an iOS app for interacting with SATSCARD devices.
