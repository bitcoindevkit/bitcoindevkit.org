(window.webpackJsonp=window.webpackJsonp||[]).push([[68],{425:function(e,t,n){"use strict";n.r(t);var a=n(7),s=Object(a.a)({},(function(){var e=this,t=e._self._c;return t("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[t("p",[e._v("As a project designed to be used as a build tool in wallet development, one of\nthe main things that BDK provides is the coin selection module. The purpose of\nthe module is to select the group of utxos to use as inputs for the transaction.\nWhen you coin select you must consider cost, size and traceability.")]),e._v(" "),t("ul",[t("li",[t("p",[e._v("What are those costs?")]),e._v(" "),t("p",[e._v("Principally fees determined by the satisfaction size required by each of the\ninputs. But the costs are also related to the change outputs generated.\nChange outputs are not part of the inputs, but they must be considered during\ncoin selection because they affect the fee rate of the transaction and will\nbe used in future transactions as inputs.\nFor example, if you always create change outputs when you have some excess\nafter coin selecting, you'll probably end up with very small UTXOs. The\nsmaller the UTXO, the greater the proportion of fees spend to use that UTXO,\ndepending on the fee rate.")])]),e._v(" "),t("li",[t("p",[e._v('What do we mean by "size" considerations?')]),e._v(" "),t("p",[e._v('Here we are not referring to the size in MB of the transaction, as that is\naddressed by the associated fees.\nHere, "size" is the number of new UTXOs created by each transaction. It has a\ndirect impact on the size of the UTXO set maintained by each node.')])]),e._v(" "),t("li",[t("p",[e._v("What is this traceability thing?")]),e._v(" "),t("p",[e._v("Certain companies sell services whose purpose is to link address with their\nowners, harming the fungibility of some bitcoins and attacking the privacy of\nthe users.\nThere are some things that coin selection can do to make privacy leaking\nharder. For example, not creating change outputs, avoiding mixing UTXOs\nbelonging to different owned addresses in the same transaction, or the total\nexpenditure of the related utxos.")])])]),e._v(" "),t("p",[e._v("Besides the algorithm you use to coin select, which can target some of the\nthings described above, other code changes also have implications for them. The\nfollowing section will describe some of those changes and why they have been\ndone or could be added.")]),e._v(" "),t("h2",{attrs:{id:"waste"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#waste"}},[e._v("#")]),e._v(" Waste")]),e._v(" "),t("p",[e._v("One of my project changes for the "),t("code",[e._v("coin_selection")]),e._v(" module is the addition of\nthe "),t("code",[e._v("Waste")]),e._v(" metric, and its use to optimize the coin selection in relation to\nthe fee costs.")]),e._v(" "),t("p",[e._v("Waste is a metric introduced by the BnB algorithm as part of its bounding\nprocedure. Later, it was included as a high-level function to use in comparison\nof different coin selection algorithms in Bitcoin Core.")]),e._v(" "),t("h3",{attrs:{id:"how-it-works"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#how-it-works"}},[e._v("#")]),e._v(" How it works?")]),e._v(" "),t("p",[e._v("We can describe waste as the sum of two values: creation cost and timing cost.")]),e._v(" "),t("p",[e._v("Timing cost is the cost associated with the current fee rate and some long-term\nfee rate used as a threshold to consolidate UTXOs. It can be negative if the\ncurrent fee rate is cheaper than the long-term fee rate or zero if they are\nequal.")]),e._v(" "),t("p",[e._v("Creation cost is the cost associated with the surplus of coins besides the\ntransaction amount and transaction fees. It can happen in the form of a change\noutput or excessive fees paid to the miner.\nChange cost derives from the cost of adding the extra output to the transaction\nand spending it in the future.\nExcess happens when there is no change, and the surplus of coins is spent as\npart of the fees to the miner.")]),e._v(" "),t("p",[e._v("The creation cost can be zero if there is a perfect match as a result of the\ncoin selection algorithm.")]),e._v(" "),t("p",[e._v("So, waste can be zero or negative if the creation cost is zero and the timing\ncost is less than or equal to zero")]),e._v(" "),t("p",[e._v("You can read about the technical details in "),t("a",{attrs:{href:"https://github.com/bitcoindevkit/bdk/pull/558",target:"_blank",rel:"noopener noreferrer"}},[e._v("bdk PR 558"),t("OutboundLink")],1),e._v(". Comments and suggestions are\nwelcome!")]),e._v(" "),t("p",[e._v("But, while developing the proposal, some requirements to resolve first arose.\nLet's talk about them.")]),e._v(" "),t("h3",{attrs:{id:"what-has-been-done"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#what-has-been-done"}},[e._v("#")]),e._v(" What has been done")]),e._v(" "),t("p",[e._v("Waste is closely related to the creation of change or the drop of it as fees.\nFormerly, whether your selection would produce change or not, was decided\ninside the "),t("code",[e._v("create_tx")]),e._v(" function. From the perspective of the Waste metric, that\nwas problematic. How to score coin selection based on "),t("code",[e._v("Waste")]),e._v(" if you don't know\nyet if it will create change or not?")]),e._v(" "),t("p",[e._v("The problem had been pointed out before, in "),t("a",{attrs:{href:"https://github.com/bitcoindevkit/bdk/issues/147",target:"_blank",rel:"noopener noreferrer"}},[e._v("this issue"),t("OutboundLink")],1),e._v(".")]),e._v(" "),t("p",[e._v("The "),t("a",{attrs:{href:"https://github.com/bitcoindevkit/bdk/pull/630",target:"_blank",rel:"noopener noreferrer"}},[e._v("bdk PR 630"),t("OutboundLink")],1),e._v(" merged in "),t("a",{attrs:{href:"https://github.com/bitcoindevkit/bdk/releases/tag/v0.21.0",target:"_blank",rel:"noopener noreferrer"}},[e._v("release 0.21.0"),t("OutboundLink")],1),e._v(" moved change creation to the\n"),t("code",[e._v("coin_selection")]),e._v(" module. It introduced several changes:")]),e._v(" "),t("ul",[t("li",[e._v("the enum "),t("code",[e._v("Excess")]),e._v(".")]),e._v(" "),t("li",[e._v("the function "),t("code",[e._v("decide_change")]),e._v(".")]),e._v(" "),t("li",[e._v("a new field in "),t("code",[e._v("CoinSelectionResult")]),e._v(" to hold the "),t("code",[e._v("Excess")]),e._v(" produced while coin\nselecting.")])]),e._v(" "),t("p",[e._v("We hope to have chosen meaningful names for all these new additions, but lets\nexplain them in depth.")]),e._v(" "),t("p",[e._v("Formerly, when you needed to create change inside "),t("code",[e._v("create_tx")]),e._v(", you must get the\nweight of the change output, compute its fees and, jointly with the overall\nfee amount and the outgoing amount, subtract them from the remaining amount of\nthe selected utxos, then decide whether the amount of that output should be\nconsidered dust, and throw the remaining amount to fees in that case. Otherwise\nadd an extra output to the output list and sum their fees to the fee amount.\nAlso, there was the case when you wanted to sweep all the funds associated with\nan address, but the amount created a dust output. In that situation, the dust\nvalue of the output and the amount available after deducing the fees were\nnecessary to report an informative error to the user.")]),e._v(" "),t("p",[e._v("In general, the idea was to compute all those values inside "),t("code",[e._v("coin_selection")]),e._v("\nbut keep the decision logic where it was meaningful, that is, inside\n"),t("code",[e._v("create_tx")]),e._v(".")]),e._v(" "),t("p",[e._v("Those considerations ended up with an enum, "),t("code",[e._v("Excess")]),e._v(", with two struct variants\nthat differentiated the cases mentioned above, which carry all the needed\ninformation to act in each one of those cases.")]),e._v(" "),t("div",{staticClass:"language-rust extra-class"},[t("pre",{pre:!0,attrs:{class:"language-rust"}},[t("code",[t("span",{pre:!0,attrs:{class:"token comment"}},[e._v("/// Remaining amount after performing coin selection")]),e._v("\n"),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("pub")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("enum")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token type-definition class-name"}},[e._v("Excess")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("\n    "),t("span",{pre:!0,attrs:{class:"token comment"}},[e._v("/// It's not possible to create spendable output from excess using the current drain output")]),e._v("\n    "),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("NoChange")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("\n        "),t("span",{pre:!0,attrs:{class:"token comment"}},[e._v("/// Threshold to consider amount as dust for this particular change script_pubkey")]),e._v("\n        dust_threshold"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(":")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("u64")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v("\n        "),t("span",{pre:!0,attrs:{class:"token comment"}},[e._v("/// Exceeding amount of current selection over outgoing value and fee costs")]),e._v("\n        remaining_amount"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(":")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("u64")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v("\n        "),t("span",{pre:!0,attrs:{class:"token comment"}},[e._v("/// The calculated fee for the drain TxOut with the selected script_pubkey")]),e._v("\n        change_fee"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(":")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("u64")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v("\n    "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v("\n    "),t("span",{pre:!0,attrs:{class:"token comment"}},[e._v("/// It's possible to create spendable output from excess using the current drain output")]),e._v("\n    "),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("Change")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("\n        "),t("span",{pre:!0,attrs:{class:"token comment"}},[e._v("/// Effective amount available to create change after deducting the change output fee")]),e._v("\n        amount"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(":")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("u64")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v("\n        "),t("span",{pre:!0,attrs:{class:"token comment"}},[e._v("/// The deducted change output fee")]),e._v("\n        fee"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(":")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("u64")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v("\n    "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v("\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),e._v("\n")])])]),t("p",[e._v("The function "),t("code",[e._v("decide_change")]),e._v(" was created to build "),t("code",[e._v("Excess")]),e._v(". This function\nrequires the remaining amount after coin selection, the script that will be\nused to create the output and the fee rate aimed by the user.")]),e._v(" "),t("div",{staticClass:"language-rust extra-class"},[t("pre",{pre:!0,attrs:{class:"language-rust"}},[t("code",[t("span",{pre:!0,attrs:{class:"token comment"}},[e._v("/// Decide if change can be created")]),e._v("\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[e._v("///")]),e._v("\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[e._v("/// - `remaining_amount`: the amount in which the selected coins exceed the target amount")]),e._v("\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[e._v("/// - `fee_rate`: required fee rate for the current selection")]),e._v("\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[e._v("/// - `drain_script`: script to consider change creation")]),e._v("\n"),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("pub")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("fn")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token function-definition function"}},[e._v("decide_change")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),e._v("remaining_amount"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(":")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("u64")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v(" fee_rate"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(":")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("FeeRate")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v(" drain_script"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(":")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("&")]),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("Script")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("->")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("Excess")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("\n    "),t("span",{pre:!0,attrs:{class:"token comment"}},[e._v("// drain_output_len = size(len(script_pubkey)) + len(script_pubkey) + size(output_value)")]),e._v("\n    "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("let")]),e._v(" drain_output_len "),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("=")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token function"}},[e._v("serialize")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),e._v("drain_script"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[e._v("len")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("+")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token number"}},[e._v("8usize")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n    "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("let")]),e._v(" change_fee "),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("=")]),e._v(" fee_rate"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[e._v("fee_vb")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),e._v("drain_output_len"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n    "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("let")]),e._v(" drain_val "),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("=")]),e._v(" remaining_amount"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[e._v("saturating_sub")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),e._v("change_fee"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n\n    "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("if")]),e._v(" drain_val"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[e._v("is_dust")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),e._v("drain_script"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("\n        "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("let")]),e._v(" dust_threshold "),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("=")]),e._v(" drain_script"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[e._v("dust_value")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[e._v("as_sat")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("(")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(";")]),e._v("\n        "),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("Excess")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("::")]),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("NoChange")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("\n            dust_threshold"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v("\n            change_fee"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v("\n            remaining_amount"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v("\n        "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),e._v("\n    "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("else")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("\n        "),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("Excess")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("::")]),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("Change")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("\n            amount"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(":")]),e._v(" drain_val"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v("\n            fee"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(":")]),e._v(" change_fee"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v("\n        "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),e._v("\n    "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),e._v("\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),e._v("\n")])])]),t("p",[e._v("To pass this new value to "),t("code",[e._v("Wallet::create_tx")]),e._v(" and make decisions based on it,\nthe field "),t("code",[e._v("excess")]),e._v(" was added to the "),t("code",[e._v("CoinSelectionResult")]),e._v(", and the\n"),t("code",[e._v("coin_select")]),e._v(" methods of each algorithm were adapted to compute this value,\nusing "),t("code",[e._v("decide_change")]),e._v(" after performing the coin selection.")]),e._v(" "),t("div",{staticClass:"language-rust extra-class"},[t("pre",{pre:!0,attrs:{class:"language-rust"}},[t("code",[t("span",{pre:!0,attrs:{class:"token comment"}},[e._v("/// Result of a successful coin selection")]),e._v("\n"),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("pub")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("struct")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token type-definition class-name"}},[e._v("CoinSelectionResult")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("{")]),e._v("\n    "),t("span",{pre:!0,attrs:{class:"token comment"}},[e._v("/// List of outputs selected for use as inputs")]),e._v("\n    "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("pub")]),e._v(" selected"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(":")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("Vec")]),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v("<")]),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("Utxo")]),t("span",{pre:!0,attrs:{class:"token operator"}},[e._v(">")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v("\n    "),t("span",{pre:!0,attrs:{class:"token comment"}},[e._v("/// Total fee amount for the selected utxos in satoshis")]),e._v("\n    "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("pub")]),e._v(" fee_amount"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(":")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("u64")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v("\n    "),t("span",{pre:!0,attrs:{class:"token comment"}},[e._v("/// Remaining amount after deducing fees and outgoing outputs")]),e._v("\n    "),t("span",{pre:!0,attrs:{class:"token keyword"}},[e._v("pub")]),e._v(" excess"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(":")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[e._v("Excess")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(",")]),e._v("\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("}")]),e._v("\n")])])]),t("h3",{attrs:{id:"work-in-progress"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#work-in-progress"}},[e._v("#")]),e._v(" Work in progress")]),e._v(" "),t("p",[e._v("There remains unresolved the work to integrate the "),t("code",[e._v("Waste::calculate")]),e._v(" method\nwith the "),t("code",[e._v("CoinSelectionAlgorithm")]),e._v(" implementations and the "),t("code",[e._v("decide_change")]),e._v("\nfunction.")]),e._v(" "),t("p",[e._v("A step towards that goal would be the removal of the Database generic parameter\nfrom the "),t("code",[e._v("CoinSelectionAlgorithm")]),e._v(" trait. There isn't a clear way to make it, as\nyou may guess by this\n"),t("a",{attrs:{href:"https://github.com/bitcoindevkit/bdk/issues/281",target:"_blank",rel:"noopener noreferrer"}},[e._v("issue"),t("OutboundLink")],1),e._v(".\nThe only algorithm currently using the database features is\n"),t("code",[e._v("OldestFirstCoinSelection")]),e._v(".\nThere is a proposal to fix this problem by removing the need for a database\ntrait altogether, so, in the meanwhile, we could move the generic from the\ntrait to the "),t("code",[e._v("OldestFirstCoinSelection")]),e._v(", to avoid doing work that will probably\nbe disposed in the future.")]),e._v(" "),t("p",[e._v("Another step in that direction is a proposal to add a\n"),t("code",[e._v("CoinSelectionAlgorithm::process_and_select_coins")]),e._v(" wrapper to the coin\nselection module, which will join together preprocessing and validation of the\nutxos, coin selection, the decision to create change and the calculus of waste\nin the same function. The idea is to create a real pipeline to build a\n"),t("code",[e._v("CoinSelectionResult")]),e._v(".")]),e._v(" "),t("p",[e._v("In addition, the function will allow the separation of the algorithms\n"),t("code",[e._v("BranchAndBound")]),e._v(" and "),t("code",[e._v("SingleRandomDraw")]),e._v(" from each other, which were put\ntogether only by the dependence of the former on the second one as a fallback\nmethod.\nThat dependence will not be broken, but the possibility to use\n"),t("code",[e._v("SingleRandomDraw")]),e._v(" through BDK will be enabled, expanding the flexibility of\nthe library.")]),e._v(" "),t("p",[e._v("As a bonus, this function will save some parts of the code from unnecessary\ninformation, avoid code duplication (and all the things associated with it) and\nprovide a simple interface to integrate your custom algorithms with all the\nother functionalities of the BDK library, enhancing them through the new change\nprimitives and the computation of "),t("code",[e._v("Waste")]),e._v(".")]),e._v(" "),t("p",[e._v("You can start reviewing "),t("a",{attrs:{href:"https://github.com/bitcoindevkit/bdk/pull/727",target:"_blank",rel:"noopener noreferrer"}},[e._v("bdk PR 727"),t("OutboundLink")],1),e._v(" right now!")]),e._v(" "),t("h2",{attrs:{id:"further-improvements"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#further-improvements"}},[e._v("#")]),e._v(" Further Improvements")]),e._v(" "),t("p",[e._v("Besides the "),t("code",[e._v("Waste")]),e._v(" metric, there are other changes that could improve the\ncurrent state of the coin selection module in BDK, which will impact the\nprivacy and the flexibility provided by it.")]),e._v(" "),t("h3",{attrs:{id:"privacy"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#privacy"}},[e._v("#")]),e._v(" Privacy")]),e._v(" "),t("p",[e._v("In Bitcoin Core, the term "),t("code",[e._v("Output Group")]),e._v(" is associated with a structure that\njoins all the UTXOs belonging to a certain ScriptPubKey, up to a specified\nthreshold. The idea behind this is to reduce the address footprint in the\nblockchain, reducing traceability and improving privacy.\nIn BDK, OutputGroups are a mere way to aggregate metadata to UTXOs. But this\nstructure can be improved to something like what there is in Bitcoin, by\ntransforming the weighted utxos into a vector of them and adding a new field or\nparameter to control the amount stored in the vector.")]),e._v(" "),t("h3",{attrs:{id:"flexibility"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#flexibility"}},[e._v("#")]),e._v(" Flexibility")]),e._v(" "),t("p",[e._v("A further tweak in the UTXO structure could be the transition to traits, which\ndefine the minimal properties accepted by the algorithms to select the\nunderlying UTXOs.\nThe hope is that anyone can define new algorithms consuming any form of UTXO\nwrapper that you can imagine, as long as they follow the behavior specified by\nthose primitive traits.")]),e._v(" "),t("p",[e._v("Also, there is a major architectural change proposal called "),t("code",[e._v("bdk_core")]),e._v(" that\nwill refactor a lot of sections of BDK to improve its modularity and\nflexibility. If you want to know more, you can read the\n"),t("a",{attrs:{href:"https://bitcoindevkit.org/blog/bdk-core-pt1/",target:"_blank",rel:"noopener noreferrer"}},[e._v("blog post"),t("OutboundLink")],1),e._v(" about it or dig\ndirectly into its "),t("a",{attrs:{href:"https://github.com/LLFourn/bdk_core_staging",target:"_blank",rel:"noopener noreferrer"}},[e._v("prototype"),t("OutboundLink")],1),e._v(".")]),e._v(" "),t("h2",{attrs:{id:"conclusion"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#conclusion"}},[e._v("#")]),e._v(" Conclusion")]),e._v(" "),t("p",[e._v("A lot of work is coming to the coin selection module of BDK.\nAdding the "),t("code",[e._v("Waste")]),e._v(" metric will be a great step in the improvement of the coin\nselection features of the kit, and we hope to find new ways to measure the\nselection capabilities. We are open to new ideas!\nThe new changes range from refactorings to enhancements. It's not hard to find\nsomething to do in the project, as long as you spend some time figuring out how\nthe thing works. Hopefully, these new changes will make this task easier. And\nwe are ready to help anyone who needs it.\nIf you would like to improve something, request a new feature or discuss how\nyou would use BDK in your personal project, join us on\n"),t("a",{attrs:{href:"https://discord.gg/dstn4dQ",target:"_blank",rel:"noopener noreferrer"}},[e._v("Discord"),t("OutboundLink")],1),e._v(".")]),e._v(" "),t("h2",{attrs:{id:"acknowledgements"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#acknowledgements"}},[e._v("#")]),e._v(" Acknowledgements")]),e._v(" "),t("p",[e._v("Special thanks to my mentor "),t("a",{attrs:{href:"https://github.com/danielabrozzoni",target:"_blank",rel:"noopener noreferrer"}},[e._v("Daniela Brozzoni"),t("OutboundLink")],1),e._v(" for the support and help provided\nduring the development of the above work, and to "),t("a",{attrs:{href:"https://github.com/notmandatory",target:"_blank",rel:"noopener noreferrer"}},[e._v("Steve Myers"),t("OutboundLink")],1),e._v(",\nfor the final review of this article.")]),e._v(" "),t("p",[e._v("Thanks to all BDK contributors for their reviews and comments and thanks to the\nBitcoin community for the open source work that made this an enjoyable learning\nexperience.")]),e._v(" "),t("p",[e._v("Finally, thanks to the "),t("a",{attrs:{href:"https://www.summerofbitcoin.org/",target:"_blank",rel:"noopener noreferrer"}},[e._v("Summer of Bitcoin"),t("OutboundLink")],1),e._v(" organizers, sponsors and speakers for\nthe wonderful initiative, and all the guide provided.")]),e._v(" "),t("h2",{attrs:{id:"references"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#references"}},[e._v("#")]),e._v(" References")]),e._v(" "),t("h3",{attrs:{id:"about-coin-selection-considerations"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#about-coin-selection-considerations"}},[e._v("#")]),e._v(" About coin selection considerations")]),e._v(" "),t("ul",[t("li",[e._v('Jameson Lopp. "The Challenges of Optimizing Unspent Output Selection"\n'),t("em",[e._v("Cypherpunk Cogitations")]),e._v(".\n"),t("a",{attrs:{href:"https://blog.lopp.net/the-challenges-of-optimizing-unspent-output-selection/",target:"_blank",rel:"noopener noreferrer"}},[e._v("https://blog.lopp.net/the-challenges-of-optimizing-unspent-output-selection/"),t("OutboundLink")],1)])]),e._v(" "),t("h3",{attrs:{id:"about-waste-metric"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#about-waste-metric"}},[e._v("#")]),e._v(" About Waste metric")]),e._v(" "),t("ul",[t("li",[e._v('Murch. "What is the Waste Metric?" '),t("em",[e._v("Murch ado about nothing")]),e._v(".\n"),t("a",{attrs:{href:"https://murch.one/posts/waste-metric/",target:"_blank",rel:"noopener noreferrer"}},[e._v("https://murch.one/posts/waste-metric/"),t("OutboundLink")],1)]),e._v(" "),t("li",[e._v('Andrew Chow. "wallet: Decide which coin selection solution to use based on\nwaste metric" '),t("em",[e._v("Bitcoin Core")]),e._v(". "),t("a",{attrs:{href:"https://github.com/bitcoin/bitcoin/pull/22009",target:"_blank",rel:"noopener noreferrer"}},[e._v("https://github.com/bitcoin/bitcoin/pull/22009"),t("OutboundLink")],1)]),e._v(" "),t("li",[e._v('Bitcoin Core PR Review Club. "Decide which coin selection solution to use\nbased on waste metric". '),t("em",[e._v("Bitcoin Core PR Review Club")]),e._v(".\n"),t("a",{attrs:{href:"https://bitcoincore.reviews/22009",target:"_blank",rel:"noopener noreferrer"}},[e._v("https://bitcoincore.reviews/22009"),t("OutboundLink")],1)])]),e._v(" "),t("h3",{attrs:{id:"about-improving-privacy-in-coin-selection"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#about-improving-privacy-in-coin-selection"}},[e._v("#")]),e._v(" About improving privacy in coin selection")]),e._v(" "),t("ul",[t("li",[e._v('Josi Bake. "wallet: avoid mixing different OutputTypes during coin selection"\n'),t("em",[e._v("Bitcoin Core")]),e._v(". "),t("a",{attrs:{href:"https://github.com/bitcoin/bitcoin/pull/24584",target:"_blank",rel:"noopener noreferrer"}},[e._v("https://github.com/bitcoin/bitcoin/pull/24584"),t("OutboundLink")],1)]),e._v(" "),t("li",[e._v('Bitcoin Core PR Review Club. "Increase OUTPUT_GROUP_MAX_ENTRIES to 100"\n'),t("em",[e._v("Bitcoin Core PR Review Club")]),e._v(". "),t("a",{attrs:{href:"https://bitcoincore.reviews/18418",target:"_blank",rel:"noopener noreferrer"}},[e._v("https://bitcoincore.reviews/18418"),t("OutboundLink")],1)]),e._v(" "),t("li",[e._v('Bitcoin Core PR Review Club. "Avoid mixing different '),t("code",[e._v("OutputTypes")]),e._v(' during\ncoin selection" '),t("em",[e._v("Bitcoin Core PR Review Club")]),e._v(".\n"),t("a",{attrs:{href:"https://bitcoincore.reviews/24584",target:"_blank",rel:"noopener noreferrer"}},[e._v("https://bitcoincore.reviews/24584"),t("OutboundLink")],1)])]),e._v(" "),t("h3",{attrs:{id:"about-bdk-core"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#about-bdk-core"}},[e._v("#")]),e._v(" About "),t("code",[e._v("bdk_core")])]),e._v(" "),t("ul",[t("li",[e._v('Lloyd Fournier. "bdk_core: a new architecture for the Bitcoin Dev Kit".\n'),t("em",[e._v("bitcoindevkit blog")]),e._v(". "),t("a",{attrs:{href:"https://bitcoindevkit.org/blog/bdk-core-pt1/",target:"_blank",rel:"noopener noreferrer"}},[e._v("https://bitcoindevkit.org/blog/bdk-core-pt1/"),t("OutboundLink")],1)])])])}),[],!1,null,null,null);t.default=s.exports}}]);