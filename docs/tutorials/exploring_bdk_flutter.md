---
title: "BDK-FLUTTER: Building Flutter Apps with BDK"
description: "A tutorial and how to guide for using bdk-flutter for building bitcoin apps with Flutter"
authors:
    - Bitcoin Zavior
date: "2022-10-05"
tags: ["bitcoin", "React Native", "Flutter", "iOS", "Android", "mobile", "bdk-flutter", "bdk", "tutorial", "guide", "wallet"]
---

## Introduction

`bdk-flutter` is the **Bitcoin Dev kit**'s **Flutter** library which enables building bitcoin applications for Android and iOS mobile platforms. Using `bdk-flutter` does not require knowledge of the underlying bitcoin or BDK API. Using `bdk-flutter` is similar to using any other Flutter module. Just do `flutter pub add bdk_flutter` and you are ready to code!  This is the first tutorial on how to use `bdk-flutter`, more coming soon, make sure to [follow](https://twitter.com/BitcoinZavior) to be notified of new ones. There will also be a **bdk-flutter** focused Livestream on [Twitch](https://www.twitch.tv/bitcoindevelopers) and on the Bitcoin Developers [YouTube Channel](https://www.youtube.com/channel/UCUq_ZdezVWKPvkWRicAYxLA/videos) so make sure to subscribe.

In this tutorial, we will explore `bdk-flutter` usage and the APIs it provides. This guide will walk through the development process and code for making a bitcoin application. The bitcoin application we create will be a non-custodial HD Wallet. The application will have the functionality to create a new wallet or restore from a known mnemonic seed phrase. This application will also be able to interact with the bitcoin network to sync UTXOs from new blocks and broadcast transactions.

