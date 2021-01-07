---
title: "Installation"
date: 2020-04-28T17:11:29+02:00
draft: false
weight: 1
pre: "<b>1. </b>"
---

## Requirements

The only requirement to run the `bdk-cli` tool is a Linux/macOS system with a fairly recent Rust
toolchain installed. Since Linux distros tend to lag behind with updates, the quickest way to
install the Rust compiler and Cargo is [rustup.rs](https://rustup.rs/). You can head there and
follow their instructions, after which you can test if everything went fine by running
`cargo version`, which should print something like:

```
cargo 1.45.0 (744bd1fbb 2020-06-15)
```

If you really don't want to pipe the output of `curl` into `sh`, you can also try using a
[Docker image](https://hub.docker.com/_/rust) and working inside of it, but that's meant for more
advanced users and won't be covered in this guide.

{{% notice note %}}
At the time of writing, the project requires cargo >= 1.45.0, which is the latest stable as of
June 2020. If you have an older version installed with rustup.rs, you can upgrade it with
`rustup update`.
{{% /notice %}}

## Installing the `bdk-cli` tool

Once Cargo is installed, you can proceed to install the interactive `bdk-cli` tool directly from
the GitHub repository, by running:

```bash
cargo install --git https://github.com/bitcoindevkit/bdk-cli --features=esplora
```

This command may take a while to finish, since it will fetch and compile all the
dependencies and the `bdk` library itself. Once it's done, you can check if everything went fine by
running `bdk-cli --help` which should print something like this:

```text
BDK CLI 0.1.0
Alekos Filini <alekos.filini@gmail.com>:Riccardo Casatta <riccardo@casatta.it>
A modern, lightweight, descriptor-based wallet

USAGE:
    bdk-cli [OPTIONS] --descriptor <DESCRIPTOR> <SUBCOMMAND>

FLAGS:
    -h, --help       Prints help information
    -V, --version    Prints version information

OPTIONS:
    -c, --change_descriptor <CHANGE_DESCRIPTOR>        Sets the descriptor to use for internal addresses
    -d, --descriptor <DESCRIPTOR>                      Sets the descriptor to use for the external addresses
        --esplora_concurrency <ESPLORA_CONCURRENCY>    Concurrency of requests made to the esplora server [default: 4]
    -e, --esplora <ESPLORA_URL>                        Use the esplora server if given as parameter
    -n, --network <NETWORK>                            Sets the network [default: testnet]
    -p, --proxy <PROXY_SERVER:PORT>                    Sets the SOCKS5 proxy for the Electrum client
    -s, --server <SERVER:PORT>
            Sets the Electrum server to use [default: ssl://electrum.blockstream.info:60002]

    -w, --wallet <WALLET_NAME>                         Selects the wallet to use [default: main]

SUBCOMMANDS:
    broadcast            Broadcasts a transaction to the network. Takes either a raw transaction or a PSBT to
                         extract
    bump_fee             Bumps the fees of an RBF transaction
    combine_psbt         Combines multiple PSBTs into one
    create_tx            Creates a new unsigned transaction
    extract_psbt         Extracts a raw transaction from a PSBT
    finalize_psbt        Finalizes a PSBT
    get_balance          Returns the current wallet balance
    get_new_address      Generates a new external address
    help                 Prints this message or the help of the given subcommand(s)
    list_transactions    Lists all the incoming and outgoing transactions of the wallet
    list_unspent         Lists the available spendable UTXOs
    policies             Returns the available spending policies for the descriptor
    public_descriptor    Returns the public version of the wallet's descriptor(s)
    repl                 Enter REPL command loop mode
    sign                 Signs and tries to finalize a PSBT
    sync                 Syncs with the chosen blockchain server
```

An example command to sync a testnet wallet looks like this:

```
bdk-cli --descriptor "wpkh(tprv8ZgxMBicQKsPexGYyaFwnAsCXCjmz2FaTm6LtesyyihjbQE3gRMfXqQBXKM43DvC1UgRVv1qom1qFxNMSqVAs88qx9PhgFnfGVUdiiDf6j4/0/*)" --network testnet --server ssl://electrum.blockstream.info:60002 sync
```