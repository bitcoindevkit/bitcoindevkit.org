(window.webpackJsonp=window.webpackJsonp||[]).push([[50],{402:function(e,t,n){"use strict";n.r(t);var a=n(7),o=Object(a.a)({},(function(){var e=this,t=e._self._c;return t("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[t("p",[e._v("The bitcoindevkit team has been hard at work for Q3 in 2024, polishing the API of our "),t("code",[e._v("bdk_wallet")]),e._v(" crate and releasing 4 new beta versions (1, 2, 3, and 4!), and aiming to release a final 1.0 release by the end of 2024. Here are some of the notable changes and upgrades to the software libraries we maintain:")]),e._v(" "),t("ul",[t("li",[t("strong",[e._v("RBF by default on TxBuilder.")]),e._v(" The transaction builder in BDK will now signal RBF by default.")]),e._v(" "),t("li",[t("strong",[e._v("New wallet builder API.")]),e._v(" The new wallet builder offers flexibility and ease-of-development for future features. We've also been listening to user feedback, and brought back support for single-descriptor wallets.")]),e._v(" "),t("li",[t("strong",[e._v("MVP of the Book of BDK.")]),e._v(" We are working on a high-level documentation website for BDK libraries called the Book of BDK. The MVP website is live at "),t("a",{attrs:{href:"https://bookofbdk.com/",target:"_blank",rel:"noopener noreferrer"}},[e._v("bookofbdk.com"),t("OutboundLink")],1),e._v(".")]),e._v(" "),t("li",[t("strong",[e._v("Bug chasing and optimizations.")]),e._v(" As feedback from early testers comes in, we are keeping a close eye on reported bugs and questions, and have been fixing a ton of smaller but very important snags!")]),e._v(" "),t("li",[t("strong",[e._v("Development of a CBF client crate and related bindings.")]),e._v(" Work is ongoing on a crate to allow BDK users to interoperate with a new CBF library called "),t("a",{attrs:{href:"https://github.com/rustaceanrob/kyoto",target:"_blank",rel:"noopener noreferrer"}},[e._v("Kyoto"),t("OutboundLink")],1),e._v(". Work has been done to integrate this with the language bindings for mobile users, and the preliminary integrations have been very positive.")])]),e._v(" "),t("p",[e._v("The language bindings for iOS, Android, and Python have also seen some new beta releases and a ton of new features, in preparation for the 1.0 final release.")]),e._v(" "),t("ul",[t("li",[t("strong",[e._v("Exposing a much larger number of Wallet APIs.")]),e._v(" The Wallet type in the language bindings now exposes most of what users will need for a 1.0 release.")]),e._v(" "),t("li",[t("strong",[e._v("Rework of the Kotlin and Swift build systems.")]),e._v(" We have migrated the build workflows for bdk-jvm and bdk-android from Gradle scripts to shell scripts, making them easier to parse and consume for contributors and other libraries wanting to leverage our approach to bindings. We have also made it much easier to build the Swift package for iOS users.")]),e._v(" "),t("li",[t("strong",[e._v("Testing of Compact Block Filters for both Android and iOS.")]),e._v(" Both our wallet examples have full examples of using the new "),t("a",{attrs:{href:"https://github.com/rustaceanrob/kyoto",target:"_blank",rel:"noopener noreferrer"}},[e._v("Kyoto"),t("OutboundLink")],1),e._v(" client on mobile phones. Once the PR for the new client lands, users will have access to clear examples on how to leverage the new client!")]),e._v(" "),t("li",[t("strong",[e._v("Building bitcoin-ffi.")]),e._v(" The team has been working on a crate called "),t("a",{attrs:{href:"https://github.com/bitcoindevkit/bdk-ffi",target:"_blank",rel:"noopener noreferrer"}},[e._v("bitcoin-ffi"),t("OutboundLink")],1),e._v(", migrating the types we exposed from rust-bitcoin into a standalone crate that other projects building on uniffi can use. We have been stress-testing this in production and are finding new ways to leverage this approach.")])]),e._v(" "),t("h3",{attrs:{id:"our-grantees-in-action"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#our-grantees-in-action"}},[e._v("#")]),e._v(" Our Grantees in Action")]),e._v(" "),t("p",[e._v("Full-time grants changes:")]),e._v(" "),t("ul",[t("li",[e._v("Our lead Rust developer Evan is moving to a part-time grant while he goes and works for a company that leverages BDK!\nIn addition to our full-time grantees, the "),t("a",{attrs:{href:"https://bitcoindevkit.org/foundation/",target:"_blank",rel:"noopener noreferrer"}},[e._v("BDK Foundation"),t("OutboundLink")],1),e._v(" provides part-time grants to folks on special projects. Q3 is funding 2 projects in particular:")]),e._v(" "),t("li",[t("strong",[e._v("Leonardo.")]),e._v(" "),t("a",{attrs:{href:""}},[e._v("Leo")]),e._v("'s been working on our integration of the Tor Rust client into the Electrum and Esplora crates.")]),e._v(" "),t("li",[t("strong",[e._v("Rob.")]),e._v(" "),t("a",{attrs:{href:""}},[e._v("Rob")]),e._v(" is the brain behind the "),t("a",{attrs:{href:""}},[e._v("Kyoto")]),e._v(" client, its BDK integration with "),t("code",[e._v("bdk_kyoto")]),e._v(", and the PR to wrap it all up into our language bindings!")]),e._v(" "),t("li",[t("strong",[e._v("Wei Chen.")]),e._v(" "),t("a",{attrs:{href:"https://github.com/LagginTimes",target:"_blank",rel:"noopener noreferrer"}},[e._v("Wei"),t("OutboundLink")],1),e._v(" is continuing his work on the lower-level BDK crates "),t("code",[e._v("bdk_chain")]),e._v(" and "),t("code",[e._v("bdk_core")]),e._v(", as well as his work on the Electrum client.")])]),e._v(" "),t("p",[e._v("We've also been active at conferences!")]),e._v(" "),t("ul",[t("li",[e._v("Steve "),t("a",{attrs:{href:"https://www.youtube.com/watch?v=Qlbwxbe7xHE",target:"_blank",rel:"noopener noreferrer"}},[e._v("was on a panel at the 2024 Bitcoin Conference"),t("OutboundLink")],1),e._v(" discussing with 2 teams that are building on BDK.")]),e._v(" "),t("li",[e._v('The team was in Nashville for a week of hard work and collaboration between devs in the Rust bitcoin ecosystem we called the "Rust Bitcoin Summit". The event was so successful we\'re hoping to do it again next year! Here is a link to a '),t("a",{attrs:{href:"https://serve.podhome.fm/episodepage/CitadelDispatch/cd136-rust-bitcoin-summit-with-poelstra-harding-myers-corallo-and-more",target:"_blank",rel:"noopener noreferrer"}},[e._v("Citadel Dispatch podcast"),t("OutboundLink")],1),e._v(" with some of the devs who hosted and participated.")])]),e._v(" "),t("h3",{attrs:{id:"bdk-in-the-wild"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#bdk-in-the-wild"}},[e._v("#")]),e._v(" BDK in the Wild")]),e._v(" "),t("p",[e._v("In Q3, a number of new projects have started using BDK:")]),e._v(" "),t("ul",[t("li",[e._v("The Protonmail team has released the latest tool in the Proton family: the "),t("a",{attrs:{href:"https://proton.me/blog/proton-wallet-launch",target:"_blank",rel:"noopener noreferrer"}},[e._v("Proton Bitcoin Wallet App"),t("OutboundLink")],1),e._v(". The wallet is using the 1.0 beta version of the library. Welcome aboard Proton!")]),e._v(" "),t("li",[e._v("The "),t("a",{attrs:{href:""}},[e._v("bark Ark implementation")]),e._v(" started using the BDK beta releases for its wallet implementation.")]),e._v(" "),t("li",[t("a",{attrs:{href:"https://bitcoin-safe.org/",target:"_blank",rel:"noopener noreferrer"}},[e._v("Bitcoin Safe"),t("OutboundLink")],1),e._v(" released its first beta release.")]),e._v(" "),t("li",[t("a",{attrs:{href:"https://www.satsails.com/",target:"_blank",rel:"noopener noreferrer"}},[e._v("Satsails"),t("OutboundLink")],1),e._v(" is now live on the Play Store!")]),e._v(" "),t("li",[t("a",{attrs:{href:"https://www.stratabtc.org/",target:"_blank",rel:"noopener noreferrer"}},[e._v("Strata"),t("OutboundLink")],1),e._v(" has released a devnet version of their CLI wallet, which uses BDK.")]),e._v(" "),t("li",[e._v("Our BDK Swift Example Wallet is "),t("a",{attrs:{href:"https://testflight.apple.com/join/A3nAuYvZ",target:"_blank",rel:"noopener noreferrer"}},[e._v("now available on iOS Testflight"),t("OutboundLink")],1),e._v("!")])])])}),[],!1,null,null,null);t.default=o.exports}}]);