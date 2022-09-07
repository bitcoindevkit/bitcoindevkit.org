# BDK playground

The playground is a porting of certain functions of `bdk-cli` over wasm32,
deployed at https://bitcoindevkit.org/bdk-cli/playground/

## Compiling and running

Update the [bdk-cli](./bdk-cli) submodule:

```
git submodule update --init --recursive
```

Compile bdk-cli using the right features and the WASM target:

```
cd bdk-cli
RUSTFLAGS="-C opt-level=s -C strip=symbols" cargo build --release --no-default-features --features esplora-reqwest,async-interface,compiler --target wasm32-unknown-unknown
```

From inside the `bdk-cli` directory, run `wasm-bindgen`

```
wasm-bindgen --target bundler --out-dir target/wasm32-unknown-unknown/release/ target/wasm32-unknown-unknown/release/bdk-cli.wasm
```

Come back to the playground directory, and build the javascript code:

```
cd ..
rm dist/*
npm run build
```

Last step! Now we substitute the old playground files with the freshly generated ones.
```
rm ../docs/.vuepress/public/bdk-cli/playground/*.wasm
cp dist/* ../docs/.vuepress/public/bdk-cli/playground/
```

Now you can come back to the project root, and start the website following the instructions
in the [`README.md`](../README.md)
