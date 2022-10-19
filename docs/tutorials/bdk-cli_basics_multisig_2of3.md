---
title: "bdk-cli basics multi-sig 2 of 3 tutorial"
description: "Tutorial using command-line to create a 2 of 3 multi-sig Wallet and Spend"
authors:
    - waterstone
date: "2022-10-17"
tags: ["tutorial", "bdk-cli","multi-sig"]
hidden: false
draft: false
---

## 2-of-3 Multi-Signature Descriptor Wallet using bdk-cli

## Overview of the tutorial
- The purpose of this tutorial is to continue learning `bdk-cli` as our tool to manage a 2 of 3 multi-signature wallet.
- Generate a receive address with a spending Policy of 2 out of 3 escrow aka multi-signature.
- Intro to more complex but standard policies to create custom encumberances aka custom spending conditions for transactions. 

Note that to complete this tutorial, you'll need to enable the `compiler` and `electrum` flags when installing or building bdk-cli, for example by installing using:
```shell
cargo install bdk-cli --features=compiler,electrum
```

## Step 1: Generate the XPRVs (Extended-Keys) and Save to environment variables

> Create three private keys and each in their own environment variable

:arrow_forward: `export XPRV_00=$(bdk-cli key generate | jq -r '.xprv')`

:arrow_forward:   `export XPRV_01=$(bdk-cli key generate | jq -r '.xprv')`

:arrow_forward:   `export XPRV_02=$(bdk-cli key generate | jq -r '.xprv')`


