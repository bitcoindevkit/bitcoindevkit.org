# Regtest

Running the `bdk-cli` tool in regtest requires having a local Electrum server set-up. There are two main implementations, [`electrs`](https://github.com/romanz/electrs) in Rust and [`ElectrumX`](https://github.com/spesmilo/electrumx) in Python. Since the Rust toolchain is already required to
use BDK, this page will focus mostly on the former.

Electrs can be installed by running:

```bash
cargo install --git https://github.com/romanz/electrs --bin electrs
```

Just like before, this command will probably take a while to finish.

Once it's done, assuming you have a regtest bitcoind running in background, you can launch a new terminal and run the following command to actually start electrs:

```bash
electrs -vv --timestamp --db-dir /tmp/electrs-db --electrum-rpc-addr="127.0.0.1:50001" --network=regtest --cookie-file=$HOME/.bitcoin/regtest/.cookie
```

on macOS you should change the cookie-file to `$HOME/Library/Application Support/Bitcoin/regtest/.cookie`.

This will start the Electrum server on port 50001. You can then add the `-n regtest -s 127.0.0.1:50001` to the `bdk-cli` commands to switch to the local regtest.

## Troubleshooting

#### Stuck with "*wait until bitcoind is synced (i.e. initialblockdownload = false)*"

Just generate a few blocks with `bitcoin-cli generatetoaddress 1 <address>`

## Bonus: Docker

If you have already installed Docker on your machine, you can also use 🍣 [Nigiri CLI](https://github.com/vulpemventures/nigiri) to spin-up a complete development environment in `regtest` that includes a `bitcoin` node, an `electrs` explorer and the [`esplora`](https://github.com/blockstream/esplora) web-app to visualize blocks and transactions in the browser.

Install 🍣 Nigiri
```bash
$ curl https://getnigiri.vulpem.com | bash
```

Start Docker daemon and run Nigiri box
```
$ nigiri start
```

This will start electrum RPC interface on port `51401`, the REST interface on `3000` and the esplora UI on `5000` (You can visit with the browser and look for blocks, addresses and transactions)

You can then add the `-n regtest -s 127.0.0.1:51401` to the `bdk-cli` commands to switch to the local regtest.
