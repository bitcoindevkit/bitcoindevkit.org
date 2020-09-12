---
title: "Home"
date: 2020-04-28T09:46:18+02:00
draft: false
---

# Bitcoin Dev Kit

The [Bitcoin Dev Kit (BDK)](https://github.com/bitcoindevkit) project (originally called Magical Bitcoin 🧙) aims to build a collection of tools and libraries that are designed to be a solid foundation for cross platform Bitcoin wallets, along with a fully working *reference implementation* wallet called Magical Bitcoin.
All BDK components are designed to be lightweight and modular so that they can be adapted for virtually any use-case: from single-sig mobile wallets to multi-billion-dollar cold storage vaults.

The main long-term goal is to concentrate the development efforts of multiple people and companies into one open source and very well reviewed project, instead of dispersing them over multiple closed/semi-closed or
poorly designed projects.

{{% notice info %}}
Keep in mind that this project is still in a very early phase of development. The APIs and the general architecture shouldn't be considered stable yet. At the moment most of the code is concentrated in the
[main repo](https://github.com/bitcoindevkit/bdk) and is slowly being refactored and taken out into separate, independent modules. 
{{% /notice %}}

## Playground

As a way of demonstrating the flexibly of this project, a minimalistic command line tool (also called "repl") is available as a debugging tool in the main [`bdk`](https://github.com/bitcoindevkit/bdk)
repo. It has been compiled to WebAssembly and can be used directly from the browser. See the [playground](/repl/playground) section to give it a try!

The playground relies on [Esplora](https://blockstream.info) to monitor the blockchain and is currently locked in testnet-only mode, for obvious safety reasons. The native command line tool can also be used in regtest mode when installed on
a computer. See the [REPL](/repl) section to learn more.

## Descriptors

One of the original milestones of this project was to provide wallets with "almost magically" support for very complex spending policies, without having to individually translate them into code. It may sound disappointing, but there isn't, in fact,
any real magic in this wallet: the generalization is achieved thanks to *descriptors*, that are now slowly starting to see adoption in a few other Bitcoin projects as well.

The author of this project strongly believes descriptors will be a big part of the future generation of Bitcoin wallets, since they provide a very flexible scripting language that can also be extended as the
technology and tooling of Bitcoin evolves and changes (Schnorr signatures, Taproot, etc).

To learn more, check out the specific [Descriptors section](/descriptors).
