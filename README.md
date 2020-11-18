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
   cargo +nightly rustdoc --features=compiler,electrum,esplora,compact_filters,key-value-db -- --cfg docsrs
   ```

A nightly toolchain is required because some cool features, like `intra_rustdoc_links` and `doc_cfg`, are still
unstable.

# adding a blog post

Add a markdown file to `content/blog/<year/<name>.md`. At the beginning of the file add the following header:

```
---
title: "<post title>"
description: "<post description>"
author: "<author>"
date: "<date in yyyy-mm-dd format>"
tags: ["<tag1>", "<tag2>]
hidden: true
draft: false
---

```

After that header you can type your post using markdown.

The title will be shown on top of the page, together with the list of tags. The description won't be shown, it's only used
in the HTML metadata, so if you want to show it, you will have to copy it as part of the content that comes after the header.

If you need to add static data like pictures you can make a folder called `static/blog/<year>/<name>` and store everything you need in there.
