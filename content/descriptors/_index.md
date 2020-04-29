---
title: "Descriptors"
date: 2020-04-28T14:40:12+02:00
draft: false
weight: 5
pre: '<i class="fas fa-code"></i> '
---

Magical Bitcoin extends the capabilities of [rust-miniscript](https://github.com/apoelstra/rust-miniscript) by introducing the concept of an *ExtendedDescriptor*: it represents a descriptor that contains one or more "derivable keys" like `xpubs` or `xprvs`
and can be "derived" to a normal Descriptor by deriving every single one of its keys. It is currently called "StringDescriptor" in the code, because it's implemented as a wrapped `miniscript::Descriptor<String>`.

ExtendedDescriptors are derived using a single index instead of a full derivation path: this is because normally most of the path is fixed and can be represented right after the xpub/xprv itself, and only the
final index changes for each address. This is what's normally called a *DescriptorExtendedKey* in codebase, and it's the represented with a similar syntax to Bitcoin Core's, such as:

```
[d34db33f/44'/0'/0']xpub6ERApfZwUNrhL.......rBGRjaDMzQLcgJvLJuZZvRcEL/0/*
```

For more details regarding this syntax, see [this document](https://github.com/bitcoin/bitcoin/blob/master/doc/descriptors.md). On top of this, ExtendedDescriptors also support other formats for public and private keys,
like WIF and raw hexadecimal representation.

Speaking of syntax, the general descriptor operators syntax is a bit different from what Core uses: the `multi()`/`sortedmulti()` are not available, and they are replaced by `thresh_m()`. Also the `combo()` operator is not
available, and doesn't currently have any replacement. For more informations, see [this page](http://bitcoin.sipa.be/miniscript).

Some examples of valid descriptors are:

<div id="descriptor-examples-table">

| Spending Policy | Descriptor | Address 0 | Address 1 |
| --------------- | ---------- | --------- | --------- |
| Static P2PKH    | `pkh(cSQPHDBwXGjVzWRqAHm6zfvQhaTuj1f2bFH58h55ghbjtFwvmeXR)` | mrkwtj5xpYQjHeJe5wsweNjVeTKkvR5fCr | mrkwtj5xpYQjHeJe5wsweNjVeTKkvR5fCr |
| Static P2PKH, watch-only | `pkh(02e96fe52ef0e22d2f131dd425ce1893073a3c6ad20e8cac36726393dfb4856a4c)` | mrkwtj5xpYQjHeJe5wsweNjVeTKkvR5fCr | mrkwtj5xpYQjHeJe5wsweNjVeTKkvR5fCr |
| P2WSH 2-of-2 with one private key | `wsh(thresh_m(2,tprv8ZgxMBicQKsPePmENhT9N9yiSfTtDoC1f39P7nNmgEyCB6Nm4Qiv1muq4CykB9jtnQg2VitBrWh8PJU8LHzoGMHTrS2VKBSgAz7Ssjf9S3P/0/*,tpubDBYDcH8P2PedrEN3HxWYJJJMZEdgnrqMsjeKpPNzwe7jmGwk5M3HRdSf5vudAXwrJPfUsfvUPFooKWmz79Lh111U51RNotagXiGNeJe3i6t/1/*))` | tb1qqsat6c82fvdy73rfzye8f7nwxcz3xny7t56azl73g95mt3tmzvgs9a8vjs | tb1q7sgx6gscgtau57jduend6a8l445ahpk3dt3u5zu58rx5qm27lhkqgfdjdr |
| P2WSH-P2SH one key + 10 days timelock | `sh(wsh(and_v(vc:pk_h(tprv8ZgxMBicQKsPePmENhT9N9yiSfTtDoC1f39P7nNmgEyCB6Nm4Qiv1muq4CykB9jtnQg2VitBrWh8PJU8LHzoGMHTrS2VKBSgAz7Ssjf9S3P/0/*),older(1440))))` | 2Mtk2nyS98MCi2P7TkoBGLaJviBy956XxB1 | 2MuEStKzYhqb5HCFgHz9153tZsL5sVqV5xC |

</div>
