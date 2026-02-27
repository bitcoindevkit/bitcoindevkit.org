# 2023 Q4 Project Update

:lucide-pen-tool: &nbsp; [`Steve Myers`]() &nbsp; [`Daniela Brozzoni`]()  
:lucide-calendar-1: &nbsp; `Feb 20, 2024`
---

### This Post

The [Spiral](https://spiral.xyz) team has graciously supported BDK financially (and spiritually) for the past four years and since early 2022 the BDK team has let folks know what we've been up to via the [Spiral blog](https://spiral.xyz/blog/). As of last summer we are grateful to also have received a generous [OpenSats grant](https://opensats.org/blog/bitcoin-and-nostr-grants-august-2023) supporting our project. To keep our current and future financial supporters, open source contributors, and downstream users updated on our progress, starting this year we will be publishing a quarterly BDK project updates here on our blog.

### End of Year Review

The BDK project is made up of a core suite of [rust](https://www.rust-lang.org/) libraries ([bdk-*](https://github.com/bitcoindevkit/bdk?tab=readme-ov-file#architecture)) that work together to provide everything an application developer needs to incorporate on-chain bitcoin wallet functionality into their project. Wrapped around the BDK core libraries is our [bdk-ffi](https://github.com/bitcoindevkit/bdk-ffi) bindings libraries that let Kotlin (desktop/android), Swift (desktop/iOS), and Python developers use BDK seamlessly in their projects. And wrapped around all of this software is documentation and examples. For over a year the BDK team has been working on a major [re-architecture](https://bitcoindevkit.org/blog/tags/architecture/) of the BDK libraries to improve blockchain syncing, embedded device support ([no-std](https://docs.rust-embedded.org/book/intro/no-std.html)), update key dependencies ([rust-bitcoin](https://github.com/rust-bitcoin/rust-bitcoin), [rust-miniscript](https://github.com/rust-bitcoin/rust-miniscript)) and finally to provide a stable 1.0 API that our users can rely on for their production applications. 

The team is currently working on the 1.0.0-alpha release train. The purposed of these alpha releases is to give early adopters (including our own `bdk-ffi` contributors) a chance to try-out new BDK features and updated APIs and provide feedback. Once we have a stable, feature complete 1.0.0 BDK that our alpha users love we'll begin publishing 1.0.0-beta releases. With our beta releases we will finish updating tutorials and examples and performance testing, and ask all BDK users to start migrating and testing their applications with BDK 1.0.0. When our key contributors and users are satisfied that we have shaken out any final 1.0.0-beta issues we'll publish our BDK 1.0.0 release. Once 1.0.0 is out subsequent releases will use [semantic versioning](https://semver.org/). 

For those keeping score, we'd originally planned to have the BDK 1.0.0 release out last year, but (spoiler) that didn't happen. As I'm sure our kind readers understand making safe, feature rich, easy to use bitcoin software isn't easy, reviewing it is even harder, and we, like every project in the space are short-handed. But with every release, as we build the software we also on-board new contributors and build the team that will deliver BDK 1.0.0, 1.1.0, 2.0.0, and beyond.

### Core BDK

For Q4 2023 we [merged 33 PRs](https://github.com/bitcoindevkit/bdk/pulls?page=1&q=is%3Apr+merged%3A2023-10-01..2023-12-31), [closed 32 issues](https://github.com/bitcoindevkit/bdk/issues?q=is%3Aissue+closed%3A2023-10-01..2023-12-31), and completed two 1.0.0-alpha releases, [1.0.0-alpha.2](https://github.com/bitcoindevkit/bdk/releases/tag/v1.0.0-alpha.2) and [1.0.0-alpha.3](https://github.com/bitcoindevkit/bdk/releases/tag/v1.0.0-alpha.3). The primary deliverable of these releases was to further stabilize the `bdk_chain` crate which provides the central logic for tracking and updating wallet keychains and scripts to be tracked and manages all of the related blockchain and transaction data. Additional PRs started this quarter lay the groundwork for the next phase of development focused on improving how we sync data via blockchain clients and save that data to persistent storage. We also made one maintenance release [0.29.0](https://github.com/bitcoindevkit/bdk/releases/tag/v0.29.0) that upgraded our `rust-bitcoin` dependency to release to 0.30.

### BDK-FFI

In Q4 the BDK-FFI bindings for Kotlin, Swift, and Python saw [23 PRs merged](https://github.com/bitcoindevkit/bdk-ffi/pulls?page=1&q=is%3Apr+merged%3A2023-10-01..2023-12-31) and [15 issues closed](https://github.com/bitcoindevkit/bdk-ffi/issues?q=is%3Aissue+closed%3A2023-10-01..2023-12-31). One maintenance release was completed, [v0.31.0](https://github.com/bitcoindevkit/bdk-ffi/releases/tag/v0.31.0), which updated the language bindings dependency to the latest rust `bdk` maintenance release 0.29.0 and in doing so updated the BDK FFI `rust-bitcoin` dependency to version 0.30. This quarter the team took on the major task of creating the first language bindings based on the `bdk` 1.0.0-alpha API. The resulting `bdk-ffi` [v1.0.0-alpha2a](https://github.com/bitcoindevkit/bdk-ffi/releases/tag/v1.0.0-alpha.2a) release is only able to expose part of the full `bdk` 1.0.0 API but prepares the project for full support in future releases. As part of this work the current Kotlin API docs were removed, but fear not they will return in future alpha releases and be better than ever with not only API docs for Kotlin but also Swift and Python.

### BDK contributors spotlight

In this section we share what some of our hardworking contributors are doing to educate people about BDK, help on board new projects, and generally promote bitcoin and open source development around the world.

**[Daniela Brozzoni](https://github.com/danielabrozzoni/)**

November 3: Gave a [bolt.fun](https://bolt.fun) talk on open source development, [YouTube](https://www.youtube.com/watch?v=P75nCR1owws).

October 25-26: Joined a ["Contributing to free and open source projects" panel](https://planb.lugano.ch/contributing-to-free-and-open-source-projects/) at [Plan B](https://planb.lugano.ch/) lugano.

**[Evan Linjin](https://github.com/evanlinjin/)**

November 15: Worked with [wizardsardine](https://wizardsardine.com/) team to [extract and integrate BDK coin-selection into the Liana wallet](https://twitter.com/darosior/status/1724842410839093562).

December 3: Spoke at the [Bitcoin Tech Summit Taipei](https://twitter.com/TaiwanBitdevs/status/1726537941688967238).

December 13: Gave a talk about Bitcoin and BDK at [Taipei Blockchain Week](https://twitter.com/JCBA_org/status/1735100779172856170).

**[Thunderbiscuit](https://github.com/thunderbiscuit/)**

November 8: Created the educational [Opcode Explained](https://opcodeexplained.com/) website to help... explain bitcoin opcodes!

November 15: Joined the panel on the [Bitcoin Review Podcast Episode 55](https://bitcoin.review/podcast/episode-55/) to talked about his [padawan-wallet](https://github.com/thunderbiscuit/padawan-wallet) project.

**[Matthew Ramsden](https://github.com/reez/)**

October 11: Spoke at the [Bitcoin Park OpenHouse](https://www.meetup.com/bitcoinpark/events/291768716/) on the topic ["Exploring the Lightning Network"](https://podcasts.apple.com/us/podcast/open-house-exploring-the-lightning-network-ldk/id1646515985?i=1000631904227).

November 8: Created a video for the [Bitcoin Developers](https://www.youtube.com/@bitcoindevelopers) channel on YouTube titled ["Lightning Development with Swift: Make Your First Lightning App with LDK Node Swift"](https://www.youtube.com/watch?v=rcU3LU6iZCs).

**Other current and future contributors...**

If you are a contributor to BDK and doing something fun that's BDK and/or bitcoin related let us know! Tag [@bitcoindevkit](https://twitter.com/bitcoindevkit/) on X, [notmandatory](https://primal.net/profile/npub1ke470rdgnxg4gjs9cw3tv0dp690wl68f5xak5smflpsksedadd7qtf8jfm) on nostr, or send us an email: blog at bitcoindevkit dot org.