---
title: "Installation"
date: 2020-04-28T17:11:29+02:00
draft: false
weight: 1
pre: "<b>1. </b>"
---

## Requirements

The only requirement is a Linux/macOS system with a fairly recent Rust toolchain installed. Since Linux distros tend to lack behind with updates, the quickest way to install the Rust compiler and Cargo is
[rustup.rs](https://rustup.rs/). You can head there and follow their instructions, after which you can test if everything went fine by running `cargo version`, which should print something like:

```
cargo 1.42.0 (86334295e 2020-01-31)
```

If you really don't wanna pipe the output of `curl` into `sh`, you can also try using a [Docker image](https://hub.docker.com/_/rust) and working inside of it, but that's meant for more advanced
users and won't be covered in this guide.

## Installing Magical Bitcoin

Once Cargo is installed, you can proceed to install the interactive Magical Bitcoin shell directly from the GitHub repository, by running:

```bash
cargo install --git https://github.com/magicalbitcoin/magical-bitcoin-wallet --example magic
```

This command will probably take a while to finish, since it will fetch and compile all the dependencies and the `magical-bitcoin-wallet` itself. Once it's done, you can check if everything went fine
by running `magic --help` which should print something like this:

```text
Magical Bitcoin Wallet 0.1.0
Riccardo Casatta <riccardo@casatta.it>:Alekos Filini <alekos.filini@gmail.com>
A modern, lightweight, descriptor-based wallet

USAGE:
    magic [FLAGS] [OPTIONS] --descriptor <DESCRIPTOR> [SUBCOMMAND]

FLAGS:
    -h, --help       Prints help information
    -v               Sets the level of verbosity
    -V, --version    Prints version information

OPTIONS:
    -c, --change_descriptor <DESCRIPTOR>    Sets the descriptor to use for internal addresses
    -d, --descriptor <DESCRIPTOR>           Sets the descriptor to use for the external addresses
    -n, --network <NETWORK>                 Sets the network [default: testnet]  [possible values: testnet, regtest]
    -s, --server <SERVER:PORT>              Sets the Electrum server to use [default: tn.not.fyi:55001]
    -w, --wallet <WALLET_NAME>              Selects the wallet to use [default: main]

SUBCOMMANDS:
    broadcast          Extracts the finalized transaction from a PSBT and broadcasts it to the network
    create_tx          Creates a new unsigned tranasaction
    get_balance        Returns the current wallet balance
    get_new_address    Generates a new external address
    help               Prints this message or the help of the given subcommand(s)
    list_unspent       Lists the available spendable UTXOs
    policies           Returns the available spending policies for the descriptor
    repl               Opens an interactive shell
    sign               Signs and tries to finalize a PSBT
    sync               Syncs with the chosen Electrum server
```
