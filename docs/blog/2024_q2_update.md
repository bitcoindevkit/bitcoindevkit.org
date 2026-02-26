# 2024 Q2 Update: What Have We Been Up To?

:lucide-pen-tool: &nbsp; [`thunderbiscuit`]()  
:lucide-calendar-1: &nbsp; `Jul 1, 2024`
---

The bitcoindevkit team has been hard at work for Q2 in 2024, pushing to stabilize the API of its `bdk_wallet` crate and releasing 4 new alpha versions (9, 10, 11, and 12!), and aiming to release a 1.0 beta in July. Here are some of the notable changes and upgrades to the software libraries we maintain:
- **Update `bdk_electrum` to use merkle proofs.** This PR is the first step in reworking `bdk_electrum` to use merkle proofs. When we fetch a transaction, we now also obtain the merkle proof and block header for verification. We then confirm a transaction is in a block only after validating it's Merkle proof.
- **Upgrade of rust-bitcoin and rust-miniscript.** We upgraded our dependencies on these crates to the latest `0.32.0` and `0.12.0` respectively.
- **Added examples.** We added examples and cleaned up our current example crates to help builders stay up-to-date on the latest changes.
- **Use bitcoin::Amount in most public APIs.** This change ensures type safety when requiring and providing bitcoin amount in our APIs, using the rust-bitcoin crate `Amount` type.
- **Introduce Sync and FullScan related types.** This change introduced universal structures that represent sync/full-scan requests/results for all SPK-based syncing clients.
- **Allow user provided RNG.** This change makes the `rand` dependency optional.

The language bindings for iOS, Android, and Python have also seen some new alpha release and a ton of new features, in preparation for the beta release.
- **Upgrade to the latest uniffi (0.28.0).** This was a major upgrade that gave us a whole new set of functionalities: the ability to implement traits in the foreign languages, using the `Display` trait to auto-generate the `toString()` methods, enable API docs in the UDL file, and support for async!
- **Brand new iOS build workflow.** This one is nerdy but a goodie. Anyone interested in how we build bindings should check out this major cleanup of our iOS library build workflow!
- **Starting the work on bitcoin-ffi.** The team has started the work on a separate crate called [bitcoin-ffi](https://github.com/bitcoindevkit/bdk-ffi), effectively migrating the types we exposed from rust-bitcoin into a standalone crate that other projects building on uniffi can use.


### Our Grantees in Action
In addition to our full-time grantees, the [BDK Foundation](https://bitcoindevkit.org/foundation/) provides part-time grants to folks on special projects. Q2 is funding 2 projects in particular:
- **Wei Chen.** Wei has been contributing to BDK since late 2023 and was formerly a full stack Java developer based in Washington D.C. with ten years of experience. The focus of his contributions will be towards assisting with the restructuring of the electrum crate, reengineering of the TxGraph data components to simplify the tracking of lineal conflicts, as well as on performance optimization and the continued debugging of BDK.
- **Manuel Gatti.** Manuel is a Project Manager at Wizard Sardine. He is involved in some educational projects related to bitcoin in Italy and hosts an Italian podcast about libertarian philosophy with episodes dedicated to bitcoin as a tool for freedom. He has been contributing to BDK since April 2023 mostly on the project management side (holding calls, helping with triage and prioritization, updating stakeholders). His project consists of conducting user interviews in order to get feedback on BDK usage and possible pain points with the aim to help the team with the definition and prioritization of the development activities.

We've also been active at conferences!
- Evan made his way to South Korea to host a workshop at the [Bitcoin Seoul](https://www.bitcoinseoul.kr/) conference.
- Evan and ValuedMammal also made their way to the [bitcoin++ conference in Buenos Aires](https://btcplusplus.dev/conf/ba24) to talk about BDK.
- thunderbiscuit was in Montreal for the [Canadian Bitcoin Conference](https://canadianbitcoinconf.com) again this year. A fantastic event with many users of BDK present!

### BDK in the Wild
- In Q2, [Bitkey](https://bitkey.world/en-US) open sourced their app, making it one of the biggest users of BDK on mobile.
- [Bull Bitcoin](https://www.bullbitcoin.com/) released their [Android app](https://play.google.com/store/apps/details?id=com.bullbitcoin.mobile) based on the bdk-flutter library at the Canadian Bitcoin Conference in Montreal!
