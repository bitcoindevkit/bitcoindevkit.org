---
title: "2024 Q4 Update: What Have We Been Up To?"
description: "2024 Q4 Update on the Bitcoin Dev Kit Project"
authors:
    - thunderbiscuit
date: "2025-01-15"
tags: ["BDK", "project"]
draft: false
---

The bitcoindevkit team was very proud to release the 1.0 stable version of our bdk_wallet API in Q4! It's been a long time coming, and all that testing, reviewing, refactoring, and polishing finally paid off. Onwards! 🎉

Here are some of the notable releases and changes over Q4 to the software libraries we maintain:
- **The bdk_wallet library is now 1.0.** If you've been with us for a while you know that this has been a big goal over the past year.
- **The Book of BDK is live and out of beta.** Check out [https://bookofbdk.com](https://bookofbdk.com) for high-level documentation on a range of things related to the family of libraries we maintain.
- **The work continued on Kyoto (Compact Block Filters client).** The [bdk-kyoto](https://github.com/bitcoindevkit/bdk-kyoto) library also moved into the [Bitcoin Dev Kit GitHub organization](). Congrats Rob!
- **Triaging for the new feature release cadence.** We have agreed on a new, 8-week release cadence for the feature releases of 1.0 (1.1, 1.2, 1.3, etc.). [You can see our milestones for those releases here](https://github.com/bitcoindevkit/bdk/milestones?direction=asc&sort=due_date&state=open). This should allow us to release stuff on a steady cadence. Look out for the things that didn't make it into the initial 1.0 but should be ready soon!
- **Bugfix release 0.32.0.** We published a fix to the 0.31 library in December. Check it out if you're still migrating to the 1.0 API.

The language bindings for iOS, Android, and Python have also seen some new beta releases and a ton of new features, in preparation for the 1.0 final release.
- **Exposing Wallet and TxBuilder APIs.** Most of the `Wallet` and `TxBuilder` APIs from bdk_wallet are now available to language bindings users.
- **Better and more useful clients.** Our Electrum and Esplora clients have more methods exposed and can perform more things Rust users can do on the language bindings.
- **Docstrings are added to the library.** Leveraging a new feature of uniffi, this allows us to build API documentation for Kotlin, Swift, and Python once we're ready.
- **Increase our use of bitcoin-ffi type.** The bitcoin-ffi library is becoming more useful, with review from ldk-node and Payjoin developers. We're leaning on it more, and intend to continue its development moving forward.

### BDK Team in Action
Full-time grants changes:
- Our part-time grantee [Wei Chen](https://github.com/LagginTimes) transitioned into a full-time role! Welcome to the team Wei.
In addition to our full-time grantees, the [BDK Foundation](https://bitcoindevkit.org/foundation/) provides part-time grants to folks on special projects. Q4 is funding 1 project in particular:
- **Nymius.** [Nymius](https://github.com/nymius)'s been working on the clean up of the `filestore` crate as well as reviewing and helping the continuation of development for the `bdk_chain` and `bdk_core` crates.
We've also been active at conferences!
- [Leo](https://github.com/oleonardolima) presented a workshop on BDK at [SatsConf](https://www.satsconf.com.br/) in Sao Paulo!
- [Rob](https://github.com/rustaceanrob) presented on the [Kyoto](https://github.com/rustaceanrob/kyoto) client at [TabConf](https://6.tabconf.com/) this year.
- [Steve](https://github.com/notmandatory) also presented a workshop at [TabConf](https://6.tabconf.com/) on a demo axum async web based bdk wallet.
- [Alekos](https://github.com/afilini) presented on BDK at [Adopting Bitcoin](https://sv24.adoptingbitcoin.org/) in El Salvador!

### BDK in the Wild
Q4 saw 3 new projects integrating BDK into their software:
- [Alby](https://getalby.com/) is a browser extension that makes lightning and nostr easier to build on and use.
- [TwentyTwo](https://twenty-two.xyz/) produces the first 100% open source mobile-native hardware wallet: designed to keep your keys safe and seamlessly integrate into any mobile wallet app.
- The [Satoshi](https://satoshi.money/) app is live and is using BDK!
