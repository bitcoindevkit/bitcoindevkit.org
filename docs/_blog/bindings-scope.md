---
title: "BDK's Scope and Approach to Rust Bindings"
description: "An outline of BDK's approach to language bindings and how we intend on supporting others build their own."
authors:
    - thunderbiscuit
date: "2023-06-02"
tags: ["BDK", "bindings"]
# permalink: ""
---

**tldr;** _we can't produce and maintain bindings for all Rust crates we get requests for, but we are working to help others build their own bindings by (1) making our architecture composable and reusable, and (2) building strong examples and documentation on how to do it for other crates._

<br/>

Over the past 2 years, the Bitcoin Development Kit team has been successful at building and releasing language bindings for our Rust library. In particular, over the past 18 months we have locked in and solidified our approach for the iOS, Android, Kotlin, Java, and Python bindings by using a Rust library called [Uniffi](https://github.com/mozilla/uniffi-rs).

Over the course of the year, we've had many requests to add to the bindings certain features that are not directly in the Rust BDK library. These request mainly break down into two groups:
1. Features that are part of crates "upstream" of BDK (rust-bitcoin, rust-miniscript)
2. Features that are not but that have Rust crates and would be useful on mobile (payjoin, coinjoin implementations, silent payments, BIP-47)

## Current architecture
The current architecture for the BDK bindings is more or less wrapping the bdk, rust-bitcoin, and rust-miniscript crates and exposing an API that allows users to leverage them similarly to how they would BDK in Rust if they were using it in a Rust project.

While we started with a simplified version of the Rust BDK API, over time users asked for more and more functionality, and exposing some of the underlying rust-bitcoin constructs became important. This makes sense, and indeed users of the bitcoin development kit in Rust have access to all the related APIs by simply importing rust-bitcoin and rust-miniscript, hence our desire to accommodate these use cases as well. However, this is currently done all in one "bindings" library (i.e. if you import `bdk-android` in a project, you'll have access to an API that is mostly bdk-based, but also contains a bit of rust-bitcoin and rust-miniscript).

## Moving forward: building a family of libraries
At the same time, other Rust-based libraries started using the uniffi approach (a good example is [ldk-node](https://github.com/lightningdevkit/ldk-node)) to expose bindings. When developing and using those libraries together, it quickly became clear that much of the work was duplicated; both libraries needed access to underlying rust-bitcoin types, but they both exposed their own versions of it.

Over the coming months, the team is looking at extracting the rust-bitcoin part of the BDK bindings library (bdk-ffi) and publishing that library on [crates.io](https://crates.io/) so as to make it available to others who wish to build Rust bindings using uniffi.

## Why can't we just build one big BDK library with _everything_ in it?
1. The short answer to this is that it would simply not be maintainable. If we rely on many underlying Rust crates, we'd need to release patches every time one of the underlying libraries patches a bug. We'd also need to keep them all in sync (what API versions work with what), and we'd be relying on work from teams that may or may not have  the capacity to keep their crates up to date.
2. Scope creep. Unless we define a narrow and structured scope for the library, we will forever be handling requests for features that may or may not be feasible to accommodate.
3. Library size. Because one of our primary focus for the bindings is mobile devices, we need to make sure we don't build a library that is too big. This is a more nuanced issue, but it relates to point (2), where too large a scope would eventually produce a library that is potentially not optimal for mobile devices because it attempts to do too much all in one package.

## Are you looking to build Rust bindings yourself?
We got your back! The Bitcoin Development Kit team intends to help others in the Rust bitcoin ecosystem build bindings if they wish to. To that effect, we maintain 3 repositories that should help you get going with bindings in no time: 
1. **[Uniffi library template](https://github.com/thunderbiscuit/uniffi-bindings-template)**. This is a repository you can fork and start adding code to produce bindings directly for iOS and Android. Included are our custom-made Gradle plugin and Swift release shell scripts, as well as information about the little build quirks you need to know about for smooth releases.
2. **[Uniffi examples](https://github.com/thunderbiscuit/uniffi-examples)**. This repository provides boiled-down examples of APIs exposed using uniffi, with an [accompanying documentation website](https://thunderbiscuit.github.io/uniffi-examples/). Functions, enums, objects, callbacks, multi-libraries, a lot of information and examples to get you started.
3. **[Sandbox library `bitcoin-frontier`](https://github.com/thunderbiscuit/bitcoin-frontier)**. This repository is meant as a sandbox to start developing and testing your own bindings. Simply fork it and start adding code! It comes with a fully working Android app you can leverage to test out whatever bindings you're building.
