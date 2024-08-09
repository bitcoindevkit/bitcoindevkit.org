# Installation

## Requirements

The only requirement to run the `bdk-cli` tool is a Linux/macOS system with a fairly recent Rust
toolchain installed. Since Linux distros tend to lag behind with updates, the quickest way to
install the Rust compiler and Cargo is [rustup.rs](https://rustup.rs/). You can head there and
follow their instructions, after which you can test if everything went fine by running
`cargo version`, which should print something like:

```
cargo 1.56.0 (4ed5d137b 2021-10-04)
```

As an alternative to installing the Rust toolchain, you can try using a
[Docker image](https://hub.docker.com/_/rust) and working inside of it, but that's meant for more
advanced users and won't be covered in this guide.

::: tip Note
At the time of writing, the project requires cargo >= 1.56.0, which is our minimum supported rust version (MSRV) as of May 2022. If you have an older version installed with rustup.rs, you can upgrade it with `rustup update`.
:::

## Installing the `bdk-cli` tool

Once Cargo is installed, you can proceed to install the interactive `bdk-cli` tool directly from
the GitHub repository, by running:

```bash
# all features with the blocking esplora client 
cargo install --git https://github.com/bitcoindevkit/bdk-cli --features=esplora-ureq,compiler
```

```bash
# all features with the async esplora client 
cargo install --git https://github.com/bitcoindevkit/bdk-cli --features=esplora-reqwest,compiler
```

```bash
# minimal install (only repl feature is on by default)
cargo install --git https://github.com/bitcoindevkit/bdk-cli
```

For Windows users, the default SQLite database requires extensive configuration and `bdk-cli` will not build properly if SQLite is unconfigured. To proceed with the installation using `sled` instead, run:

```bash
# disable sqlite and use sled
cargo install bdk-cli --no-default-features --features=key-value-db,esplora-ureq,compiler
```

This command may take a while to finish, since it will fetch and compile all the dependencies and the `bdk` library itself.

Once it's done, you can check if everything went fine by running `bdk-cli --help` which should print something like this:

```
bdk-cli 0.5.0
Alekos Filini <alekos.filini@gmail.com>:Riccardo Casatta <riccardo@casatta.it>:Steve Myers <steve@notmandatory.org>
The BDK Command Line Wallet App

bdk-cli is a light weight command line bitcoin wallet, powered by BDK. This app can be used as a playground as well as
testing environment to simulate various wallet testing situations. If you are planning to use BDK in your wallet, bdk-
cli is also a great intro tool to get familiar with the BDK API.

But this is not just any toy. bdk-cli is also a fully functioning Bitcoin wallet with taproot support!


USAGE:
    bdk-cli [OPTIONS] <SUBCOMMAND>

FLAGS:
    -h, --help       
            Prints help information

    -V, --version    
            Prints version information


OPTIONS:
    -n, --network <NETWORK>    
            Sets the network [default: testnet]


SUBCOMMANDS:
    compile    Compile a miniscript policy to an output descriptor
    help       Prints this message or the help of the given subcommand(s)
    key        Key Management Operations
    repl       REPL command loop mode
    wallet     Wallet Operations

```

An example command to sync a testnet wallet to a default electrum server looks like this:

```bash
bdk-cli wallet -w example --descriptor "wpkh(tprv8ZgxMBicQKsPexGYyaFwnAsCXCjmz2FaTm6LtesyyihjbQE3gRMfXqQBXKM43DvC1UgRVv1qom1qFxNMSqVAs88qx9PhgFnfGVUdiiDf6j4/0/*)" sync
```
