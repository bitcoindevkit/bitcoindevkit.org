---
title: "2025 Q1 Update: What Have We Been Up To?"
description: "2025 Q1 Update on the Bitcoin Dev Kit Project"
authors:
    - thunderbiscuit
date: "2025-04-01"
tags: ["BDK", "project"]
draft: false
---

The bitcoindevkit team is hitting cruising speed after the release of the 1.0 bdk_wallet API. We are implementing a new release cadence of 8-week cycles, planning to do a feature release (1.1, 1.2, etc.) on [these dates for 2025](
https://github.com/bitcoindevkit/bdk/milestones).

Here are some of the notable releases and changes over Q1 to the software libraries we maintain:
- **The new bdk_wallet 1.1 library is out.** This one includes some of the goodies we could not release in 1.0, including support for Testnet 4, creating transactions version 2 by default, and supporting single-descriptor wallets!
- **The Book of BDK has seen significant improvements.** After a few months of use and feedback on the book, we have updated a ton of pages and examples to reflect some of the new and unclear questions we were getting from users on our Discord server and on GitHub. Check out [https://bookofbdk.com](https://bookofbdk.com)!
- **Kyoto (a new Compact Block Filters client) is now usable with BDK.** The [bdk-kyoto](https://github.com/bitcoindevkit/bdk-kyoto) library moved into the [Bitcoin Dev Kit GitHub organization](), and while the client should be considered experimental, it can now be used directly with BDK wallets!
- **Preparing for BDK Tech Talks.** The BDK Foundation is planning to host a series of technical talks relating to BDK, including team members showcasing their work, sample apps, or ongoing PRs, and BDK users telling their story of using BDK in production. See [this issue]() for all the details! Some of the talks will be recorded and posted on our [Youtube channel](https://www.youtube.com/@bitcoindevkit).
- **PGP Keys for the team are published.** Our website has a [new page with PGP keys](https://bitcoindevkit.org/foundation/pgp/) for some of the core members of the team as well as board members of the Foundation.

The language bindings for iOS, Android, and Python have released their first stable release (1.1)! 🎉. This is a significant milestone for the language bindings team, and for all our users on mobile.
- **1.1 is out.** This is our first stable release. Tons of new stuff was added since the 0.32.0 release, too much to list out!
- **Kyoto is merged on the master branch.** If you're looking to start experimenting with Compact Block Filters on mobile, we've got you covered! You can build the latest version of the libraries and use the new experimental client directly. We also have examples on [Android](https://github.com/bitcoindevkit/devkit-wallet) and [Desktop](https://github.com/thunderbiscuit/godzilla-wallet) ready to dig into.
- **We now release API docs for Kotlin + Swift.** Our API docs are getting a facelift! You can check out the [Kotlin/Android ones](https://bitcoindevkit.org/docs/) or the Swift ones (directly in XCode). Python to come soon!

## Our Grantees in Action

Full-time grants changes:
- Our part-time grantee [Nymius](https://github.com/nymius) transitioned from a part-time grant into a full-year project grant! His core project is working on the development of Silent Payments for BDK. Welcome to the team Nymius. 

We've also been active at conferences!
- [Leo](https://github.com/oleonardolima) hosted an introduction to BDK and BDK PR Review Club and also took part in a discussion with other Brazilian grantees about his FOSS experience for the Vinteum BDL Residency folks the week before bitcoin++ in São Paulo!

## BDK in the Wild

Q1 saw 4 new projects integrating BDK into their software:
- [Frostnap](https://frostsnap.com/) produces hardware and mobile apps that together form the ultimate bitcoin security system is ready for early adopters.
- [Cove Wallet](https://covebitcoinwallet.com/) is a simple yet powerful bitcoin mobile wallet. It's intuitive and simple for newcomers while being powerful enough for experienced bitcoiners.
- [Fedimint](https://fedimint.org/) is a modular open source protocol to custody and transact bitcoin in a community context, built on a strong foundation of privacy.
- [BitVault](https://www.bitvault.sv/) is your fortress against physical attacks and hacks, by employing time-delayed transactions and a multisig convenience service to shield your assets.
