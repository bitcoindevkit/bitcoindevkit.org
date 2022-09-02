---
title: "Command Line introduction to Bitcoin Wallet Development using bdk-cli"
description: "Intro to bdk-cli and wallet dev"
authors:
    - waterst0ne
date: "2022-09-22"
tags: ["bdk-cli", "basics", "novice"]
---
## Tutorial Goals
- The goal for this tutorial is to introduce you to [bdk-cli](https://github.com/bitcoindevkit/bdk-cli), a powerful command-line program. You will be exposed to many of the basic skills that go into creating and managing bitcoin wallets. 
- If you've read most of the ["Mastering Bitcoin"](https://github.com/bitcoinbook/bitcoinbook) book, this tutorial could serve as a stepping stone into your Bitcoin wallet development journey.

- This short tutorial will expose you to the [`bdk library` ](https://docs.rs/bdk/latest/bdk/) and the practical knowledge needed for bitcoin wallet development. As a consequence you will deepen your technical understanding about bitcoin and the bdk library.

- BDK also has [language-bindings](https://github.com/bitcoindevkit/bdk-ffi) for **Kotlin/Java, Swift, Python** which enable the use of BDK's **Rust** library as an API. You can later use these similar steps to create your own bitcoin mobile, desktop or even WebApp by using the bdk-ffi language bindings. 

***

## A few things before you begin:

- Three things to look out for in each step of the tutorial:
    - 1) :arrow_forward: / :large_orange_diamond: - Commands for the Terminal or Shell
    - 2) :+1: - Preview of the command output. Note, not all commands will output code. 
    - 3) Preview Video of the tutorial for reference of what things should look like in action. 

***    
### Outline of Tutorial and Installation notes:
    
### Brief Outline of Tutorial
-  Step 1: Creating a mnemonic word list + XPRV (Extended Private Key)
-  Step 2: Generate testnet Receive Address
-  Step 3: Send funds to newly generated address
-  Step 4: Sync Wallet
-  Step 5: Check Balance of Wallet
-  Step 6: Create a Transaction (PSBT)
-  Step 7: Sign the Transaction (PSBT)
-  Step 8: Broadcast Transaction

