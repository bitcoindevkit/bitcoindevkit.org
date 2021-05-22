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
cargo install --git https://github.com/bitcoindevkit/bdk-cli --features=esplora,compiler,electrum,repl
# most commonly used features
```

This command may take a while to finish, since it will fetch and compile all the
dependencies and the `bdk` library itself. Once it's done, you can check if everything went fine by
running `bdk-cli --help` which should print something like this:

```text
BDK CLI 0.2.1-dev
Alekos Filini <alekos.filini@gmail.com>:Riccardo Casatta <riccardo@casatta.it>:Steve Myers <steve@notmandatory.org>
Top level options and command modes

USAGE:
    bdk-cli [OPTIONS] <SUBCOMMAND>

FLAGS:
    -h, --help       Prints help information
    -V, --version    Prints version information

OPTIONS:
    -n, --network <NETWORK>    Sets the network [default: testnet]

SUBCOMMANDS:
    help      Prints this message or the help of the given subcommand(s)
    key       Key management sub-commands
    repl      Enter REPL command loop mode
    wallet    Wallet options and sub-commands
```

An example command to sync a testnet wallet looks like this:

```bash
bdk-cli wallet -w bdk0rigins --descriptor "wpkh(tprv8ZgxMBicQKsPexGYyaFwnAsCXCjmz2FaTm6LtesyyihjbQE3gRMfXqQBXKM43DvC1UgRVv1qom1qFxNMSqVAs88qx9PhgFnfGVUdiiDf6j4/0/*)" --server ssl://electrum.blockstream.info:60002 sync 
```