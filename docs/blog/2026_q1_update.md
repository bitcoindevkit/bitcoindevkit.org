# 2026 Q1 Update: What Have We Been Up To?

:lucide-pen-tool: &nbsp; [`thunderbiscuit`](https://github.com/thunderbiscuit)  
:lucide-calendar-1: &nbsp; `Apr 20, 2026`

---

Q1 2026 was headlined by the release candidate cycle for `bdk_wallet` 3.0.0, a major milestone the team has been building toward for over a year. Alongside that, we welcomed two new associate members to the BDK Foundation, saw continued momentum in mobile library development, and formalized maintainership and support tiers across every library in the GitHub org.

Here are some of the notable releases and changes over Q1 to the software libraries we maintain:

- **Release candidates for `bdk_wallet` 3.0.0.** Two release candidates ([3.0.0-rc1](https://github.com/bitcoindevkit/bdk/releases/tag/v3.0.0-rc1) and [3.0.0-rc2](https://github.com/bitcoindevkit/bdk/releases/tag/v3.0.0-rc2)) were published this quarter, bringing the team close to a stable 3.0 release. We encouraged library integrators to begin testing against the release candidates and provide feedback.
- **New migration utilities for older BDK wallets.** We've updated and simplified the workflow required to migrate older (0.X) BDK wallets into their 2.X and 3.X counterparts! See our docs on this in migration section of the [Book of BDK](https://bookofbdk.com/getting-started/migrating/).
- **Release 0.23.3 of `bdk_chain`.** This patch release addresses issues identified by downstream users and improves internal consistency ahead of the 3.0 release.
- **Releases 2.3.0 and 2.3.1 of `bdk-ffi`.** The language bindings libraries—covering Swift, Android, JVM, and Python—received two releases this quarter, continuing to track improvements in the underlying Rust libraries. Work is underway to release the 3.0 version in the next quarter!
- **`bdk-dart` and `bdk-rn` ready for testing.** Both the [Dart/Flutter](https://github.com/bitcoindevkit/bdk-dart) and [React Native](https://github.com/bitcoindevkit/bdk-rn) libraries have reached a stage where they are ready for integration testing in users' applications. If you are building a mobile bitcoin wallet, now is a great time to try them out and share your feedback with the team.
- **Maintainership and library tiers finalized across the org.** All libraries under the [bitcoindevkit GitHub organization](https://github.com/bitcoindevkit) now have formally defined support tiers, as well as designated primary and secondary maintainers. This makes it easier for contributors and integrators to understand the maturity and ownership of each project at a glance.
- **Devkit Wallet revamped.** The [Devkit Wallet](https://github.com/bitcoindevkit/devkit-wallet) received a significant update this quarter with a fully revamped UI and a new default chain source: compact block filters via [Kyoto](https://crates.io/crates/bip157). This makes it a great reference app for developers looking to see BDK and compact block filters working together in a real Android wallet.
- **Release 0.22.2 of `bdk_esplora`.** This patch release brings fixes and improvements to the Esplora chain source client, used by wallets that rely on an Esplora backend for chain data.
- **Release of bdk-cli 3.0.0.** We released version 3.0 of our sample command line wallet! Tons of new features, including configuration files that make it easier to work with the wallet, and support for Payjoin!

## New Associate Members

We're pleased to welcome two new associate members to the BDK Foundation this quarter:

- **[Bitshala](https://bitshala.org/)** — a Bitcoin-focused education initiative helping developers in the Global South learn to build on Bitcoin.
- **[Satoshi Pacioli](https://satoshi-pacioli.com/)** — bringing double-entry Bitcoin accounting tools to the ecosystem.

Their support helps sustain the development of open-source Bitcoin infrastructure for everyone.

## BDK in the Wild

Q1 brought a new wallet integration to our [adoption page](https://bitcoindevkit.org/adoption/):

- [Arké](https://arkewallet.com/)

We're always happy to see new projects choosing BDK as their wallet foundation. If your project is building with BDK and isn't listed yet, let us know!