![](https://i.imgur.com/FwgUdwK.gif)

### 1a: Verify XPRV environment variables are Active

:arrow_forward: `env | grep XPRV`

![](https://i.imgur.com/ZerGPbO.gif)


## Step 2: Generate XPUBs (Extended Public Keys) & Save to environment variables 

> Generate the three individual Public Keys aka XPUBs using our Private key and descriptor path. 

:arrow_forward: `export XPUB_00=$(bdk-cli key derive --xprv $XPRV_00 --path "m/84'/1'/0'/0" | jq -r ".xpub")`

:arrow_forward: `export XPUB_01=$(bdk-cli key derive --xprv $XPRV_01 --path "m/84'/1'/0'/0" | jq -r ".xpub")`

:arrow_forward: `export XPUB_02=$(bdk-cli key derive --xprv $XPRV_02 --path "m/84'/1'/0'/0" | jq -r ".xpub")`


![](https://i.imgur.com/xT3KRh4.gif)

### 2a: Verify XPUB environment variables

:arrow_forward:    `env | grep XPUB`

![](https://i.imgur.com/SzAip9E.gif)

***
## Step 3: Create Single-Wallet Descriptors

> Create the wallet Descriptor for each wallet

:arrow_forward: `export DESCRIPTOR_00="$XPRV_00/84h/1h/0h/0/*"`

:arrow_forward: `export DESCRIPTOR_01="$XPRV_01/84h/1h/0h/0/*"`

:arrow_forward: `export DESCRIPTOR_02="$XPRV_02/84h/1h/0h/0/*"`


![](https://i.imgur.com/mFrWt6b.png)


## Step 4: Create Multi-Sig-Descriptor Wallets
> This is how you create the 2-of-3 multi-sig output descriptor. You will need (one PrivateKey and two Xpubs) It consists of using the `compiler` function to parse `policy` to `mini-script` .

- When creating the descriptor the order matters so be aware of that when following tutorial if you are for any reason changing the order of the policy.
#### Multi-Sig-Wallet 0
- [ ] :arrow_forward: `export MULTI_DESCRIPTOR_00=$(bdk-cli compile "thresh(2,pk($DESCRIPTOR_00),pk($XPUB_01),pk($XPUB_02))" | jq -r '.descriptor')`

#### Multi-Sig-Wallet 1
- [ ] :arrow_forward: `export MULTI_DESCRIPTOR_01=$(bdk-cli compile "thresh(2,pk($XPUB_00),pk($DESCRIPTOR_01),pk($XPUB_02))" | jq -r '.descriptor')`

#### Multi-Sig-Wallet 2
- [ ] :arrow_forward:  `export MULTI_DESCRIPTOR_02=$(bdk-cli compile "thresh(2,pk($XPUB_00),pk($XPUB_01),pk($DESCRIPTOR_02))" | jq -r '.descriptor')`

![](https://i.imgur.com/Yb8RmFS.gif)

#### multi-sig 2 of 3 policy gets compiled to miniscript
```shell
# policy
thresh(2,pk(XPRV_A),pk(XPUB_B),pk(XPUB_C)) 

# miniscript
wsh(multi(2,XPRV_KEY,PUBKEY_B,XPUB_C))
```


***


### 4a: Verify Multi-Sig-Descriptor environment variables are active

:arrow_forward: `env | grep MULTI`


![](https://i.imgur.com/aAgtlsi.gif)

***

## Step 5: Generate Receive Address by using Multi-Sig-Descriptor Wallets 

:arrow_forward: `bdk-cli wallet --wallet wallet_name_msd00 --descriptor $MULTI_DESCRIPTOR_00 get_new_address`

:arrow_forward: `bdk-cli wallet --wallet wallet_name_msd01 --descriptor $MULTI_DESCRIPTOR_01 get_new_address`

:arrow_forward: `bdk-cli wallet --wallet wallet_name_msd02 --descriptor $MULTI_DESCRIPTOR_02 get_new_address`

![](https://i.imgur.com/w1fxPSn.gif)


:red_circle: Did you generate the same address for all three? Good! Else, something might be incorrect.

## Step 6: Send Testnet Bitcoin to the newly created receive-address

[Bitcoin Testnet Faucet link:1](https://testnet-faucet.mempool.co)
[Bitcoin Testnet Faucet link:2](https://bitcoinfaucet.uo1.net)

## Step 7: Sync one of the Multi-Sig Wallets 

:arrow_forward: ` bdk-cli wallet --wallet wallet_name_msd00 --descriptor $MULTI_DESCRIPTOR_00 sync`

![](https://i.imgur.com/GuefgeI.gif)


## Step 8: Check Balance Multi-Sig Wallets


:arrow_forward: ` bdk-cli wallet --wallet wallet_name_msd00 --descriptor $MULTI_DESCRIPTOR_00 get_balance`

![](https://i.imgur.com/zNciCqF.gif)


- Every wallet has access to sync and view balance. 

## Step 9: Check Multi-Sig Policies on Descriptor Wallet
:arrow_forward:` bdk-cli wallet --wallet wallet_name_msd00 --descriptor $MULTI_DESCRIPTOR_00 policies`

The output below confirms the command was successful.
```shell
{
  "external": {
    "contribution": {
      "conditions": {
        "0": [
          {}
        ]
      },
      "items": [
        0
      ],
      "m": 2,
      "n": 3,
      "sorted": false,
      "type": "PARTIAL"
    },
    "id": "seaxtqqn",
    "keys": [
      {
        "fingerprint": "7cdf2d46"
      },
      {
        "fingerprint": "fc7870cd"
      },
      {
        "fingerprint": "26b03333"
      }
    ],
    "satisfaction": {
      "items": [],
      "m": 2,
      "n": 3,
      "sorted": false,
      "type": "PARTIAL"
    },
    "threshold": 2,
    "type": "MULTISIG"
  },
  "internal": null
}


```

### SpendingPolicyRequired for complex descriptors 

```shell
--external_policy "{\"seaxtqqn\": [0,1]}"
     <-rootnode-><children #0 and #1 of root node>
```

>  Save the "id": We will need to use this ''id'' later.

More info on [external policies here](https://bitcoindevkit.org/bdk-cli/interface/)

## Step 10: Create a Transaction (PSBT)
- 1st Create a PSBT using the first wallet
- 2nd Sign the PSBT with the first wallet
- 3rd  Sign PSBT with the second wallet
- Broadcast PSBT

### Export UNSIGNED_PSBT to environment variable
:arrow_forward: `export UNSIGNED_PSBT=$(bdk-cli wallet --wallet wallet_name_msd00 --descriptor $MULTI_DESCRIPTOR_00 create_tx --send_all --to mkHS9ne12qx9pS9VojpwU5xtRd4T7X7ZUt:0 --external_policy "{\"CHANGE_ID_HERE\": [0,1]}" | jq -r '.psbt')`

### Verify UNSIGNED_PSBT  environment variable 
:arrow_forward: `env | grep UNSIGNED`
![](https://i.imgur.com/djHaRDq.gif)

## Step 11: SIGN the Transaction  

### 1st Wallet Signs the transaction 

:arrow_forward: `bdk-cli wallet --wallet wallet_name_msd00 --descriptor $MULTI_DESCRIPTOR_00 sign --psbt $UNSIGNED_PSBT`

:arrow_forward: `export ONESIG_PSBT=$(bdk-cli wallet --wallet wallet_name_msd00 --descriptor $MULTI_DESCRIPTOR_00 sign --psbt $UNSIGNED_PSBT | jq -r '.psbt')`

:arrow_forward:`env | grep ONESIG`

```
{
  "is_finalized": false,
  "psbt": "cHNidP8BAFUBAAAAAdYCtva/7Rkt+fgFu3mxAdaPh4uTbgBL3HmYZgcEKWygAAAAAAD/////AQqGAQAAAAAAGXapFDRKD0jKFQ7CuQOBdmC5tosTpnAmiKwAAAAAAAEA6gIAAAAAAQFLyGFJFK884DGBM1WgskRZ6gKp/7oZ+Z30u0+wF3pZYAEAAAAA/v///wKghgEAAAAAACIAINHcOQLE6GpJ3J+FOzn/be+HApxW8sZtGqfA3TBW+NYX91hoOAAAAAAWABTPQDZx2wYYIn+ug2pZBmWBn0Tu/gJHMEQCIHu6GmRMDgPZyTx+klFMA9VujR3qDA/Y08kSkRvOaChjAiBAtExtGAYLuQ/DDJzCqLlNZ1bMB3MV+nxsLfTdI9YcYwEhA0b8lz+kt0xHfR/tjUKOc2Nt2L61pDd5vJ/lsKi8pw9MmFUjAAEBK6CGAQAAAAAAIgAg0dw5AsToakncn4U7Of9t74cCnFbyxm0ap8DdMFb41hciAgIjUCIdnyr6rDtuNhVNt4ZBDcvYLawfoJbzbPyxc/WNDUgwRQIhAJdILr7G3UzYylyr2fA13MFsz/jG4+iZlKeEkX79d082AiA99UF0/uFyXBVNUmuGaxdHL7wlhzqfbgGLMREN0z/O6QEBBWlSIQIjUCIdnyr6rDtuNhVNt4ZBDcvYLawfoJbzbPyxc/WNDSEDzsDXexRPSxeXiLJoS0i2fQlOoOGHmo+Dhaeaq3oHV6YhAjGKA2Dqg+QeMICBAifYslQF2WrehLEQ0iEOpp/+eQ0NU64iBgIjUCIdnyr6rDtuNhVNt4ZBDcvYLawfoJbzbPyxc/WNDRh83y1GVAAAgAEAAIAAAACAAAAAAAAAAAAiBgIxigNg6oPkHjCAgQIn2LJUBdlq3oSxENIhDqaf/nkNDRgmsDMzVAAAgAEAAIAAAACAAAAAAAAAAAAiBgPOwNd7FE9LF5eIsmhLSLZ9CU6g4Yeaj4OFp5qregdXphj8eHDNVAAAgAEAAIAAAACAAAAAAAAAAAAAAA=="
}
```

![](https://i.imgur.com/0w4sK5y.gif)

### 2nd Wallet Signs the transaction 
:arrow_forward: `bdk-cli wallet --wallet wallet_name_msd01 --descriptor $MULTI_DESCRIPTOR_01 sign --psbt $ONESIG_PSBT`

:arrow_forward: `export SECONDSIG_PSBT=$(bdk-cli wallet --wallet wallet_name_msd01 --descriptor $MULTI_DESCRIPTOR_01 sign --psbt $ONESIG_PSBT | jq -r '.psbt')`


:arrow_forward:`env | grep SECONDSIG`

```
{
  "is_finalized": true,
  "psbt": "cHNidP8BAFUBAAAAAdYCtva/7Rkt+fgFu3mxAdaPh4uTbgBL3HmYZgcEKWygAAAAAAD/////AQqGAQAAAAAAGXapFDRKD0jKFQ7CuQOBdmC5tosTpnAmiKwAAAAAAAEA6gIAAAAAAQFLyGFJFK884DGBM1WgskRZ6gKp/7oZ+Z30u0+wF3pZYAEAAAAA/v///wKghgEAAAAAACIAINHcOQLE6GpJ3J+FOzn/be+HApxW8sZtGqfA3TBW+NYX91hoOAAAAAAWABTPQDZx2wYYIn+ug2pZBmWBn0Tu/gJHMEQCIHu6GmRMDgPZyTx+klFMA9VujR3qDA/Y08kSkRvOaChjAiBAtExtGAYLuQ/DDJzCqLlNZ1bMB3MV+nxsLfTdI9YcYwEhA0b8lz+kt0xHfR/tjUKOc2Nt2L61pDd5vJ/lsKi8pw9MmFUjAAEBK6CGAQAAAAAAIgAg0dw5AsToakncn4U7Of9t74cCnFbyxm0ap8DdMFb41hciAgIjUCIdnyr6rDtuNhVNt4ZBDcvYLawfoJbzbPyxc/WNDUgwRQIhAJdILr7G3UzYylyr2fA13MFsz/jG4+iZlKeEkX79d082AiA99UF0/uFyXBVNUmuGaxdHL7wlhzqfbgGLMREN0z/O6QEiAgPOwNd7FE9LF5eIsmhLSLZ9CU6g4Yeaj4OFp5qregdXpkgwRQIhAO2aRERcublhAzToshkZRMg2I8GaE7mM2ECr0vYyuscmAiB5KK4ETlvrLqL0QbcRbGqrSwIa9lVuOqP3f5qCnGRMaQEBBWlSIQIjUCIdnyr6rDtuNhVNt4ZBDcvYLawfoJbzbPyxc/WNDSEDzsDXexRPSxeXiLJoS0i2fQlOoOGHmo+Dhaeaq3oHV6YhAjGKA2Dqg+QeMICBAifYslQF2WrehLEQ0iEOpp/+eQ0NU64iBgIjUCIdnyr6rDtuNhVNt4ZBDcvYLawfoJbzbPyxc/WNDRh83y1GVAAAgAEAAIAAAACAAAAAAAAAAAAiBgIxigNg6oPkHjCAgQIn2LJUBdlq3oSxENIhDqaf/nkNDRgmsDMzVAAAgAEAAIAAAACAAAAAAAAAAAAiBgPOwNd7FE9LF5eIsmhLSLZ9CU6g4Yeaj4OFp5qregdXphj8eHDNVAAAgAEAAIAAAACAAAAAAAAAAAABBwABCP3+AAQASDBFAiEAl0guvsbdTNjKXKvZ8DXcwWzP+Mbj6JmUp4SRfv13TzYCID31QXT+4XJcFU1Sa4ZrF0cvvCWHOp9uAYsxEQ3TP87pAUgwRQIhAO2aRERcublhAzToshkZRMg2I8GaE7mM2ECr0vYyuscmAiB5KK4ETlvrLqL0QbcRbGqrSwIa9lVuOqP3f5qCnGRMaQFpUiECI1AiHZ8q+qw7bjYVTbeGQQ3L2C2sH6CW82z8sXP1jQ0hA87A13sUT0sXl4iyaEtItn0JTqDhh5qPg4Wnmqt6B1emIQIxigNg6oPkHjCAgQIn2LJUBdlq3oSxENIhDqaf/nkNDVOuAAA="
}
```

![](https://i.imgur.com/OdLHnJ3.gif)

## Step 12: Broadcast Transaction 

:arrow_forward: `bdk-cli wallet --wallet wallet_name_msd01 --descriptor $MULTI_DESCRIPTOR_01 broadcast --psbt $SECONDSIG_PSBT`

```
{
  "txid": "61da2451874a483aa8d1d0787c7680d157639f284840de8885098cac43f6cc2f"
}
```

![](https://i.imgur.com/M7s0Fd6.gif)

### Verify Transaction 
Verify transcation in the memory pool on testnet [Mempool-testnet!](https://mempool.space/testnet)