The tutorial will focus on bitcoin concepts and `bdk-flutter` API. So it will gloss over Flutter and Dart. If you are interested in learning more about Flutter and Dart please refer to the Flutter [learning portal](https://flutter.dev/learn). The code for this tutorial is available on the [LtbLightning GitHub](https://github.com/LtbLightning/bdk-flutter-quickstart)

<img src="./exploring_bdk_flutter/bdk_flutter_complete_app.png" style="display: block; margin: 0 auto; zoom: 50%;" />

### Prerequisites

In order to use `bdk-flutter` in a  Flutter App, a  Flutter development environment is required. Please refer to resources out there on the internet if you need to set this up, here is one of many good resources to guide you on [environment setup](https://docs.flutter.dev/get-started/install)

### Bitcoin Basics

The bitcoin concepts used in this blog post are detailed and explained very well in external bitcoin resources. Here are some links for reference:

[Mastering Bitcoin(HD Wallet chapter)](https://github.com/bitcoinbook/bitcoinbook/blob/develop/ch04.asciidoc)

[Bitcoin Output Descriptors from bitcoin GitHub](https://github.com/bitcoin/bitcoin/blob/master/doc/descriptors.md)

Now let's jump into Bitcoin Dev Kit

## Bitcoin Dev Kit and bdk-flutter

**bdk-flutter** is **Bitcoin Dev kit**'s **Flutter** library for building  **Flutter** Apps.
It encapsulates all of the low-level APIs and methods for BDK and exposes them in a  Flutter context. To use BDK in Flutter apps only the `bdk-flutter` module is required. `bdk-flutter` can be used like any other Flutter library and is available on [pub.dev](https://pub.dev/packages/bdk_flutter)

## Getting Started

Although we won't delve deep into Flutter we will focus more on bitcoin and `bdk-flutter`, however, some rudimentary Flutter setup is required, especially a basic Flutter app to add our code.

 start by creating a new Flutter project.

`flutter create bdk-flutter-quickstart`

Once done let's `cd` into the new project directory and run the basic Flutter app that's created

```shell
cd bdk-flutter-quickstart
flutter run
```

This should start building the app and then launch the app in a simulator. So far we have created a basic Flutter project if this doesn't work then refer to the  Flutter development setup guide to troubleshoot.

 <img src="./exploring_bdk_flutter/default_flutter_app.png"  alt="BDK Flutter Quick Start" style="display: block; margin: 0 auto; zoom: 25%;" /> 



## Setting up Flutter app structure

Let's set up a very basic app structure. Let's create an `assets` folder in the project root and then add new folders  `widgets`, `screens` and `styles` inside the existing `lib` folder.

Paste the following code in your `pubspec.yaml` file, assets section.

    - assets/

Once done let's run a `get` command from the pub tool commands, this will get all required dependencies for our project.

```shell
flutter pub get
```

To make this quick you can download the styles and images used in the tutorial from the repository. The image assets and `theme.dart` can be taken from [here](https://github.com/LtbLightning/bdk-flutter-quickstart/tree/main/lib) and moved to the folders as shown. Alternatively, you can write your own theme and use your own images if you intend to style the app in a different way.

Under `screens` create a `home.dart` file, this will be where most of the code of the code will be added. 

Once done the file structure should look like this:

<img src="./exploring_bdk_flutter/folder_structure.png" style="display: block; margin: 0px auto; zoom: 67%;" />

<br/>Locate `main.dart` in the project root, this will have the default code added by `flutter create`, let's delete all contents of `main.dart`  and replace it with the following code to use `home.dart` as our main screen. This will probably crash the app but that's fine, it will be up and running once we add code to `home.dart` in the next few steps

```dart
// main.dart 

import 'package:bdk_flutter_quickstart/screens/home.dart';
import 'package:bdk_flutter_quickstart/styles/theme.dart';
import 'package:flutter/material.dart';

void main() {
 runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  // This widget is the root of your application.
    @override
    Widget build(BuildContext context) {
      return MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'BDK-FLUTTER TUTORIAL',
        theme: theme(),
        home: const Home(),
      );
    }
}
```

## Installing `bdk-flutter`

With the Flutter project in place, we can now add `bdk-flutter` using `flutter pub add`.

```shell
flutter pub add bdk_flutter
```

This will add a line like this to your package's `pubspec.yaml` and this will also run an implicit flutter pub get to download `bdk-flutter` from `pub.dev`:

```shell
dependencies:
  bdk_flutter: ^0.1.4
```

## Configuring

Make sure your app meets the following requirements for using `bdk-flutter`

**Android**

MinSdkVersion : API 23 or higher.

**IOS**

Deployment target : iOS 12.0 or greater.

Locate your Podfile in the ios folder of your project and paste the follwing code at the beginning

```
platform :ios, '12.0'
```

After changing the deployment target in your project's `PodFile`, let's use the following `command` to install pod dependencies for iOS.

```shell
cd ios && pod install && cd ..
```

Once done `bdk-flutter` is installed and configured, it is ready to be used in our **bdk-flutter-quickstart** App.


## Importing `bdk-flutter`

Locate `home.dart` which we added in the setup section and import `bdk-flutter` at the top of the file. Create a widget called `Home`

```dart
// screens/home.dart

import 'package:bdk_flutter/bdk_flutter.dart';

 class Home extends StatefulWidget {
  const Home({Key? key}) : super(key: key);

  @override
  State<Home> createState() => _HomeState();
}

class _HomeState extends State<Home> {
  TextEditingController mnemonic = TextEditingController();
  @override
  Widget build(BuildContext context) {
    return  Container();
  }
}
```


Before we start using `bdk-flutter` let's add some additional imports and also import styles, to create a basic layout to build our home screen

```dart
// screens/home.dart

import 'package:bdk_flutter/bdk_flutter.dart';
import 'package:bdk_flutter_quickstart/widgets/widgets.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class Home extends StatefulWidget {
  const Home({Key? key}) : super(key: key);

  @override
  State<Home> createState() => _HomeState();
}

class _HomeState extends State<Home> {
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        resizeToAvoidBottomInset: true,
        backgroundColor: Colors.white,
        /* AppBar */
        appBar: AppBar(
          centerTitle: true,
          elevation: 0,
          backgroundColor: Colors.white,
          leadingWidth: 80,
          leading: const Icon(
            CupertinoIcons.bitcoin_circle_fill,
            color: Colors.orange,
            size: 40,
          ),
          actions: [
            Padding(
              padding: const EdgeInsets.only(right: 20, bottom: 10, top: 10),
              child: Image.asset("assets/bdk_logo.png"),
            )
          ],
          title: Text("Bdk-Flutter Tutorial",
              style: Theme.of(context).textTheme.headline1),
        ),
        body:  SingleChildScrollView(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 30),
            child: Column(
              children: const [
                /* Balance */

                /* Create Wallet */

                /* Send Transaction */
              ],
            ),
          ),
        ));
  }
}
```

We now have a app title section and a structure to hold the rest of our app components.



<img src="./exploring_bdk_flutter/bdk_flutter_title.png" style="display: block; margin: 0 auto; zoom: 33%;" />



## Calling bdk-flutter methods

To call methods from `bdk-flutter` package, first we need to create a BdkFlutter Object.

```dart
import 'package:bdk_flutter/bdk_flutter.dart';

final bdkFlutter = BdkFlutter();
```

The first step in creating a non-custodial bitcoin app is creating a mnemonic seed phrase for the wallet.

`bdk-flutter` provides `generateMnemonic()` method to create a default 12 word length mnemonic. 

```dart
final res  = await generateMnemonic();
```

We can specify a longer length or we can also specify the bits of entropy we need by passing the length or entropy arguments.

To create a mnemonic with an entropy of 256 bits, which will be a 24 word length mnemonic sentence, we can use `(entropy: Entropy.ENTROPY256)`
Refer to the readme file on [GitHub](https://github.com/LtbLightning/bdk-flutter#generateMnemonic) for more details.

```dart
final res = await generateMnemonic(entropy: Entropy.ENTROPY256);
// here response is saved as 'mnemonic' string
```

In order to use this in our Flutter app, we want a button which will generate a mnemonic when clicked, a text input box to show the generated mnemonic. Let's first create a `TextEditingController` for the `menmonic` textfield to store the mnemonic, and a internal `generateMnemonic`  method which can be called on button click. We will also need a button which will call the internal `generateMnemonic` method when clicked. Adding the following code achieves all of this.

```dart
class Home extends StatefulWidget {
  const Home({Key? key}) : super(key: key);

  @override
  State<Home> createState() => _HomeState();
 }

class _HomeState extends State<Home> {
  BdkFlutter bdkFlutter = BdkFlutter();
  TextEditingController mnemonic = TextEditingController();

  generateMnemonicHandler() async {
    var res = await generateMnemonic(entropy: Entropy.ENTROPY256);
    setState(() {
      mnemonic.text = res;
    });
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        resizeToAvoidBottomInset: true,
        backgroundColor: Colors.white,
        /* Header */
        appBar: AppBar(
          centerTitle: true,
          elevation: 0,
          backgroundColor: Colors.white,
          leadingWidth: 80,
          leading: const Icon(
            CupertinoIcons.bitcoin_circle_fill,
            color: Colors.orange,
            size: 40,
          ),
          title: Text("Bdk-Flutter Demo",
              style: Theme.of(context).textTheme.headline1),
        ),
        body:  SingleChildScrollView(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 30),
            child: Column(
              children: const [
                 /* Balance */

                   /* Result */


                  /* Create Wallet */
                 StyledContainer(
                    child: Column(
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                         SubmitButton(
                              text: "Generate Mnemonic",
                              callback: () async {
                                await  generateMnemonicHandler();
                              }
                          ),
                          TextFieldContainer(
                            child: TextFormField(
                                controller: mnemonic,
                                style: Theme.of(context).textTheme.bodyText1,
                                decoration: InputDecoration(
                                  border: InputBorder.none,
                                  contentPadding: const EdgeInsets.all(8),
                                  hintText: "Enter your mnemonic here",
                                  hintStyle: TextStyle(
                                      color: Colors.black.withOpacity(.4),
                                      fontWeight: FontWeight.w500,
                                      fontSize: 10),
                                ),
                                keyboardType: TextInputType.multiline,
                                maxLines: 4),
                          ),                
                        ]
                      )
                   ),
                /* Send Transaction Butoons */

              ],
            ),
          ),
        ));
  }
}      
```

Now we need to add a component to display the output of our method calls and this will also need a `displayText` variable to track our method call response. To achieve this add the following code.

```dart
// screens/home.dart

// add this as another state variable under mnemonic
String? displayText;

// modify the generateMnenomic method to also set mnemonic as displayText

  generateMnemonicHandler() async {
    var res = await generateMnemonic(entropy: Entropy.ENTROPY256);
    setState(() {
      mnemonic.text = res;
      displayText = res;
    });
  }
```

and finally let's add the component to display the output under ` /* Result */`

```dart
// screens/home.dart

  /* Result */
	// display the component only if displayText has a value
   ResponseContainer(text:displayText ?? "No Response"),
```

We should now have a working "Generate Mnemonic" button which displays the new mnemonic

<img src="./exploring_bdk_flutter/bdk_flutter_tutorial_screen_mnemonic.png" style="display: block; margin: 0 auto; zoom:50%;" />

A quick recap, we added a button to call the method and a function to call from the `bdk-flutter`. Set the `displayText` variable to display the output of the call in the display section. We will follow this pattern for the remaining calls to `bdk-flutter`.

## Creating a wallet

Before moving on to creating a wallet, let's add a section at the top to display the balance of the wallet.

To display the balance we will need a variable to store the wallet's address, balance and a display section to display it.

Under the `mnemonic` and `displayText` variables, let's add one for `balance` and `address` as well

```dart
class _HomeState extends State<Home> {

  BdkFlutter bdkFlutter = BdkFlutter();
  TextEditingController mnemonic = TextEditingController();
  String? displayText;
  String? balance;
  String? address;
```


Just below `/* Balance */`  and above `/* Result */` add the following UI components to display the balance. We only want to show the balance when it has a value so we will use a null-aware operator `??` for a quick `null` check and use `0` in case of `null` value.

```dart
				 /* Balance */
				StyledContainer(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text("Balance: ", style: Theme.of(context).textTheme.headline2),
                        Text(" ${balance ?? "0"} Sats",
                            style: Theme.of(context).textTheme.bodyText1),
                      ],
                    )
                  ),
				/* Result */
```

We will next add code to create a wallet.

To create a wallet the simple approach is to call `createWallet()` method with `mnemonic` , `password` and `network`.
Let's add an internal method which will be called when wallet needs to be created. We want to see the output of this call so let's use `setState()` to set the `displayText` variable

```dart
createOrRestoreWallet(String mnemonic, Network network, String? password) async {
    try {
      final res = await bdkFlutter.createWallet(
          mnemonic: mnemonic,
          network: network,
          password: password
      );
      setState(() {
          address = res.address;
          balance = res.balance.total.toString();
          displayText = "Wallet Created: ${address ?? "Error"}";
      });
    } on Exception catch (e) {
      print(e.toString());
    }
  }
```

A new button will be required to call `createOrRestoreWallet()` 

Let's add a new button just below `TextFieldContainer()` 

```dart
SubmitButton(
            text: "Create Wallet",
            callback: () async {
              final res =  await createOrRestoreWallet(mnemonic.text, Network.TESTNET, "password");            
              setState(() {
                displayText = "Wallet Created: ${wallet?.address ?? "Error"}";
                wallet = res;
              });
          },
        ),
```

The response returned by `createWallet` is a `ResponseWallet` object containing the wallet's `balance` and `address`.


The App should now be creating a wallet when we click **Create Mnemonic** followed by **Create Wallet**.


<img src="./exploring_bdk_flutter/bdk_flutter_tutorial_screen_createwallet.png" style="display: block; margin: 0 auto; zoom:50%;" />


The wallet created is a HD wallet and the address displayed is the 0 index address for the wallet. The path used by default is 84'/1'/0'/0/* for addresses and 84'/1'/0'/1/* for change.

As we specified `testnet` and did not specify `blockchainConfig` a default electrum server will be used as the bitcoin node, `ssl://electrum.blockstream.info` is the default bitcoin node url used for testnet.

Using `mnemonic` is a quick way to create a new wallet with `bdk-flutter`. The `createWallet()` method in `bdk-flutter` has many optional arguments to configure the wallet. In addition to mnemonic, a wallet can also be created with a descriptor. If a descriptor is passed as an argument the wallet will be created using the descriptor. When using a descriptor, arguments for network, password and mnemonic are not required. `bdk-flutter` has a `createDescriptor()` method to create a descriptor. More about output descriptors [here](https://github.com/bitcoin/bitcoin/blob/master/doc/descriptors.md). Refer to the [readme](https://github.com/LtbLightning/bdk-flutter#createdescriptor) for all options available when creating output descriptors with `bdk-flutter`

```dart
// using a descriptor to create wallet 
const res = await bdkFlutter.createWallet(
  descriptor:"wpkh([d91e6add/84'/1'/0'/0]tprv8gnnA5Zcbjai6d1mWvQatrK8c9eHfUAKSgJLoHfiryJb6gNBnQeAT7UuKKFmaBJUrc7pzyszqujrwxijJbDPBPi5edtPsm3jZ3pnNUzHbpm/*)"
);
```

Other arguments for `createWallet()` are:

**blockChainConfig**: BlockchainConfig is enum that has 2 values, `BlockchainConfig.electrum` [`electrum`](https://github.com/romanz/electrs) and `BlockchainConfig.esplora` [`esplora`](https://github.com/Blockstream/esplora), `bdk-flutter` at the moment doesn't support compact-filters `compact-filters` ([BIP157](https://github.com/bitcoin/bips/blob/master/bip-0157.mediawiki)) and Bitcoin Core, this will be added shortly in a future release.

  Both `BlockchainConfig.electrum` & `BlockchainConfig.esplora` has `ElectrumConfig` object and `EsploraConfig` object, respectively as its parameter. 

  **ElectrumConfig**: This is the object type of `BlockchainConfig.electrum`'s config that takes timeout, retry & url as its required parameter.

  **EsploraConfig**: This is the object type of `BlockchainConfig.esplora`'s config that takes baseUrl & stopGap as its required parameter.

Refer to readme for a complete list of options for [createWallet()](https://github.com/LtbLightning/bdk-flutter#createwallet)

## UTXOs and balance

With the wallet created, we can now add methods to sync UTXOs and compute balance. 

`bdk-flutter` has a `syncWallet` method to sync all UTXOs belonging to the wallet with the bitcoin network, the specified bitcoin node specified in `BlockchainConfig` is used to sync. Once the wallet sync is complete balance is computed and `getBalance` can fetch the balance. 

Earlier we have aleady added variable for `balance`. Now we will add buttons to call `syncWallet` and `getBalance`. Just below the Create Wallet button let's add two buttons as follows:

```dart
    SubmitButton( text: "Sync Wallet",
                  callback: () async { await syncWallet(); },
                ),

    SubmitButton( callback: () async { await getBalance(); },
                  text: "Get Balance",
                ),                         
```

And internal functions below `createOrRestoreWallet` function:

```dart
  getBalance() async {
    final res = await bdkFlutter.getBalance();
    setState(() {
      balance = res.total.toString();
      displayText = res.total.toString();
    });
  }

 syncWallet() async{
   bdkFlutter.syncWallet();
 }

```

We should now be able to create a wallet, sync UTXOs and get balance

<img src="./exploring_bdk_flutter/bdk_flutter_get_balance.png" style="display: block; margin: 0 auto; zoom:50%;" />

We can use a public testnet faucet to send testnet coins to the wallet and check that the UTXO sync and balance fetch is working correctly. Before we do that add one more method to generate a new address we can then use this address to get testnet coins from a faucet.

Let's use the `address` variable  that was created before for this, we need to add a button for **Get Address** and a internal function to call `bdk-flutter` and create a new address. Let's do the following

Add a new `getNewAddress` function below the `syncWallet()`  function:

```dart
  getNewAddress() async{
    final res = await bdkFlutter.getNewAddress();
    setState(() {
      displayText = res;
      address = res;
    });
  }
```

And a **Get Address** button below the existing **Get Balance** button:

```dart
  SubmitButton(
    callback: () async { await getNewAddress(); },
    text: "Get Address" 
  ),
```

We should now have the following, and **Get Address** will be able to display a new address.

<img src="./exploring_bdk_flutter/bdk_flutter_get_address.png" style="display: block; margin: 0px auto; zoom: 50%;" />


Now that we are able to generate a receive address we can get some testnet bitcoin from one of the public [testnet faucets](https://coinfaucet.eu/en/btc-testnet/)

After we send and after the transaction is confirmed we will need to sync the wallet before we can see the new balance from the received transaction.

## Restoring wallet

The `createWallet` method creates a wallet using a `mnemonic`, in order to restore we can use the same method, we won't need to call `generateMnemonic` as we will already have a `mnemonic` to restore with.

This text field below the `Generate Mnemonic` button  will also display the mnemonic variable,  if we click Generate Mnemonic button. The generated mnemonic will show up in the text field. We can overwrite it with our own mnemonic and doing so will also overwrite the mnemonic state variable. This way the mnemonic displayed will be the one used to create the wallet.

we are already using the mnemonic variable in the `createWallet` Method so no other changes are required.

We can now use our own mnemonic and use it to restore a wallet. This will come in handy if we have a  wallet with testnet bitcoin as these are hard to come by.

<img src="./exploring_bdk_flutter/bdk_flutter_get_restore.png" style="display: block; margin: 0px auto; zoom: 50%;" />



## Sending bitcoin

We are now able to receive bitcoin, time add functionality to send as well.

`bdk-flutter` has a number of transaction-related methods to enable varied use cases. A new send transaction can be created and broadcast using [quickSend()](https://github.com/LtbLightning/bdk-flutter#quicksend). If required an unsigned transaction can be created using [createTx()](https://github.com/LtbLightning/bdk-flutter#createTx) , this can be signed later with [signTx()](https://github.com/LtbLightning/bdk-flutter#signtx) method and broadcast using [broadcastTx()](https://github.com/LtbLightning/bdk-flutter#broadcasttx). There are also methods to query transactions by pending or confirmed status and all transactions. Please refer to bdk-flutter [readme](https://github.com/LtbLightning/bdk-flutter#getTransactions) for more details on all the methods.

We will need textfield controllers for recipient address, amount, and for transaction, these can be added below our existing variable for `mnemonic`

```dart
  TextEditingController recipientAddress = TextEditingController();
  TextEditingController amount = TextEditingController();
```

A internal function to call  [`quickSend()`](https://github.com/LtbLightning/bdk-flutter#quicksend) on `bdk-flutter`  which to sends the specified amount in sats to an address.

```dart
	sendTx() async{
    final txid = await BdkFlutter().quickSend(
        recipient: recipientAddress.text.toString(),
        amount: int.parse(amount.text),
        feeRate: 1);
    setState(() {
      displayText = txid;
    });
  }
```

Add a new section for send transaction functionality. We will need a `form`, a `TextFormField` for receiver address and a `TextFormField` for amount to send. We will also need a button to call the `sendTx` function.

Before submitting the form we need to make sure all the input fields are valid, for that purpose, we need to initalize a  [`GlobalKey`](https://api.flutter.dev/flutter/widgets/GlobalKey-class.html). This can be added above our `Scaffold`

```dart
final _formKey = GlobalKey<FormState>();
```

Let's add the send transaction section and UI components below `/* Send Transaction */`

```dart
   StyledContainer(
                    child: Form(
                      key: _formKey,
                      child: Column(
                          mainAxisAlignment: MainAxisAlignment.start,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            TextFieldContainer(
                              child: TextFormField(
                                controller: recipientAddress,
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return 'Please enter your address';
                                  }
                                  return null;
                                },
                                style: Theme.of(context).textTheme.bodyText1,
                                decoration: InputDecoration(
                                  border: InputBorder.none,
                                  contentPadding:
                                  const EdgeInsets.symmetric(horizontal: 10),
                                  hintText: "Enter Address",
                                  hintStyle: TextStyle(
                                      color: Colors.black.withOpacity(.4),
                                      fontWeight: FontWeight.w500,
                                      fontSize: 10),
                                ),
                              ),
                            ),
                            TextFieldContainer(
                              child: TextFormField(
                                controller: amount,
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return 'Please enter the amount';
                                  }
                                  return null;
                                },
                                keyboardType: TextInputType.number,
                                style: Theme.of(context).textTheme.bodyText1,
                                decoration: InputDecoration(
                                  border: InputBorder.none,
                                  contentPadding:
                                  const EdgeInsets.symmetric(horizontal: 10),
                                  hintText: "Enter Amount",
                                  hintStyle: TextStyle(
                                      color: Colors.black.withOpacity(.4),
                                      fontWeight: FontWeight.w500,
                                      fontSize: 10),
                                ),
                              ),
                            ),
                            SubmitButton(
                              text: "Send Bit",
                              callback: () async {
                                if (_formKey.currentState!.validate()) {
                                  await sendTx();
                                }
                              },
                            )
                          ]),
                    ))
```


We should now be able to send a transaction as long as there is sufficient balance. 

<img src="./exploring_bdk_flutter/bdk_flutter_send.png" style="display: block; margin: 0px auto; zoom: 50%;" />



## Conclusion

The App we created can be built and distributed for both iOS and Android thus sharing a code base and reducing development time. The development and coding focused on application-level code for use cases and we did not have to code intricate internal bitcoin protocol-level code or bitcoin node interactions, and transactions. UTXOs and sync-related functionalities were also not required. All this was managed by `bdk-flutter` allowing us to focus on the product, functionality and user journey. This is how `bdk` and `bdk-flutter` intend to make Rapid Bitcoin Application Development possible by allowing product and application developers to focus on what they know best while `bdk` handles bitcoin complexity.

`bdk-flutter` intends to expose functionality and APIs from `bdk` which has a wide variety of APIs with granular details allowing for many interesting use cases to be implemented. `bdk-flutter` and `bdk` are constantly updated and enhanced based on feedback from product teams and developers in the bitcoin community.

Stay tuned for more APIs and enhancements coming to `bdk-flutter` in the near future. Feature and API requests are most welcome. New blogs and tutorials will be published soon for a more in-depth exploration of `bdk-flutter`. 

In the meantime keep in touch with the project by following on  [GitHub](https://github.com/LtbLightning/bdk-flutter) and [Twitter](https://twitter.com/BitcoinZavior)


#### References:

- [bdk](https://github.com/bitcoindevkit)
- [bdk-flutter](https://github.com/LtbLightning/bdk-flutter)
- [bdk-flutter-quickstart GitHub Repository](https://github.com/LtbLightning/bdk-flutter-quickstart)
- [Setup  Flutter Development Environment](https://docs.flutter.dev/get-started/install)
- [Mastering Bitcoin(HD Wallet chapter)](https://github.com/bitcoinbook/bitcoinbook/blob/develop/ch04.asciidoc)
- [Bitcoin Output Descriptors from bitcoin GitHub](https://github.com/bitcoin/bitcoin/blob/master/doc/descriptors.md)
- Testnet Faucet: [https://coinfaucet.eu/en/btc-testnet/](https://coinfaucet.eu/en/btc-testnet/) or [https://bitcoinfaucet.uo1.net](https://bitcoinfaucet.uo1.net)
