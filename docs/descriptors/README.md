# Descriptors

Descriptors are a compact and semi-standard way to easily encode, or "describe", how scripts (and subsequently, addresses) of a wallet should be generated. They can be especially helpful when working with multisigs or even
more complex scripts, where the structure of the script itself is not trivial. They are a big step forward in making wallets more portable across different tools and apps, because for the first time they create a common
language to describe a full bitcoin script that developers can use and integrate in their software.

The ecosystem around descriptors is still very much in its early stage, but they are starting to see some adoption in [Bitcoin Core](https://github.com/bitcoin/bitcoin/blob/master/doc/descriptors.md) and other projects. BDK
aims to produce the first "Native Descriptor" Bitcoin library that can be used by developers to build their own ["Native Descriptor Wallets"](https://www.youtube.com/watch?v=xC25NzIjzog).

### Compatibility Matrix

Below are some tables to highlight the differences between Bitcoin Core's descriptor support, rust-miniscript's one and BDK's.

#### Key Types

| Key Type | BDK | rust-miniscript | Bitcoin Core |
| -------- | --------------- | --------------- | ------------ |
| Hex PublicKey | ✓ | ✓ | ✓ |
| WIF PrivateKey | ✓ | ✗ | ✓ |
| Extended Keys (xpub/xprv) | ✓ | ✗ | ✓ |

#### Script Types (top level)

| Script Type | BDK | rust-miniscript | Bitcoin Core |
| -------- | --------------- | --------------- | ------------ |
| `pk()` | ✓ | ✓ | ✓ |
| `pkh()` | ✓ | ✓ | ✓ |
| `wpkh()` | ✓ | ✓ | ✓ |
| `sh(wpkh())` | ✓ | ✓ | ✓ |
| `sh()` | ✓ | ✓ | ✓ |
| `wsh()` | ✓ | ✓ | ✓ |
| `sh(wsh())` | ✓ | ✓ | ✓ |
| `combo()` | ✗  | ✗  | ✓ |
| `addr()` | ✗  | ✗  | ✓ |
| `raw()` | ✗  | ✗  | ✓ |
| Bare scripts | ✓ | ✓ | ✗  |

#### Operators

| Operator | BDK | rust-miniscript | Bitcoin Core |
| -------- | --------------- | --------------- | ------------ |
| `pk()` | ✓ | ✓ | ✓ |
| `pk_h()` | ✓ | ✓ | ✓ - as `pkh()` |
| `older()` | ✓ | ✓ | ✗  |
| `after()` | ✓ | ✓ | ✗  |
| `sha256()` | ✓ | ✓ | ✗  |
| `hash256()` | ✓ | ✓ | ✗  |
| `ripemd160()` | ✓ | ✓ | ✗  |
| `hash160()` | ✓ | ✓ | ✗  |
| `andor()` | ✓ | ✓ | ✗  |
| `and_{v,b,n}()` | ✓ | ✓ | ✗  |
| `or_{b,c,d,i}()` | ✓ | ✓ | ✗  |
| `multi()` | ✓ | ✓ | ✓  |
| `thresh()` | ✓ | ✓ | ✗  |
| `sortedmulti()` | ✓  | ✓  | ✓  |

#### Modifiers

| Script Type | BDK | rust-miniscript | Bitcoin Core |
| -------- | --------------- | --------------- | ------------ |
| `a:` | ✓ | ✓ | ✗ |
| `s:` | ✓ | ✓ | ✗ |
| `c:` | ✓ | ✓ | ✗ |
| `t:` | ✓ | ✓ | ✗ |
| `d:` | ✓ | ✓ | ✗ |
| `v:` | ✓ | ✓ | ✗ |
| `j:` | ✓ | ✓ | ✗ |
| `n:` | ✓ | ✓ | ✗ |
| `l:` | ✓ | ✓ | ✗ |
| `u:` | ✓ | ✓ | ✗ |

For a more thorough description of these operators and modifiers see [Sipa's Miniscript Page](http://bitcoin.sipa.be/miniscript/) and [Bitcoin Core's](https://github.com/bitcoin/bitcoin/blob/master/doc/descriptors.md).

### Examples

Some examples of valid BDK descriptors are:

| Spending Policy | Descriptor | Address 0 | Address 1 |
| --------------- | ---------- | --------- | --------- |
| Static P2PKH    | `pkh(cSQPHDBwXGjVzWRqAHm6zfvQhaTuj1f2bFH58h55ghbjtFwvmeXR)` | mrkwtj5xpYQjHeJe5wsweNjVeTKkvR5fCr | mrkwtj5xpYQjHeJe5wsweNjVeTKkvR5fCr |
| Static P2PKH, watch-only | `pkh(02e96fe52ef0e22d2f131dd425ce1893073a3c6ad20e8cac36726393dfb4856a4c)` | mrkwtj5xpYQjHeJe5wsweNjVeTKkvR5fCr | mrkwtj5xpYQjHeJe5wsweNjVeTKkvR5fCr |
| P2WSH 2-of-2 with one private key | `wsh(multi(2,tprv8ZgxMBicQKsPePmENhT9N9yiSfTtDoC1f39P7nNmgEyCB6Nm4Qiv1muq4CykB9jtnQg2VitBrWh8PJU8LHzoGMHTrS2VKBSgAz7Ssjf9S3P/0/*,tpubDBYDcH8P2PedrEN3HxWYJJJMZEdgnrqMsjeKpPNzwe7jmGwk5M3HRdSf5vudAXwrJPfUsfvUPFooKWmz79Lh111U51RNotagXiGNeJe3i6t/1/*))` | tb1qqsat6c82fvdy73rfzye8f7nwxcz3xny7t56azl73g95mt3tmzvgs9a8vjs | tb1q7sgx6gscgtau57jduend6a8l445ahpk3dt3u5zu58rx5qm27lhkqgfdjdr |
| P2WSH-P2SH one key + 10 days timelock | `sh(wsh(and_v(vc:pk_h(tprv8ZgxMBicQKsPePmENhT9N9yiSfTtDoC1f39P7nNmgEyCB6Nm4Qiv1muq4CykB9jtnQg2VitBrWh8PJU8LHzoGMHTrS2VKBSgAz7Ssjf9S3P/0/*),older(1440))))` | 2Mtk2nyS98MCi2P7TkoBGLaJviBy956XxB1 | 2MuEStKzYhqb5HCFgHz9153tZsL5sVqV5xC |

### Implementation Details

BDK extends the capabilities of [rust-miniscript](https://github.com/apoelstra/rust-miniscript) by introducing the concept of an *ExtendedDescriptor*: it represents a descriptor that contains one or more "derivable keys" like `xpubs` or `xprvs`
and can be "derived" to a normal Descriptor by deriving every single one of its keys. It is currently called "StringDescriptor" in the code, because it's implemented as a wrapped `miniscript::Descriptor<String>`.

ExtendedDescriptors are derived using a single index instead of a full derivation path: this is because normally most of the path is fixed and can be represented right after the xpub/xprv itself, and only the
final index changes for each address. This is what's normally called a *DescriptorExtendedKey* in codebase, and it's the represented with a similar syntax to Bitcoin Core's, such as:

```
[d34db33f/44'/0'/0']xpub6ERApfZwUNrhL.......rBGRjaDMzQLcgJvLJuZZvRcEL/0/*
```
