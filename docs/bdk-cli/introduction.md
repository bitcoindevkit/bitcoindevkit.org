# Introduction

[`bdk-cli`](https://github.com/bitcoindevkit/bdk-cli) is a lightweight [`repl`](https://codewith.mu/en/tutorials/1.0/repl) wrapper over `bdk` that comes as a command line application. It is useful for quick testing and prototyping of bdk functionalities.

This can also be used as an example application to create your own command line bitcoin wallet tool using bdk.

`bdk-cli` can interface with all the blockchain backends currently supported by `bdk`, like `rpc`, `electrum`, `esplora` and `compact_filters`.

<!-- `bdk-cli` comes with `regtest-*` features that can automatically deploy a regtest backend with a connected `bdk` wallet in background. This can be useful If you don't want to setup your own regtest node or try out quick tests, especially in `repl` mode. -->

Check out [project documentation](https://docs.rs/bdk-cli/0.3.0/bdk_cli/) for more details.

The following sections goes into more details on the installation and usage of `bdk-cli`.