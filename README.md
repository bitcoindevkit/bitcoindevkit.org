# bitcoindevkit.org

[![Build Status](https://github.com/bitcoindevkit/bitcoindevkit.org/workflows/Build/badge.svg)](https://github.com/bitcoindevkit/bitcoindevkit.org/actions?query=workflow%3A%22Build%22)

### Build the Documentation Locally

In order to build the website locally, you'll need [Node.js](https://nodejs.org/) >= 14.16 (or basically the latest LTS version).

The setup is straight forward:

```bash
# Install dependencies
npm install

# Serve locally (by default on port 8080)
npm start
```

### Text Highlights

There are [three types of text highlights](https://vuepress.vuejs.org/guide/markdown.html#custom-containers) that can be used to display different colored boxes.

A green box displaying a friendly tip:

```md
:::tip
foo
:::
```

A yellow box with a cautious warning:

```md
:::warning
foo
:::
```

A red box with a clear danger, you can also add a title `foo` to any container:

```md
:::danger foo
bar
:::
```

### SEO improvements

We are using the [Vuepress SEO plugin](https://www.npmjs.com/package/vuepress-plugin-seo) to add relevant meta tags to the site and individual pages.

To improve the meta attributes of a specific page, you can add them as YAML frontmatter like this: (see the WooCommerce page for an example)

```text
---
description: How to integrate BDK
tags:
- Bitcoin
- BDK
---
# BDK integration

This document explains how to **integrate BDK into your stack**.
```

### Embedding YouTube videos

To add a YouTube video with a preview, you can so so by linking to it like this:

```md
[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/YOUTUBE_VIDEO_ID_HERE/mqdefault.jpg)](https://www.youtube.com/watch?v=YOUTUBE_VIDEO_ID_HERE)
```

Note that the link item need to be a preview image (either from YouTube or a custom one) to result in an embedded video.

### Check for broken links

The GitHub Actions pipeline checks for broken links after deploying the production site.
You can also run the link check locally using `npm run linkcheck:local`.
The dev server needs to be running alongside for this to work.

## Generating docs-rs

To create or re-create the contents of `static/docs-rs/bdk/<release>`, copy the contents of
the `bdk/target/doc` directory after running the below commands from the `bdk` project directory:

```bash
cargo clean
cargo +nightly rustdoc --features=compiler,electrum,esplora,compact_filters,key-value-db -- --cfg docsrs
```

A nightly toolchain is required because some cool features, like `intra_rustdoc_links` and `doc_cfg`, are still
unstable.

## Adding a blog post

Add a markdown file to `content/blog/<year/<name>.md`. At the beginning of the file add the following header:

```yaml
---
title: "<post title>"
description: "<post description>"
author: "<author>"
date: "<date in yyyy-mm-dd format>"
tags: ["<tag1>", "<tag2>"]
hidden: true
draft: false
---

```

After that header you can type your post using markdown.

The title will be shown on top of the page, together with the list of tags. The description won't be shown, it's only used
in the HTML metadata, so if you want to show it, you will have to copy it as part of the content that comes after the header.

If you need to add static data like pictures you can make a folder called `static/blog/<year>/<name>` and store everything you need in there.
