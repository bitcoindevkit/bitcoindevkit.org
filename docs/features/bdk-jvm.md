# bdk-jvm `0.3.0`
[Bdk-jvm](https://github.com/bitcoindevkit/bdk-kotlin) is one of the language bindings libraries derived from the bitcoindevkit. It exposes a subset of the API of the bitcoindevkit. Below are high-level explanations of what you can do with the library as of version `0.3.0`. 

### Keys
- Generate a BIP32 Root Key, with or without a passphrase, choosing from 12, 15, 18, 21, or 24 words.
- Restore a BIP32 Root Key (root xprv) from a set of 12, 15, 18, 21, or 24 word recovery phrase, including with or without a passphrase.

### Wallets
- Load up a wallet using a descriptor
- Sync a wallet using Electrum or Esplora
- Connect to mainnet, testnet, or regtest
- Query the library to know what network it is using
- Get the balance of a wallet
- Query the wallet to get the last unused receive address is knows about
- Query the wallet to generate a new receive address
- Create watch-only wallets

### Transactions
- Create a PSBT with: 
  - 1 recipient
  - variable fee rate
- Sign a PSBT
- Broadcast a signed PSBT
- Get a list of transactions the wallet knows about. Each transaction is either confirmed or unconfirmed, and comes with transaction details, namely:
  - fees
  - sats sent
  - sats received
  - txid
 - If the transaction is confirmed, it also has a data structure which contains:
   - block height
   - block timestamp
