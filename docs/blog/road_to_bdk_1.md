# The Road to BDK 1.0

:lucide-pen-tool: &nbsp; [`Alekos Filini`]()  
:lucide-calendar-1: &nbsp; `Oct 3, 2022`
---

Over the past few months the work on [bdk\_core] quietly continued behind the scenes, and as the time went on it started expanding beyond the scope of just improving the *syncing* mechanism of BDK. Being a new fresh
project it allowed for iterating much faster, and we soon realized we could make large improvements to the general architecture of BDK to fix many of the issues and shortcomings found over time.

For this reason, we decided to move forward with the project and start planning the integration into BDK itself. This blog post will briefly describe the new concept for how BDK will be structured and lay down a plan
for the development in the next few months.

## Goals

First of all, we should outline at least the main goals of BDK 1.0, ergo what we want to improve over the current state of the project.

### Stable API

Ever since the `0.1.0` release of BDK we've always broken the API with each release. Most of the time in minor and very contained ways, but in *some* way nonetheless. One of the main sources of breakage have been
the `Blockchain` and `Database` traits. Those two together are used in essentially any operation a user may do on a `Wallet`, and are thus impacted by any relatively large change or new feature added to the code.

Want to [keep track of whether a UTXO is spent](https://github.com/bitcoindevkit/bdk/pull/515)? You need to change the `Database` that stores this information. Want to [know the timestamp of the latest block](https://github.com/bitcoindevkit/bdk/pull/669)?
You need to change the `Blockchain` trait to fetch that extra bit of information. And the list goes on and on.

Since making changes to these traits is always so painful for us and our downstream users, this ended up delaying or considerably slowing down the development of new features in BDK.

bdk\_core tries to minimize the (ab)use of traits, and this will help immensely when trying to provide a stable API for our users.

### Upstreaming our code

BDK internally implements many features that could be useful to other projects as well. While working on this integration we will also try to upstream some of our code to the relevant crates, mainly [`rust-miniscript`].

This has essentially three benefits:

1. A new set of eyes will take a look at the code, potentially spotting issues or suggesting improvements
2. This will lower the amount of code that we have to maintain ourselves
3. Other people can benefit from our code, which was previously tightly integrated into BDK and hard to re-use

### Partially Syncing a Wallet

This single point was the main reason the bdk\_core project was kickstarted, and it means giving our users the ability to incrementally sync a wallet over time instead of working in single big batches.

This is explained very well in the [first bdk\_core post], so I won't go into details here. Think of this as a much more flexible way to sync a wallet, which in turn will allow us to simplify our current implementation
of blockchain backends like compact block filters, and also offer a better API for our users.

### `no_std`

bdk\_core is built with `no_std` in mind since the beginning, something we've been wanting to support in BDK [for a long time](https://github.com/bitcoindevkit/bdk/issues/205). Being more modular means the "core" module doesn't really need that many dependencies,
and this really simplifies the `no_std` work.

This will allow the main components of BDK to work on embedded hardware as well, making it possible to use the library as a foundation for any Bitcoin hardware device like hardware wallets.

### Lower MSRV

Removing many of our current dependencies from the core components of BDK will also allow us to lower our MSRV considerably, which in turn will allow BDK to compile on older distros or entirely different toolchains like
[`mrustc`], which usually don't keep up with `rustc` in terms of language features.

## Architecture

Roughly speaking, after integrating bdk\_core into BDK the architecture will look like this:

- bdk\_core: this crate will contain all the low level components of a Bitcoin wallet. For example, using this low level API it will be possible to keep track of arbitrary scripts (without the limitations[^1]
  of descriptors) or apply individual blocks to the state of the wallet
- bdk\_compat: this crate will use the components provided by bdk\_core to implement a descriptor-based wallet that supports up to two *keychains*, like our current `Wallet` implementation does. It will allow our
  users to upgrade to BDK 1.0 with minimal changes to their code, but being a compatibility layer it will probably lack many of the advanced features that bdk\_core brings to the table
- bdk\_*\<blockchain\>*: the blockchain backends like Esplora, Electrum, RPC, will be moved into individual separate crates that users can decide to include individually

## Timeline

We can't provide a precise timeline because it's a big development effort and it also depends on some relatively large PRs making into upstream project. That said, here's our rough plan:

1. October: during this month we will work on opening a PR to integrate bdk\_core into BDK
2. November: review of the PR, work on upstreaming our code to `rust-miniscript`
3. December: finishing touches, examples, documentation

## Feature Freezing BDK

With our focus shifting to bdk\_core we are officially *feature freezing* BDK starting from release `0.23` (which will be published on October 6th). This means that we won't be adding any new features to BDK until the
integration is completed, because it takes a lot of effort to implement and/or review them, and there's the risk that most of the code will have to be re-done or thrown away anyway when moving to bdk\_core.

A notable exception to this rule will be the upcoming [upgrade to `rust-bitcoin` `0.29`](https://github.com/bitcoindevkit/bdk/pull/770), which is now planned for the release `0.24` since `rust-miniscript` `8.0.0` hasn't been released in time for `0.23`.

During this feature freeze period we will keep maintaining the library, updating our dependencies, fixing bugs and making releases accordingly.

## Conclusion

This is an exciting new development for BDK, a well needed refresh to an architecture that hasn't changed much over time, but that it's starting to show its age. This integration will open up so many new possibilities
for our downstream users, and it's a major step towards our goal of providing simple, yet powerful tools for Bitcoin developers :rocket:.


[^1]: Not every script can be expressed as descriptor

[bdk\_core]: https://github.com/LLFourn/bdk_core_staging
[first bdk\_core post]: /blog/bdk-core-pt1/
[`rust-miniscript`]: https://github.com/rust-bitcoin/rust-miniscript
[`mrustc`]: https://github.com/thepowersgang/mrustc
