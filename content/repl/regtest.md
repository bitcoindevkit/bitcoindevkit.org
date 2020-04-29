---
title: "Regtest"
date: 2020-04-29T00:19:34+02:00
draft: false
weight: 4
pre: "<b>4. </b>"
---

Running the REPL in regtest requires having a local Electrum server set-up. There are two main implementations, [`electrs`](https://github.com/romanz/electrs) in Rust and [`ElectrumX`](https://github.com/kyuupichan/electrumx) in Python. Since the Rust toolchain is already required to
use Magical, this page will focus mostly on the former.

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

This will start the Electrum server on port 50001. You can then add the `-n regtest -s localhost:50001` the `magic` commands to switch to the local regtest.

## Troubleshooting

#### Stuck with "*wait until bitcoind is synced (i.e. initialblockdownload = false)*"

Just generate a few blocks with `bitcoin-cli generatetoaddress 1 <address>`
