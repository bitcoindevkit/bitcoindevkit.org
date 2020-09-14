# bitcoindevkit.org

This website is built with [Hugo](https://gohugo.io).

To clone this project use the --recursive option to also clone the themes/learn submodule:

   ```
   git clone --recursive git@github.com:bitcoindevkit/bitcoindevkit.org.git
   ```

If you are editing this website, you can run

   ```
   hugo server
   ```

to start a local webserver at [`http://localhost:1313`](http://localhost:1313).

# generating docs-rs

To create or re-create the contents of `static/docs-rs/bdk/<release>`, copy the contents of 
the `bdk/target/doc` directory after running the below commands from the `bdk` project directory:

   ```
   cargo clean
   cargo doc --no-deps
   ```
