---
title: "Home"
date: 2020-04-28T09:46:18+02:00
draft: false
---

# 🧙 Magical Bitcoin 🧙

The Magical Bitcoin project aims to build a collection of tools and libraries that are designed to be a solid foundation for Bitcoin wallets, along with a fully working *reference implementation* wallet.
All of its components are designed to be lightweight and modular so that they can be adapted for virtually any use-case: from the single-sig mobile wallet to the multi-billion-dollar cold storage vault.

The main long-term goal is to concentrate the development efforts of multiple people and companies into one open source and very well reviewed project, instead of dispersing them over multiple closed/semi-closed or
poorly designed projects.

{{% notice info %}}
Keep in mind that this project is still in a very early phase of development. The APIs and the general architecture shouldn't be considered stable yet. At the moment most of the code is concentrated in the
[main repo](https://github.com/MagicalBitcoin/magical-bitcoin-wallet) and is slowly being refactored and taken out into separate, independent modules.
{{% /notice %}}

## Trying out the CLI

While the project is mostly meant to be integrated into other larger project, there's a very minimalistic command line interface ("repl") written in the main
[`magical-bitcoin-wallet`](https://github.com/MagicalBitcoin/magical-bitcoin-wallet) repo. See the [REPL](/repl) section to try it out.

## Descriptors

The name of the project refers to the fact that when its components are built into a wallet, it can "almost magically" support very complex spending policies, without having to individually translate them into code. It may sound disappointing, but there isn't, in fact,
any real magic in this wallet: the generalization is achieved thanks to *descriptors*, that are now slowly starting to see adoption in a few other Bitcoin projects as well.

The author of this project strongly believes descriptors will be a big part of the future generation of Bitcoin wallets, since they provide a very flexible scripting language that can also be extended as the
technology and tooling on Bitcoin evolve and change (Schnorr signatures, Taproot, etc).

To learn more, check the specific [Descriptors section](/descriptors).
