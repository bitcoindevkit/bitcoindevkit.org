---
title: "`bdk-rn`: Making of the module"
description: "bdk-rn: React Native version of Bitcoin Devkit. Insight into how bdk-rn was made"
authors:
    - Bitcoin Zavior
date: "2022-07-10"
tags: ["BDK-RN","Development","Architecture"]
hidden: true
draft: false
---
The **Bitcoin Devkit**'s **React Native** version (`bdk-rn`) makes it easy to develop Bitcoin applications for both Android and IOS mobile platforms. Using `bdk-rn` knowledge of the underlying bitcoin and bdk api or rust is not required and using `bdk-rn` is similar to using any other RN module. Objective is to enable app developers to simply install using using `yarn add` and start using it in a React Native Project. The native code, rust lang implementation and confugurations any other details are all taken care of by bdk-rn.

This article is **NOT a guide on how to use bdk-rn** to build a Bitcoin Wallet or Application, rather this is an insight into how `bdk-rn` was developed. For help on how to use `bdk-rn` to develop a Bitcoin application please refer to the user guide in the readme on github. There will be `how to guides` published shortly on getting started with `bdk-rn`. This article will help answer queries from curious minds out there who have asked for this information in the past.

## React Native Architecture

At a high level, RN consists of the UI front end part fo the code which is JavaScript which interacts with the native IOS and Android platforms over a bridge. When communicating over the bridge values from JS are converted to native and vice versa.

The native part of a RN project consists of Android as well as IOS components. The Android and IOS parts are full fledged native projects which interact with the JS side. A RN project has all the build configuraiton required to build both Android and IOS projects.

For the purpose of making `bdk-rn`, `bdk-kotlin` is used as the native Android module and `bdk-swift` as IOS nativemodule. These are configured and wrapped in a RN Project such that they are part of the platform specific native modules within the RN Project. This is then built to be a reusable React Native module so that it can be added to RN projects.

![](./bdk_rn_making_of/BDK-RN-Architecture.png)

## Android Native Integration

We will go into the details of Android Native integration, similar steps are done for IOS as well.
In order to talk to native modules on Android and IOS, React Native provides a React Context API for both Java/Kotlin as well as Swift. These serve as the interface to the native bridge allowing communication from JS to native modules.

bdk-rn uses React Context API plus some native code to wrap and enhance bdk APIs. The native code calls and interacts wit the Android and IOS native modules whic in turn interface with the underlying mobile platform.

<img src="./bdk_rn_making_of/BDK-RN.png" style="display: block; margin: 0 auto; zoom: 20%" />

Starting off with a basic RN project. This project will be enhanced with bdk-kotlin and bdk-swift binaries and native code. For now lets go into the details for Android, IOS has similar steps to be done for the IOS project.

The Android native project is located under the root project folder.

<img src="./bdk_rn_making_of/android_folder.png" style="display: block; margin: 0 auto; zoom: 120%" />



We need to add a dependency in `build.gradle` for bdk-kotlin's android native package. This will enable the bdk-kotlin to be downloaded and available in the Android project.

```javascript
repositories {
    mavenCentral()
}

dependencies {
    //noinspection GradleDynamicVersion
    implementation 'com.facebook.react:react-native:+'

    // bitcoindevkit
    implementation 'org.bitcoindevkit:bdk-android:0.7.1'
}
```

We will create an Android native module for `bdk-rn`. Create a new Kotlin file named `bdk.kt` inside `android/app/src/main/java/com/bdkrn/` folder

This will be the native code file for bdk-rn module and here a new class will be created to encapsulate the interaction with the bitcoindevkit's kotlin native binary file.

Lets start with adding the nativ code, starting withimports:

```kotlin
import android.annotation.SuppressLint

import android.util.Log

import com.facebook.react.bridge.Arguments

import com.facebook.react.bridge.Promise as Result

```

Here we can create a class to invoke the bdk android binary so lets also add an import for `import org.bitcoindevkit.Wallet`

```kotlin
import org.bitcoindevkit.Wallet as BdkWallet
```

Once done lets write some code to generate Bitcoin Key information, which will be used to create a wallet.
 First we will need to create a ExtendedKeyInfo which will hold the mnemonic seed phrase as well as an extended private key.

```kotlin
val keys: ExtendedKeyInfo = generateExtendedKey(
        Network.TESTNET,
        WordCount.WORDS12,
        “”
)
```

And then use it to create a wallet descriptor and change descriptor:

```kotlin
val descriptor: String = wpkh(" + keys.xprv + "/84'/1'/0'/0/*)

val changeDescriptor: String = descriptor.replace("/84'/1'/0'/0/*","/84'/1'/0'/1/*")
```

To create a wallet with bdk we need to specify wallet descriptor, network, a database config, blockchaincofig. We intend to use bitcoin testnet and want to use default memory for data. For bitcoin node we will use a public electrum server. We will need to define these parameters to create a wallet.

```kotlin
val network = `Network.TESTNET`
val databaseConfig = DatabaseConfig.Memory
blockchainConfig =
      BlockchainConfig.Electrum(
          ElectrumConfig("ssl://electrum.blockstream.info:60002", null, 5u, null, 10u)
      )
```

Once done we can use these parameters to create a bdk wallet using the native android bdk library:

```kotlin
var wallet: BdkWallet = BdkWallet(
          descriptor,
          changeDescriptor,
          setNetwork(network),
          databaseConfig,
          config
)
```

Once we hae a wallet initialised, we we call methods on it like, `sync` 

```kotlin
wallet.sync(ProgressLog, maxAddress)
```

We can generate a new address

```kotlin
wallet.getNewAddress()
```

And we can fetch the balance

```kotlin
wallet.getBalance().toLong()
```

To pass a value from the native android code to React Native’s Javascript side over the JS <>Native bridge we will use `com.facebook.react.bridge.Promise`

At this point you we have an Android native module and invoked its native method from JavaScript in your React Native application. You can read on to learn more about things like argument types available to a native module method and how to setup callbacks and promises.



Native modules can also fulfill a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), which can simplify your JavaScript, especially when using ES2016's [async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) syntax. When the last parameter of a native module Java/Kotlin method is a Promise, its corresponding JS method will return a JS Promise object.

Refactoring the above code to use a promise instead of callbacks looks like this:



val balance: String = BdkFunctions.getBalance()

​      result.resolve(balance)

We can define a method like this:

```kotlin

// Other methods here
// to create wallet


fun getBalance(result: Result) {
  val balance: String = BdkFunctions.getBalance()
  result.resolve(balance)
}
```



## Feedback

The best way to give feedback on this would be to comment on the [pull request](https://github.com/bitcoindevkit/bitcoindevkit.org/pull/100) for this blog post.
Thanks in advance.

References: https://formidable.com/blog/2019/react-codegen-part-1/



[X window system]: https://en.wikipedia.org/wiki/X_Window_System
[The Art of UNIX Programming]: https://en.wikipedia.org/wiki/The_Art_of_Unix_Programming
[`Wallet`]: https://docs.rs/bdk/latest/bdk/wallet/struct.Wallet.html
[`CoinSelectionAlgorithm`]: https://docs.rs/bdk/latest/bdk/wallet/coin_selection/trait.CoinSelectionAlgorithm.html
[`Signer`]: https://docs.rs/bdk/latest/bdk/wallet/signer/trait.Signer.html
[`WalletSync`]: https://docs.rs/bdk/latest/bdk/blockchain/trait.walletsync.html
[Sensei]: https://l2.technology/sensei
[`Database`]: https://docs.rs/bdk/latest/bdk/database/trait.Database.html
