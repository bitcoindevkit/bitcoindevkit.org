---
title: "Descriptor-based paper wallets"
description: "Demonstrate how to create descriptor-based paper wallet and how to spend them with bdk"
author: "Riccardo Casatta and Steve Myers"
date: "2021-03-24"
tags: ["guide", "descriptor", "paper wallets"]
hidden: true
draft: false
---

In this post, we will use the [Rusty Paper Wallet] tool to create a multi-owned descriptor-based paper wallet. We will use [bdk] to assist us in the creation of the descriptor and to be able to spend the funds.

## About paper wallets

Paper wallets have a lot of drawbacks, as explained in the [paper wallet Wikipedia article], as always, do your own research before deciding to use it with mainnet bitcoins.

## Descriptors

[Previous version](https://github.com/RCasatta/rusty-paper-wallet/tree/339fa4418d94f6fdd96f3d0301cab8a0bc09e8bd) of the [Rusty Paper Wallet] was following the original paper wallet design: WIF[^WIF] as secret part with the option to generate a different kind of addresses (legacy, nested segwit, and segwit).

There were intentions to [support mnemonic](https://github.com/RCasatta/rusty-paper-wallet/issues/5) instead of WIF because it may[^WIF core] save the sweep transaction[^sweep] and there are more wallets capable of importing a mnemonic instead of a WIF.

However, choosing address kind or having wallet support for a specific format is the kind of problem descriptors are going to solve, so the latest [Rusty Paper Wallet] version is just accepting a descriptor and the network as parameters.

## Use case

So let's say your grandma wants to buy bitcoin and asked for your help.

You are a little afraid she may lose the private key. At the same time, you don't want to duplicate the keys and give those to her daughters Alice and Barbara, because both of them could spend and accuse the other to have done so.

There have never been litigations in the family but it is better to not leave the possibility open.

This is a perfect case for a 2 of 3 multi-signature paper wallet.

Note you are still the single point of trust because you are going to generate the keys for everyone.
Setups combining keys from the participants are possible future work.

## Creating the paper wallet

The spending descriptor would be:

`wsh(multi(2,Grandma,Alice,Barbara))`

You need [rust] installed to use [Rusty Paper Wallet]

```
$ cargo install rusty-paper-wallet
$ rusty-paper-wallet "wsh(multi(2,Grandma,Alice,Barbara))"
data:text/html;base64,PCFET0N...
```

The [output] of the command is very long and has been shortened. The string is a [data URI scheme] paste-able in the address bar of a browser. By using a data URI no files are written on the hard disk, leaving less trace of secret material on the computer.
It's also a good idea to use incognito mode in the browser to prevent it from saving the page in the history.

The following is the result:

<iframe src="/images/descriptor-based-paper-wallets/Bitcoin_Paper_Wallet.html" height="800" width="800" ></iframe>

Under the hood, the command created a key pair randomly for every alias present in the descriptor, then replaced the aliases with the created keys and generated the relative address. This address is the same for every paper wallet and it is shown in the upper part of the paper wallet (the public part) along with the alias, linking the paper wallet to the owner.

The lower part is the secret part, the written part is the descriptor with the aliases, followed by a legend linking the aliases with the keys. In the legend, all the keys are public but the one of the owner which is a private WIF. The secret QR code instead contains the descriptor already with the keys.

The paper wallet must then be printed, better to use a printer without wifi and also be aware that some sensitive data may remain in the printer cache.

Then the paper wallet must be cut along the dotted lines, the secret part should be folded twice over the black zone[^black zone]. The black zone helps to avoid showing the secret parts in presence of back-light. Once the folding is done the paper wallet should be plasticized to prevent being damaged by water.

## BDK

BDK could help in the following steps:

* Previous descriptor is kind of standard, because plain multi signature, how do I create more complex policy involving more level of spending conditions or timelocks?  //TODO cite spending_policy post, http://bitcoin.sipa.be/miniscript/ ?
* How do I spend the funds?

![Descriptor diagram](/images/descriptor-based-paper-wallets/descriptor-diagram.svg)

## Compile example

## Funding tx

//TODO

## Spending tx

//TODO

use bdk-cli sync, send-all


[paper wallet wikipedia article]: https://en.bitcoin.it/wiki/Paper_wallet
[Rusty Paper Wallet]: https://github.com/RCasatta/rusty-paper-wallet
[bdk]: https://github.com/bitcoindevkit/bdk
[rust]: https://www.rust-lang.org/tools/install
[output]: /images/descriptor-based-paper-wallets/data-url.txt
[data URI scheme]: https://en.wikipedia.org/wiki/Data_URI_scheme

[^WIF]: Wallet Input Format, a string encoding a ECDSA private key  https://en.bitcoin.it/wiki/Wallet_import_format
[^WIF core]: Unless the user import the WIF directly into bitcoin core
[^sweep]: Some wallets refers to sweep as the action to create a transaction taking all the funds from the paper wallet and sending those to the wallet itself.
[^black zone]: Ideally, the black zone should be twice as long as the secret part to cover it back and front, long descriptor may leave a shorter black zone, ensure to have you printer set with vertical layout for best results.
