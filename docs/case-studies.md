---
cases: true
sidebar: false
tagline: "Bitcoin applications building with BDK"
description: "A list of bitcoin applications and services building with BDK"
actionText: "Add your project"
actionLink: "https://github.com/orgs/lightningdevkit/discussions/1554"
editLink: false
lastUpdated: false
---

<h1 class="more-cases-heading">
   Meet the projects building with BDK
</h1>

<!-- <CodeSwitcher :languages="{all: 'All', mobile:'Mobile', web:'Web', desktop:'Desktop', custodial: 'Custodial', infra:'Infrastructure', misc:'Misc',}"> -->
  
<CodeSwitcher :languages="{ all: 'All', mobile: 'Mobile', desktop: 'Desktop', hardware: 'Hardware', custodial: 'Custodial' }">

  <template v-slot:mobile>
    <div class="case-studies">
      <div class="case-study-item">
        <a href="https://bitkey.build/" target="_blank">
          <img src="/img/case-studies-logos/block-logo.gif" />
        </a>
        <h3>
          <a href="https://bitkey.build/" target="_blank">Bitkey</a> 
        </h3>
        <p>Bitkey is the safe, easy way to own and manage bitcoin. It’s a mobile app, hardware device, and a set of recovery tools, for simple, secure self-custody.</p>
      </div>
      <div class="case-study-item">
        <a href="https://peachbitcoin.com/" target="_blank">
          <img src="/img/case-studies-logos/peach-bitcoin-logo.png" />
        </a>
        <h3>
          <a href="https://peachbitcoin.com/" target="_blank">Peach Bitcoin</a>
        </h3>
        <p>Peach is a mobile application that connects Bitcoin buyers and sellers directly together. Buy or sell bitcoin peer-to-peer anywhere, at anytime. Use the payment method of your choice amongst many options. Sell at the price of your choice because peer-to-peer markets are the real markets.</p>
      </div>
      <div class="case-study-item">
        <a href="https://github.com/lightningdevkit/ldk-node" target="_blank">
          <img src="/img/case-studies-logos/ldk-node-logo.png" />
        </a>
        <h3>
          <a href="https://github.com/lightningdevkit/ldk-node" target="_blank">LDK Node</a> 
        </h3>
        <p>A ready-to-go Lightning node library built using LDK and BDK.</p>
      </div>
      <div class="case-study-item">
        <a href="https://play.google.com/store/apps/details?id=com.goldenraven.padawanwallet" target="_blank">
          <img src="/img/case-studies-logos/padawan-logo.png" />
        </a>
        <h3>
          <a href="https://play.google.com/store/apps/details?id=com.goldenraven.padawanwallet" target="_blank">Padawan Wallet</a>
        </h3>
        <p>Padawan is a testnet-only bitcoin wallet filled with tutorials on how to use bitcoin wallets. It is a self-study tool, acquainting users with mobile bitcoin wallets in a risk-free environment using the bitcoin testnet network. It is a perfect app for experimentation and learning for people of all ages. No accounts, no trackers, and the app is a free and open source project.</p>
      </div>
      <div class="case-study-item">
        <a href="https://www.mutinywallet.com/" target="_blank">
          <img src="/img/case-studies-logos/mutiny-logo.png" />
        </a>
        <h3>
          <a href="https://www.mutinywallet.com/" target="_blank">Mutiny Wallet</a>
        </h3>
        <p>Mutiny is a self-custodial lightning wallet that runs in the browser.</p>
      </div>
    </div>
  </template>

  <!-- <template v-slot:web>
    <div class="case-studies">
      <div class="case-study-item">
        <a href="https://bitcoindevkit.org" target="_blank">
          <img src="/img/bitcoindevkit.svg" />
        </a>
        <h3>
          <a href="https://bitcoindevkit.org" target="_blank">Example Web App</a>
        </h3>
        <p>A cool app built with BDK.</p>
      </div>
    </div>
  </template> -->

  <template v-slot:desktop>
    <div class="case-studies">
      <div class="case-study-item">
        <a href="https://www.anchorwatch.com/" target="_blank">
          <img src="/img/case-studies-logos/anchorwatch-logo.jpg" />
        </a>
        <h3>
          <a href="https://www.anchorwatch.com/" target="_blank">AnchorWatch</a>
        </h3>
        <p>Protect your bitcoin with regulated insurance and enterprise-grade multi-institutional custody.</p>
      </div>
    </div>
  </template>

  <template v-slot:hardware>
    <div class="case-studies">
      <div class="case-study-item">
        <a href="https://bitkey.build/" target="_blank">
          <img src="/img/case-studies-logos/block-logo.gif" />
        </a>
        <h3>
          <a href="https://bitkey.build/" target="_blank">Bitkey</a> 
        </h3>
        <p>Bitkey is the safe, easy way to own and manage bitcoin. It’s a mobile app, hardware device, and a set of recovery tools, for simple, secure self-custody.</p>
      </div>
    </div>
  </template>

  <template v-slot:custodial>
    <div class="case-studies">
      <div class="case-study-item">
        <a href="https://www.seba.swiss/" target="_blank">
          <img src="/img/case-studies-logos/seba-bank-logo.jpg" />
        </a>
        <h3>
          <a href="https://www.seba.swiss/" target="_blank">Seba Bank</a>
        </h3>
        <p>Merging traditional financial expertise with cutting-edge technology to shape the future of finance.</p>
      </div>
    </div>
  </template>

  <!-- <template v-slot:infra>
    <div class="case-studies">
      <div class="case-study-item">
        <a href="https://bitcoindevkit.org" target="_blank">
          <img src="/img/bitcoindevkit.svg" />
        </a>
        <h3>
          <a href="https://bitcoindevkit.org" target="_blank">Example Infrastructure App</a>
        </h3>
        <p>A cool app built with BDK.</p>
      </div>
    </div>
  </template> -->

  <!-- <template v-slot:misc>
    <div class="case-studies">
      <div class="case-study-item">
        <a href="https://bitcoindevkit.org" target="_blank">
          <img src="/img/bitcoindevkit.svg" />
        </a>
        <h3>
          <a href="https://bitcoindevkit.org" target="_blank">Example miscellaneous App</a>
        </h3>
        <p>A cool app built with BDK.</p>
      </div>
    </div>
  </template> -->

  <template v-slot:all>
    <div class="case-studies">
      <div class="case-study-item">
        <a href="https://bitkey.build/" target="_blank">
          <img src="/img/case-studies-logos/block-logo.gif" />
        </a>
        <h3>
          <a href="https://bitkey.build/" target="_blank">Bitkey</a> 
        </h3>
        <p>Bitkey is the safe, easy way to own and manage bitcoin. It’s a mobile app, hardware device, and a set of recovery tools, for simple, secure self-custody.</p>
      </div>
      <div class="case-study-item">
        <a href="" target="_blank">
          <img src="/img/case-studies-logos/peach-bitcoin-logo.png" style="width:100%;;aspect-ratio:1/1;object-fit: contain;" />
        </a>
        <h3>
          <a href="https://peachbitcoin.com/" target="_blank">Peach Bitcoin</a>
        </h3>
        <p>Peach is a mobile application that connects Bitcoin buyers and sellers directly together. Buy or sell bitcoin peer-to-peer anywhere, at anytime. Use the payment method of your choice amongst many options. Sell at the price of your choice because peer-to-peer markets are the real markets.</p>
      </div>
      <div class="case-study-item">
        <a href="https://www.anchorwatch.com/" target="_blank">
          <img src="/img/case-studies-logos/anchorwatch-logo.jpg" />
        </a>
        <h3>
          <a href="https://www.anchorwatch.com/" target="_blank">AnchorWatch</a>
        </h3>
        <p>Protect your bitcoin with regulated insurance and enterprise-grade multi-institutional custody.</p>
      </div>
      <div class="case-study-item">
        <a href="https://www.mutinywallet.com/" target="_blank">
          <img src="/img/case-studies-logos/mutiny-logo.png" />
        </a>
        <h3>
          <a href="https://www.mutinywallet.com/" target="_blank">Mutiny Wallet</a>
        </h3>
        <p>Mutiny is a self-custodial lightning wallet that runs in the browser.</p>
      </div>
      <div class="case-study-item">
        <a href="https://github.com/lightningdevkit/ldk-node" target="_blank">
          <img src="/img/case-studies-logos/ldk-node-logo.png" />
        </a>
        <h3>
          <a href="https://github.com/lightningdevkit/ldk-node" target="_blank">LDK Node</a> 
        </h3>
        <p>A ready-to-go Lightning node library built using LDK and BDK.</p>
      </div>
      <div class="case-study-item">
        <a href="https://play.google.com/store/apps/details?id=com.goldenraven.padawanwallet" target="_blank">
          <img src="/img/case-studies-logos/padawan-logo.png" />
        </a>
        <h3>
          <a href="https://play.google.com/store/apps/details?id=com.goldenraven.padawanwallet" target="_blank">Padawan Wallet</a>
        </h3>
        <p>Padawan is a testnet-only bitcoin wallet filled with tutorials on how to use bitcoin wallets. It is a self-study tool, acquainting users with mobile bitcoin wallets in a risk-free environment using the bitcoin testnet network. It is a perfect app for experimentation and learning for people of all ages. No accounts, no trackers, and the app is a free and open source project.</p>
      </div>
      <div class="case-study-item">
        <a href="https://www.seba.swiss/" target="_blank">
          <img src="/img/case-studies-logos/seba-bank-logo.jpg" />
        </a>
        <h3>
          <a href="https://www.seba.swiss/" target="_blank">Seba Bank</a>
        </h3>
        <p>Merging traditional financial expertise with cutting-edge technology to shape the future of finance.</p>
      </div>
    </div>
  </template>

</CodeSwitcher>
