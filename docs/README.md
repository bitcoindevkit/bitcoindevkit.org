---
home: true
heroText: Bitcoin Dev Kit
tagline: A flexible Bitcoin implementation and supporting batteries.
actionText: Get started
actionLink: /getting-started/
features:
- title: "Customizable"
  details: "Designed from the ground up to be easily customized to your application needs: persistence, networking, chain source, routing, key management, wallet, you name it."
  image: "customizable"
- title: "Focus on what matters"
  details: "All of the low-level Bitcoin logic is handled by us, so you can focus on crafting custom-tailored user experiences."
  image: "focus"
- title: "High performance & compact"
  details: "As lightweight as you need it to be and optimized to run on all modern-day embedded devices such as mobile phones, IoT devices, PoS terminals and more."
  image: "mobile"
---

<div class="intro">

## Bitcoin Dev Kit

The [Bitcoin Dev Kit (BDK)](https://github.com/bitcoindevkit) project (originally called Magical Bitcoin 🧙) aims to build a collection of tools and libraries that are designed to be a solid foundation for cross platform Bitcoin wallets, along with a fully working *reference implementation* wallet called Magical Bitcoin.
All BDK components are designed to be lightweight and modular so that they can be adapted for virtually any use-case: from single-sig mobile wallets to multi-billion-dollar cold storage vaults.

</div>

<div class="features">
<div class="feature">
<h3>Playground</h3>

As a way of demonstrating the flexibly of this project, a minimalistic command line tool (called `bdk-cli`) is available as a debugging tool in the [`bdk-cli`](https://github.com/bitcoindevkit/bdk-cli)
repo. It can be used directly from the browser.

[Playground →](./bdk-cli/playground/)

</div>

<div class="feature">
<h3>Descriptors</h3>

One of the original milestones of this project was to provide wallets with "almost magically" support for very complex spending policies, without having to individually translate them into code.

[Documentation →](./descriptors/)

</div>
</div>
