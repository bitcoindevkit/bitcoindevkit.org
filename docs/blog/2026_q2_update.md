# 2026 Q2 Update: What Have We Been Up To?

:lucide-pen-tool: &nbsp; [`thunderbiscuit`](https://github.com/thunderbiscuit)  
:lucide-calendar-1: &nbsp; `Aug 27, 2026`

---

Q2 2026 is the quarter the 3.0 line landed. `bdk_wallet` 3.0.0 shipped in April, 3.1.0 followed in June, and the 3.0 API made its way out to every language we support: Swift, Kotlin, Android, JVM, Python, React Native, and Dart. Along the way we welcomed two new corporate members to the BDK Foundation, added two new grantees to the team, and published the first release of a brand new library.

Here are some of the notable releases and changes over Q2 to the software libraries we maintain:

- **`bdk_wallet` 3.0.0 is out!** [The 3.0.0 release](https://github.com/bitcoindevkit/bdk_wallet/releases/tag/v3.0.0) brings persistent UTXO locking, structured wallet events, the adoption of `NetworkKind` throughout the codebase, support for importing and exporting the Caravan wallet format, and a migration utility for SQLite databases created before version 1.0.
- **Release 3.1.0 of `bdk_wallet`.** [This release](https://github.com/bitcoindevkit/bdk_wallet/releases/tag/v3.1.0) adds the `Wallet::sign_with_signers` method, which gives callers control over the signing process by accepting a custom list of signers, as well as a `LoadParams::two_path_descriptor` method for validating descriptors loaded from persistence. It also carries a long list of bug fixes, and we added a `SECURITY.md` document to the repository with instructions on how to report vulnerabilities. Eight developers made their first contribution to the library in this release!
- **Release 2.4.0 of `bdk_wallet`.** For teams not ready to jump to 3.0 yet, [the 2.4.0 release](https://github.com/bitcoindevkit/bdk_wallet/releases/tag/wallet-2.4.0) backports the pre-1.0 SQLite migration helper and the new event tracking methods to the 2.x line.
- **Release 3.0.0 of the language bindings.** [bdk-ffi 3.0.0](https://github.com/bitcoindevkit/bdk-ffi/releases/tag/v3.0.0) brings the 3.0 API to Swift, Kotlin, Android, JVM, and Python. Highlights include the new `NetworkKind` type, locked outpoints and their persistence, the wallet event helpers, a much more complete set of `Descriptor` constructors, transaction builder controls for sighash and transaction ordering, and optional timeout and retry parameters on the Electrum client.
- **`bdk-rn` 1.0.0.** Our [React Native library](https://github.com/bitcoindevkit/bdk-rn/releases/tag/v1.0.0) reached 1.0, built on the 3.0.0 API of bdk-ffi.
- **`bdk-dart` release candidates.** The [Dart/Flutter bindings](https://github.com/bitcoindevkit/bdk-dart) published their first two release candidates on the road to 1.0, tracking bdk-ffi 3.0.0, publishing to pub.dev, and adding Android 16 KB page-size alignment so the native library meets Google Play requirements. If you are building a Flutter bitcoin wallet, this is a great moment to try it out and send us feedback.
- **Release 0.2.0 of `bdk-tx`.** [This release](https://github.com/bitcoindevkit/bdk-tx/releases/tag/0.2.0) is a big one for our transaction building library: a reworked change output API through the new `ChangeScript` type, improved timelock and spendability handling, anti-fee-sniping support (BIP326), per-input sequence control, and better encapsulation of the selection result.
- **Release 0.25.0 of `rust-electrum-client`.** [The 0.25.0 release](https://github.com/bitcoindevkit/rust-electrum-client/releases/tag/0.25.0) implements Electrum protocol v1.6, adds dynamic authorization support, simplifies the cargo features, and relicenses the crate under MIT/Apache-2.0.
- **Releases 0.16.0 and 0.17.0 of `bdk-kyoto`.** Our compact block filters chain source was updated to track the latest releases of the [bip157](https://crates.io/crates/bip157) crate.
- **A new library: `bdk-message-signer`.** [Version 0.1.0](https://github.com/bitcoindevkit/bdk-message-signer) of a new library shipped this quarter, providing a script-generic signed message format for proving fund availability or committing to a message.
- **The Book of BDK is on 3.0.** All Rust, Swift, Kotlin, and Python examples have been updated to the 3.0.0 API, the Kyoto example now uses the 0.17.0 API, and we published [release notes](https://bookofbdk.com/release-guide/3.1/notes/) for the 2.4, 3.0, and 3.1 releases. The Python examples moved to the `uv` build tool and the Kotlin examples to the Amper toolchain.
- **Example wallets on 3.0.** Our sample Android app, the [Devkit Wallet](https://github.com/bitcoindevkit/devkit-wallet), followed the release candidates through May and now runs bdk-android 3.0.0, and the [BDK Swift Example Wallet](https://github.com/bitcoindevkit/BDKSwiftExampleWallet) was updated to bdk-ffi 3.0.0 as well.
- **A new website.** The website you're reading this on was rebuilt on [Zensical](https://zensical.org/) and deployed in April, with a new logo, icons, and favicon. We also published a PGP key for [security@bitcoindevkit.org](../foundation/pgp.md) so that vulnerabilities can be reported to us privately.

## New Foundation Members

Two new corporate members joined the BDK Foundation this quarter (see the [full announcement](2026_q2_new_bdkf_members.md)):

- **[Satoshi Pacioli Accounting](https://satoshipacioli.com)** — bridging traditional and bitcoin-specific accounting, with expert help for tax compliance and financial operations.
- **[mempool.space](https://mempool.space)** — the leading open-source bitcoin blockchain explorer and mempool visualizer.

Corporate members' yearly dues fund the small team of open source developers who maintain the core BDK libraries and the supporting FOSS projects around them. Thank you!

## Our Grantees in Action

Two new grantees joined the team this quarter, both funded by [Btrust](https://www.btrust.tech/):

- **[John Osezele](https://github.com/Johnosezele)** is a mobile engineer working on the Dart language bindings. He is a co-maintainer of [bdk-dart](https://github.com/bitcoindevkit/bdk-dart) and leads the development of the [BDK Dart Wallet](https://github.com/bitcoindevkit/bdk-dart/tree/main/bdk_demo), a demo app built in Flutter.
- **[Abiodun Awoyemi](https://github.com/aagbotemi)** works on wallet infrastructure and transaction building. He is a co-maintainer of [bdk-tx](https://github.com/bitcoindevkit/bdk-tx) and leads the development of [bdk-message-signer](https://github.com/bitcoindevkit/bdk-message-signer).

See our [grantees page](../foundation/grantees.md) for the full roster of developers funded through the Foundation.

## BDK in the Wild

Q2 saw new projects integrating BDK into their software and being added to our [adoption page](../adoption/all.md):

- [Grimm App](https://usegrimm.app/) — a self-custodial bitcoin wallet supporting on-chain and Lightning payments.
- [Cyberkrill](https://github.com/douglaz/cyberkrill) — a comprehensive CLI toolkit for Bitcoin and Lightning Network operations, written in Rust.
- [Tetrapolar](https://tetrapolar.com) — bitcoin-native settlement for global trade.
- [Ibis Wallet](https://github.com/aeonBTC/IbisWallet) — Self-custody modular Bitcoin wallet built for power users, with a focus on privacy and customizability.

We're always happy to see new projects choosing BDK as their wallet foundation. If your project is building with BDK and isn't listed yet, let us know!
