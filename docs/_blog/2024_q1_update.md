---
title: "2024 Q1 Project Update"
description: "2024 Q1 update on the BDK project's progress."
authors:
    - Steve Myers
date: "2024-03-21"
tags: ["BDK","project"]
draft: false
---
<br>

### Core BDK

The majority of BDK rust library work this quarter was towards finishing new and improved electrum,  esplora and Bitcoin Core RPC (block-by-block) syncing APIs. Bug fixes and improvements were also completed for the transaction builder and other wallet APIs. Six bi-weekly 1.0.0-alpha releases were made ([alpha.3](https://github.com/bitcoindevkit/bdk/releases/tag/v1.0.0-alpha.3), [alpha.4](https://github.com/bitcoindevkit/bdk/releases/tag/v1.0.0-alpha.4), [alpha.5](https://github.com/bitcoindevkit/bdk/releases/tag/v1.0.0-alpha.5), [alpha.6](https://github.com/bitcoindevkit/bdk/releases/tag/v1.0.0-alpha.6), [alpha.7](https://github.com/bitcoindevkit/bdk/releases/tag/v1.0.0-alpha.7), [alpha.8](https://github.com/bitcoindevkit/bdk/releases/tag/v1.0.0-alpha.8)). For the quarter [54 PRs](https://github.com/bitcoindevkit/bdk/pulls?q=is%3Apr+merged%3A2024-01-01..2024-03-31+) were merged and [55 issues](https://github.com/bitcoindevkit/bdk/issues?q=is%3Aissue+closed%3A2024-01-01..2024-03-31+) were closed.

### BDK-FFI

For the language binding libraries (Kotlin, Swift, Python) the focus was on small bug fixes for the pre-1.0 releases ([0.30.0](https://github.com/bitcoindevkit/bdk-ffi/releases/tag/v0.31.0) and [0.30.1](https://github.com/bitcoindevkit/bdk-ffi/releases/tag/v0.31.1)) and creating the first 1.0.0-alpha bindings release ([1.0.0-alpha.7](https://github.com/bitcoindevkit/bdk-ffi/releases/tag/v1.0.0-alpha.7)). For the quarter [23 PRs](https://github.com/bitcoindevkit/bdk-ffi/pulls?q=is%3Apr+merged%3A2024-01-01..2024-03-31+) were merged and [8 issues](https://github.com/bitcoindevkit/bdk-ffi/issues?q=is%3Aissue+closed%3A2024-01-01..2024-03-31+) closed.

### Plans for Next Quarter

The focus for Q2 development is completing our first 1.0.0 beta release and improving user docs and testing for it. The team will also work on updating all language bindings (Kotlin/Swift/Python) to use new rust lib 1.0.0 beta APIs.

### BDK contributors spotlight

In this section we share what some of our hardworking contributors are doing to educate people about BDK, help on board new projects, and generally promote bitcoin and open source development around the world.

**[Evan Linjin](https://github.com/evanlinjin/)**

February 22: Gave a talk on [BDK 1.0 at BTC++](https://btcplusplus.dev/conf/ba24/talks) in Buena Aires, Argentina.


**Other current and future contributors...**

If you are a contributor to BDK and doing something fun that's BDK and/or bitcoin related let us know! Tag [@bitcoindevkit](https://twitter.com/bitcoindevkit/) on X, [notmandatory](https://primal.net/profile/npub1ke470rdgnxg4gjs9cw3tv0dp690wl68f5xak5smflpsksedadd7qtf8jfm) on nostr, or send us an email: blog at bitcoindevkit dot org.