# Installation

## Requirements

The only requirement to run the `bdk-cli` tool is a Linux/macOS system with a fairly recent Rust
toolchain installed. Since Linux distros tend to lag behind with updates, the quickest way to
install the Rust compiler and Cargo is [rustup.rs](https://rustup.rs/). You can head there and
follow their instructions, after which you can test if everything went fine by running
`cargo version`, which should print something like:

```
cargo 1.53.0 (53cb7b09b 2021-06-17)
```

If you really don't want to pipe the output of `curl` into `sh`, you can also try using a
[Docker image](https://hub.docker.com/_/rust) and working inside of it, but that's meant for more
advanced users and won't be covered in this guide.

::: tip Note
At the time of writing, the project requires cargo >= 1.46.0, which is our minimum supported rust version (MSRV) as of July 2021. If you have an older version installed with rustup.rs, you can upgrade it with `rustup update`.
:::

## Installing the `bdk-cli` tool

Once Cargo is installed, you can proceed to install the interactive `bdk-cli` tool directly from
the GitHub repository, by running:

```bash
# all features
cargo install --git https://github.com/bitcoindevkit/bdk-cli --features=esplora,compiler

# minimal install
cargo install --git https://github.com/bitcoindevkit/bdk-cli
```

This command may take a while to finish, since it will fetch and compile all the dependencies and the `bdk` library itself.

Once it's done, you can check if everything went fine by running `bdk-cli --help` which should print something like this:

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
    compile    Compile a miniscript policy to an output descriptor
    help       Prints this message or the help of the given subcommand(s)
    key        Key management sub-commands
    repl       Enter REPL command loop mode
    wallet     Wallet options and sub-commands

```

An example command to sync a testnet wallet to a default electrum server looks like this:

```bash
bdk-cli wallet -w example --descriptor "wpkh(tprv8ZgxMBicQKsPexGYyaFwnAsCXCjmz2FaTm6LtesyyihjbQE3gRMfXqQBXKM43DvC1UgRVv1qom1qFxNMSqVAs88qx9PhgFnfGVUdiiDf6j4/0/*)" sync
```
