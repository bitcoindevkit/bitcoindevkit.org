---
title: "Why Do We Build Bindings?"
description: "A post exploring why the Bitcoin Dev Kit Foundation produces language bindings for its libraries"
authors:
    - thunderbiscuit
date: "2024-05-07"
tags: ["bindings"]
---

This article explores the reasons why the Bitcoin Dev Kit Foundation supports a number of language bindings libraries as part of its core offering, and the challenges and decision tradeoffs we face along the way.

We build language bindings for a number of use cases. One of the most common of those rests on a belief that as time goes on, applications of all kinds will need to interact with the bitcoin protocol. Many of those will be applications that are not "bitcoin-first" like wallets, but rather other kinds of applications that simply wish to integrate payments for their users (games, chat applications, content creation, etc.). These applications already have well-developed codebases and teams, seldom built entirely in Rust (BDK's first and core language). Our goal is to offer these teams and applications an all-inclusive dependency they can add to whatever technology stack they are using in production, and allow the integration of bitcoin-related capabilities without the need to completely change their tech stack or require the hire of full-time bitcoin experts.

Why not simply use libraries that are available in the specific languages? We think the bitcoin development kit is special (of course we do!) for a few reasons:
1. The level of review and number of in-production applications in bitcoin that use the Rust bitcoin ecosystem of libraries is unparalleled (rust-bitcoin, rust-miniscript, and bdk).
2. For the reason above, it is most often the case that new features and BIPs are available in Rust first (taproot, miniscript, etc.) and take years to appear on other tech stacks.

## Awesome! Producing Bindings Must Be Easy Right?

Along the way, _actually_ producing language bindings for a variety of languages is no easy feat. Here are some of the challenges we face:
1. We create bindings for many languages in one fell swoop with a Rust tool called [uniffi](https://github.com/mozilla/uniffi-rs). The result is that for the work of 1 language, we actually get a few: Swift, Kotlin (works for JVM server-side and on Android), Java, Python. The Kotlin and Swift languages can in turn be combined to create React Native and Flutter libraries.
2. The goal of the bindings is not to provide all the complexity available in the Rust libraries (this would simply be out-of-scope for us). We basically need to strike a balance and generate a unified API that contains and combines 8 Rust libraries: rust-bitcoin, rust-miniscript, bdk_wallet, bdk_chain, bdk_file_store, and the electrum-client, esplora-client, and rpc-client libraries). This is required because it is impractical to produce bindings libraries for all of the above individually. The final bindings libraries are centered around the bdk_wallet API, and supporting its most common use cases for mobile clients.
3. Point 2 above has interesting implications: while developers using Rust can simply import any number of those libraries in their projects, we must expose as much (and as little) as is required.
4. A few caveats give us interesting puzzles we need to juggle with as we design and develop the language bindings libraries:
	- We cannot expose Rust generics using uniffi. This means that in practice, we need to remove all generics from the Rust API (either by not exposing the underlying construct or by exposing all—or the most important—of its variants as concrete structs). In this process, some of the complexity and beauty of the Rust language and Rust-based codebases is "erased".
	- Because the Rust code must be exposed in a variety of languages, some of the most Rust-specific constructs cannot be expressed in the bindings libraries. Things like functions that return tuples and tuple structs do not have Kotlin/Swift/Python equivalents, and must therefore be wrapped in some way, changing the shape of the Rust API slightly.

*Note:* The [bdk-rn](https://github.com/LtbLightning/bdk-rn) and [bdk-flutter](https://github.com/LtbLightning/bdk-flutter) are closely related projects. The React Native library uses the bdk-swift and bdk-android libraries and simply wraps them in a way that allows React Native users to leverage them, while the bdk-flutter library is build using a separate tool called [rust-flutter-bridge](), and is not a direct descendant of the uniffi-based libraries, although it follows a similar API.