***
### Rust and Cargo installation:
-   [Rust and Cargo Installation](https://rustup.rs/) 

***
### `bdk-cli` installation:
-  Download the [`bdk-cli` github repository locally](https://github.com/bitcoindevkit/bdk-cli.git)
    -  Enter the folder `cd bdk-cli`
    -  Install `cargo install --path . --features electrum,repl,compiler `
    -  Once installation is done exit and reopen your terminal (command-line interface)

### Emoji Legend:

:arrow_forward: : Unix/Linux Commands to copied and pasted
:large_orange_diamond: : Windows Powershell Commands to copied and pasted
:+1: : Output/ preview of code

***
## Step 0: Check Version of bdk-cli
:arrow_forward: / :large_orange_diamond:  `bdk-cli -V`
:+1: The output below confirms the command was successful.
```
bdk-cli 0.6.0
```

![](https://i.imgur.com/IcuyeMS.gif)


### Preview of bdk-cli help menu
:arrow_forward: / :large_orange_diamond:  `bdk-cli --help`  
:+1: The output below confirms the command was successful.

```shell
The BDK Command Line Wallet App

bdk-cli is a light weight command line bitcoin wallet, powered by BDK. This app can be used as a playground as well as
testing environment to simulate various wallet testing situations. If you are planning to use BDK in your wallet, bdk-
cli is also a great intro tool to get familiar with the BDK API.

But this is not just any toy. bdk-cli is also a fully functioning bitcoin wallet with taproot support!

For more information checkout <https://bitcoindevkit.org/>

USAGE:
    bdk-cli [OPTIONS] <SUBCOMMAND>

FLAGS:
    -h, --help       Prints help information
    -V, --version    Prints version information

OPTIONS:
    -d, --datadir <DATADIR>    Sets the wallet data directory. Default value : "~/.bdk-bitcoin
    -n, --network <NETWORK>    Sets the network [default: testnet]  [possible values: bitcoin, testnet, signet, regtest]

SUBCOMMANDS:
    compile    Compile a miniscript policy to an output descriptor
    help       Prints this message or the help of the given subcommand(s)
    key        Subcommands for Key operations
    repl       Options to configure a SOCKS5 proxy for a blockchain client connection
    wallet     Wallet subcommands that can be issued without a blockchain backend
```
 ---
 
## Step 1: Seed Generate

### 1a: Mnemonic word-list + XPRV (Exteneded Private Key) :key: 

Linux/Terminal:
:arrow_forward:   `bdk-cli key generate | tee key.json`

Windows Powershell:
:large_orange_diamond: `bdk-cli key generate | Out-File -FilePath "key.json"`
    
```shell
{
  "fingerprint": "42b15d2f",
  "mnemonic": "party salon worth satoshi envelope suggest garlic dry add pitch throw clap keen narrow antique oyster ketchup purchase gasp visual work venue fog crater",
  "xprv": "tprv8ZgxMBicQKsPdwpamtjqMFpYRTafnE1bN2SphLEybCtRKakk6S1TgQCsZgiBwJuJNWe3jYdgVCTsKf9weMxj6tW4zNNKWptykszJpS2L8wE"
}
```

![](https://i.imgur.com/ii62Hul.gif)

***
### 1b: Save XPRV (Extended Private Key) into environment variable
Linux/Terminal:
:arrow_forward:   `export XPRV_00=$(cat key.json | jq -r .xprv)`

Windows Powershell:

:large_orange_diamond: `$json = Get-Content -Path .\key.json | ConvertFrom-Json`

:large_orange_diamond: `$mykeyValue = $json.xprv`

:large_orange_diamond: `[System.Environment]::SetEnvironmentVariable('XPRV',$mykeyValue, 'Process')`

![](https://i.imgur.com/KYW2Cdo.gif)

***
### 1c: Verify environment variable XPRV_00 is active
Linux/Terminal:
:arrow_forward:   `env | grep XPRV`

Windows Powershell: 
:large_orange_diamond: `$env:XPRV`

![](https://i.imgur.com/ZahbJwe.gif)

***
### 1d: Create Descriptor and Save into environment variable

Linux/Terminal:
:arrow_forward:   `export my_descriptor="wpkh($XPRV_00/84h/1h/0h/0/*)"`

Windows Powershell:
:large_orange_diamond: `[System.Environment]::SetEnvironmentVariable('my_descriptor', "wpkh($env:XPRV/84h/1h/0h/0/*)", 'Process')`



![](https://i.imgur.com/UV4Vgsq.gif)

***
### 1e: Verify environment variable my_descriptor is active

Linux/Terminal:
:arrow_forward: `env | grep my_descriptor`

Windows Powershell:
:large_orange_diamond: `$env:my_descriptor `

![](https://i.imgur.com/s7ZeRQN.gif)



***
## Step 2: Generate Receive-Address
Linux/Terminal:

:arrow_forward:  `bdk-cli wallet --wallet wallet_name --descriptor $my_descriptor get_new_address` 

Windows Powershell:
:large_orange_diamond:`bdk-cli wallet --descriptor $env:my_descriptor get_new_address`



![](https://i.imgur.com/P8PjTAo.gif)



:+1: The output below confirms the command was successful.

```shell
{
  "address": "tb1qrh4sq5va0unqtxyfv8al9lz3sna3988cj59uya"
}
```

***
## Step 3: Send testnet bitcoin to the newly created receive-address 
Use a faucet to send funds to your newly created address. Here is a link to one: [Bitcoin Testnet Faucet](https://bitcoinfaucet.uo1.net)

***
## Step 4: Sync the wallet
Linux/Terminal:
:arrow_forward: ```bdk-cli wallet --wallet wallet_name  --descriptor $my_descriptor sync```

Windows Powershell:
:large_orange_diamond: ``` bdk-cli wallet --descriptor $env:my_descriptor sync```


:+1: The output below confirms the command was successful.

```shell
{}
```

![](https://i.imgur.com/WFYBgVB.gif)

***
## Step 5: Check the balance

Linux/Terminal: 
:arrow_forward: `bdk-cli wallet --wallet wallet_name  --descriptor $my_descriptor get_balance `

Windows Powershell:
:large_orange_diamond:
`bdk-cli wallet --descriptor $env:my_descriptor get_balance`

:::tip
Note: The balance will only show after the transaction has been confirmed in a block at least once.
:::

:+1: The output below confirms the command was successful:
```shell
{
  "satoshi": {
    "confirmed": 100000,
    "immature": 0,
    "trusted_pending": 0,
    "untrusted_pending": 0
  }
}
```

![](https://i.imgur.com/v8MAYB2.gif)

***
## Step 6: Create Transaction (PSBT)

To create a PSBT (partially-signed-bitcoin-transaction) run  the command:

Linux/Terminal:
:arrow_forward: `bdk-cli wallet --wallet wallet_name --descriptor $my_descriptor create_tx --to tb1qw2c3lxufxqe2x9s4rdzh65tpf4d7fssjgh8nv6:50000`


Windows Powershell:
:large_orange_diamond:
` bdk-cli wallet --descriptor $env:my_descriptor create_tx --to tb1qjk6n943uwhqhdf7en600tnwxpslvwtr0udsehp:0 --send_all`
![](https://i.imgur.com/EUCovcJ.gif)

:+1: The output below confirms the command was successful.

```shell
{
  "details": {
    "confirmation_time": null,
    "fee": 113,
    "received": 0,
    "sent": 123000,
    "transaction": null,
    "txid": "029173d76253e3441f9dc26f91e6ef30dff486848e91a7941f0cacd0af25ee30"
  },
  "psbt": "cHNidP8BAFUBAAAAAak8uMR3UGkAGUKWsq8Mv45qg2fdD93JQRIsa2P0wFloAQAAAAD/////AQfgAQAAAAAAGXapFDRKD0jKFQ7CuQOBdmC5tosTpnAmiKwAAAAAAAEA3gIAAAAAAQFY9sVfEEbyjrHXSlxXDxL+71WOMnsPpVElwk+3E/J9vAAAAAAA/v///wIYZRIAAAAAABYAFBKYf7yF+ss6EFdw2rDZTfdLhep8eOABAAAAAAAWABQd6wBRnX8mBZiJYfvy/FGE+xKc+AJHMEQCIFSIkvEUI9yUgEw4JocRs1aiVsBlKKXrOQaQb3XFqR21AiBqiEVzCVVSRGjckyPDgAQBnOdSzBYR6Rw6KFcCP+E27wEhAwIlXdfM2WYnYa36Hp4MS6YkplBAgBsb1tYG9NiWFWTKzPYhAAEBH3jgAQAAAAAAFgAUHesAUZ1/JgWYiWH78vxRhPsSnPgiBgP80FpaWYQzGzCnNI9blXbei61YpAmtoezMRxpVvBJ6SxgTizKsVAAAgAEAAIAAAACAAAAAAAAAAAAAAA=="
}
```

***
### 6a: export PSBT to environment-variable
Linux/Terminal:
 :arrow_forward: `export PSBT="PASTE_PSBT_HERE"`


Windows Powershell:
:large_orange_diamond:`[System.Environment]::SetEnvironmentVariable('PSBT',"PASTE_PSBT_HERE",'Process')`
![](https://i.imgur.com/CEDKcPZ.gif)

***
## Step 7: Sign Transaction (PSBT) 

Linux/Terminal:
:arrow_forward: ` bdk-cli wallet --wallet wallet_name --descriptor $my_descriptor sign --psbt $PSBT`

Windows Powershell:
:large_orange_diamond:`bdk-cli wallet --descriptor $env:my_descriptor sign --psbt $env:PSBT`


- DON'T FORGET to COPY the PSBT for the next step

![](https://i.imgur.com/f4o4Ce8.gif)


:+1: The output below confirms the command was successful.



```shell
{
  "is_finalized": true,
  "psbt": "cHNidP8BAFUBAAAAAak8uMR3UGkAGUKWsq8Mv45qg2fdD93JQRIsa2P0wFloAQAAAAD/////AQfgAQAAAAAAGXapFDRKD0jKFQ7CuQOBdmC5tosTpnAmiKwAAAAAAAEA3gIAAAAAAQFY9sVfEEbyjrHXSlxXDxL+71WOMnsPpVElwk+3E/J9vAAAAAAA/v///wIYZRIAAAAAABYAFBKYf7yF+ss6EFdw2rDZTfdLhep8eOABAAAAAAAWABQd6wBRnX8mBZiJYfvy/FGE+xKc+AJHMEQCIFSIkvEUI9yUgEw4JocRs1aiVsBlKKXrOQaQb3XFqR21AiBqiEVzCVVSRGjckyPDgAQBnOdSzBYR6Rw6KFcCP+E27wEhAwIlXdfM2WYnYa36Hp4MS6YkplBAgBsb1tYG9NiWFWTKzPYhAAEBH3jgAQAAAAAAFgAUHesAUZ1/JgWYiWH78vxRhPsSnPgiAgP80FpaWYQzGzCnNI9blXbei61YpAmtoezMRxpVvBJ6S0gwRQIhALWkBRSJzxuf0od4tPu3qFmEfJ2Y+/QBGtfjSFObWsPeAiA4QJx8Rk5pacrjHv5EOdw6RNHXcdtepFs+m0/Za/h0UQEiBgP80FpaWYQzGzCnNI9blXbei61YpAmtoezMRxpVvBJ6SxgTizKsVAAAgAEAAIAAAACAAAAAAAAAAAABBwABCGwCSDBFAiEAtaQFFInPG5/Sh3i0+7eoWYR8nZj79AEa1+NIU5taw94CIDhAnHxGTmlpyuMe/kQ53DpE0ddx216kWz6bT9lr+HRRASED/NBaWlmEMxswpzSPW5V23outWKQJraHszEcaVbwSeksAAA=="
}
```

***
### 7a: export signed psbt to environment variable
Linux/Terminal:
:arrow_forward: `export SIGNED_PSBT="Paste_PSBT_HERE"`

Windows Powershell:
:large_orange_diamond:
` $env:PSBTSIGNED = "STRINGHERE"`
![](https://i.imgur.com/VJsl8zR.gif)

***
## Step 8: Broadcast Transaction 
Linux/Terminal:
:arrow_forward:  `bdk-cli wallet --wallet wallet_name --descriptor $my_descriptor broadcast --psbt $SIGNED_PSBT`

Windows Powershell:
:large_orange_diamond:
` bdk-cli wallet --descriptor $env:my_descriptor broadcast --psbt $env:PSBTSIGNED`

![](https://i.imgur.com/yQZZk0d.gif)

 
:+1: The output below confirms the command was successful.

```shell
{
  "txid": "a0877b7ce91ea6d141ba63277673f5bdf0edfdd45f91a39ba1a1ace15f839b52"
}
```

- Verify transcation in the memory pool on testnet [Mempool-testnet!](https://mempool.space/testnet)
 
:::tip
Run sync one more time and see that the balance has decreased.
:::

***

## Resources
- [BIP-32:  Hierarchical Deterministic Wallets](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki)
- [BIP: 39 - Mnemonic code for generating deterministic keys](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
- [BIP: 44 - Multi-Account Hierarchy for Deterministic Wallets](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)
- [BIP: 84 - Derivation scheme for P2WPKH based accounts](https://github.com/bitcoin/bips/blob/master/bip-0084.mediawiki)
- [BIP: 174 - Partially Signed Bitcoin Transaction Format](https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki)
- [What are Descriptors and miniscript?](https://blog.summerofbitcoin.org/miniscript-policy-descriptors-hidden-powers-of-bitcoin/)
- [Master Private  Key and Extended Private Key](https://bitcoin.stackexchange.com/questions/97242/bip39-tool-bip32-extended-private-key-vs-bip32-root-key)
- [Minsc A Miniscript-based scripting language for Bitcoin contracts](https://min.sc)