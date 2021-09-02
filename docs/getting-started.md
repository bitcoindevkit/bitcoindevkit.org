# Bitcoin Dev Kit

The [Bitcoin Dev Kit (BDK)](https://github.com/bitcoindevkit) project (originally called Magical Bitcoin 🧙) aims to build a collection of tools and libraries that are designed to be a solid foundation for cross platform Bitcoin wallets, along with a fully working *reference implementation* wallet called Magical Bitcoin.
All BDK components are designed to be lightweight and modular so that they can be adapted for virtually any use-case: from single-sig mobile wallets to multi-billion-dollar cold storage vaults.

The main long-term goal is to concentrate the development efforts of multiple people and companies into one open source and very well reviewed project, instead of dispersing them over multiple closed/semi-closed or
poorly designed projects.

While some parts of the library are still considered "experimental" (check the docs for more info), the core `Wallet` architecture is now considered stable. We still can't commit to keeping this same exact API forever,
but we are not expecting to do any major breaking change in that area.

If you want to try out the library for your projects, now it's finally a good time to do it! You can start by checking out the ["getting started"](/blog/tags/getting-started/) section in our blog or joining our [Discord](https://discord.gg/dstn4dQ)
server to chat with us.

## Playground

As a way of demonstrating the flexibly of this project, a minimalistic command line tool (called `bdk-cli`) is available as a debugging tool in the [`bdk-cli`](https://github.com/bitcoindevkit/bdk-cli)
repo. It has been compiled to WebAssembly and can be used directly from the browser. See the [playground](/bdk-cli/playground) section to give it a try!

The playground relies on [Esplora](https://blockstream.info) to monitor the blockchain and is currently locked in testnet-only mode, for obvious safety reasons. The native command line tool can also be used in regtest mode when installed on
a computer. See the [bdk-cli](/bdk-cli) section to learn more.

## Descriptors

One of the original milestones of this project was to provide wallets with "almost magically" support for very complex spending policies, without having to individually translate them into code. It may sound disappointing, but there isn't, in fact,
any real magic in this wallet: the generalization is achieved thanks to *descriptors*, that are now slowly starting to see adoption in a few other Bitcoin projects as well.

The author of this project strongly believes descriptors will be a big part of the future generation of Bitcoin wallets, since they provide a very flexible scripting language that can also be extended as the
technology and tooling of Bitcoin evolves and changes (Schnorr signatures, Taproot, etc).

To learn more, check out the specific [Descriptors section](/descriptors).
