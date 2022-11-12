---
title: "Improving coin selection in BDK"
description: "A brief description of the work done in the coin selection module in BDK during Summer of Bitcoin 2022"
date: "2022-08-17"
tags: ["coin selection", "BDK", "development", "summer of bitcoin"]
authors:
  - "César Alvarez Vallero"
hidden: true
draft: false
---

As a project designed to be used as a build tool in wallet development, one of
the main things that BDK provides is the coin selection module. The purpose of
the module is to select the group of utxos to use as inputs for the transaction.
When you coin select you must consider cost, size and traceability.

- What are those costs?

  Principally fees determined by the satisfaction size required by each of the
  inputs. But the costs are also related to the change outputs generated.
  Change outputs are not part of the inputs, but they must be considered during
  coin selection because they affect the fee rate of the transaction and will
  be used in future transactions as inputs.
  For example, if you always create change outputs when you have some excess
  after coin selecting, you'll probably end up with very small UTXOs. The
  smaller the UTXO, the greater the proportion of fees spend to use that UTXO,
  depending on the fee rate.

- What do we mean by "size" considerations?

  Here we are not referring to the size in MB of the transaction, as that is
  addressed by the associated fees.
  Here, "size" is the number of new UTXOs created by each transaction. It has a
  direct impact on the size of the UTXO set maintained by each node.

- What is this traceability thing?

  Certain companies sell services whose purpose is to link address with their
  owners, harming the fungibility of some bitcoins and attacking the privacy of
  the users.
  There are some things that coin selection can do to make privacy leaking
  harder. For example, not creating change outputs, avoiding mixing UTXOs
  belonging to different owned addresses in the same transaction, or the total
  expenditure of the related utxos.

Besides the algorithm you use to coin select, which can target some of the
things described above, other code changes also have implications for them. The
following section will describe some of those changes and why they have been
done or could be added.

## Waste

One of my project changes for the `coin_selection` module is the addition of
the `Waste` metric, and its use to optimize the coin selection in relation to
the fee costs.

Waste is a metric introduced by the BnB algorithm as part of its bounding
procedure. Later, it was included as a high-level function to use in comparison
of different coin selection algorithms in Bitcoin Core.

### How it works?

We can describe waste as the sum of two values: creation cost and timing cost.

Timing cost is the cost associated with the current fee rate and some long-term
fee rate used as a threshold to consolidate UTXOs. It can be negative if the
current fee rate is cheaper than the long-term fee rate or zero if they are
equal.

Creation cost is the cost associated with the surplus of coins besides the
transaction amount and transaction fees. It can happen in the form of a change
output or excessive fees paid to the miner.
Change cost derives from the cost of adding the extra output to the transaction
and spending it in the future.
Excess happens when there is no change, and the surplus of coins is spent as
part of the fees to the miner.

The creation cost can be zero if there is a perfect match as a result of the
coin selection algorithm.

So, waste can be zero or negative if the creation cost is zero and the timing
cost is less than or equal to zero

You can read about the technical details in [bdk PR 558](https://github.com/bitcoindevkit/bdk/pull/558). Comments and suggestions are
welcome!

But, while developing the proposal, some requirements to resolve first arose.
Let's talk about them.

### What has been done

Waste is closely related to the creation of change or the drop of it as fees.
Formerly, whether your selection would produce change or not, was decided
inside the `create_tx` function. From the perspective of the Waste metric, that
was problematic. How to score coin selection based on `Waste` if you don't know
yet if it will create change or not?

The problem had been pointed out before, in [this issue](https://github.com/bitcoindevkit/bdk/issues/147).

The [bdk PR 630](https://github.com/bitcoindevkit/bdk/pull/630) merged in [release 0.21.0](https://github.com/bitcoindevkit/bdk/releases/tag/v0.21.0) moved change creation to the
`coin_selection` module. It introduced several changes:

- the enum `Excess`.
- the function `decide_change`.
- a new field in `CoinSelectionResult` to hold the `Excess` produced while coin
selecting.

We hope to have chosen meaningful names for all these new additions, but lets
explain them in depth.

Formerly, when you needed to create change inside `create_tx`, you must get the
weight of the change output, compute its fees and, jointly with the overall
fee amount and the outgoing amount, subtract them from the remaining amount of
the selected utxos, then decide whether the amount of that output should be
considered dust, and throw the remaining amount to fees in that case. Otherwise
add an extra output to the output list and sum their fees to the fee amount.
Also, there was the case when you wanted to sweep all the funds associated with
an address, but the amount created a dust output. In that situation, the dust
value of the output and the amount available after deducing the fees were
necessary to report an informative error to the user.

In general, the idea was to compute all those values inside `coin_selection`
but keep the decision logic where it was meaningful, that is, inside
`create_tx`.

Those considerations ended up with an enum, `Excess`, with two struct variants
that differentiated the cases mentioned above, which carry all the needed
information to act in each one of those cases.

```rust
/// Remaining amount after performing coin selection
pub enum Excess {
    /// It's not possible to create spendable output from excess using the current drain output
    NoChange {
        /// Threshold to consider amount as dust for this particular change script_pubkey
        dust_threshold: u64,
        /// Exceeding amount of current selection over outgoing value and fee costs
        remaining_amount: u64,
        /// The calculated fee for the drain TxOut with the selected script_pubkey
        change_fee: u64,
    },
    /// It's possible to create spendable output from excess using the current drain output
    Change {
        /// Effective amount available to create change after deducting the change output fee
        amount: u64,
        /// The deducted change output fee
        fee: u64,
    },
}
```

The function `decide_change` was created to build `Excess`. This function
requires the remaining amount after coin selection, the script that will be
used to create the output and the fee rate aimed by the user.

```rust
/// Decide if change can be created
///
/// - `remaining_amount`: the amount in which the selected coins exceed the target amount
/// - `fee_rate`: required fee rate for the current selection
/// - `drain_script`: script to consider change creation
pub fn decide_change(remaining_amount: u64, fee_rate: FeeRate, drain_script: &Script) -> Excess {
    // drain_output_len = size(len(script_pubkey)) + len(script_pubkey) + size(output_value)
    let drain_output_len = serialize(drain_script).len() + 8usize;
    let change_fee = fee_rate.fee_vb(drain_output_len);
    let drain_val = remaining_amount.saturating_sub(change_fee);

    if drain_val.is_dust(drain_script) {
        let dust_threshold = drain_script.dust_value().as_sat();
        Excess::NoChange {
            dust_threshold,
            change_fee,
            remaining_amount,
        }
    } else {
        Excess::Change {
            amount: drain_val,
            fee: change_fee,
        }
    }
}
```

To pass this new value to `Wallet::create_tx` and make decisions based on it,
the field `excess` was added to the `CoinSelectionResult`, and the
`coin_select` methods of each algorithm were adapted to compute this value,
using `decide_change` after performing the coin selection.

```rust
/// Result of a successful coin selection
pub struct CoinSelectionResult {
    /// List of outputs selected for use as inputs
    pub selected: Vec<Utxo>,
    /// Total fee amount for the selected utxos in satoshis
    pub fee_amount: u64,
    /// Remaining amount after deducing fees and outgoing outputs
    pub excess: Excess,
}
```


### Work in progress

There remains unresolved the work to integrate the `Waste::calculate` method
with the `CoinSelectionAlgorithm` implementations and the `decide_change`
function.

A step towards that goal would be the removal of the Database generic parameter
from the `CoinSelectionAlgorithm` trait. There isn't a clear way to make it, as
you may guess by this
[issue](https://github.com/bitcoindevkit/bdk/issues/281).
The only algorithm currently using the database features is
`OldestFirstCoinSelection`.
There is a proposal to fix this problem by removing the need for a database
trait altogether, so, in the meanwhile, we could move the generic from the
trait to the `OldestFirstCoinSelection`, to avoid doing work that will probably
be disposed in the future.

Another step in that direction is a proposal to add a
`CoinSelectionAlgorithm::process_and_select_coins` wrapper to the coin
selection module, which will join together preprocessing and validation of the
utxos, coin selection, the decision to create change and the calculus of waste
in the same function. The idea is to create a real pipeline to build a
`CoinSelectionResult`.

In addition, the function will allow the separation of the algorithms
`BranchAndBound` and `SingleRandomDraw` from each other, which were put
together only by the dependence of the former on the second one as a fallback
method.
That dependence will not be broken, but the possibility to use
`SingleRandomDraw` through BDK will be enabled, expanding the flexibility of
the library.

As a bonus, this function will save some parts of the code from unnecessary
information, avoid code duplication (and all the things associated with it) and
provide a simple interface to integrate your custom algorithms with all the
other functionalities of the BDK library, enhancing them through the new change
primitives and the computation of `Waste`.

You can start reviewing [bdk PR 727](https://github.com/bitcoindevkit/bdk/pull/727) right now!

## Further Improvements

Besides the `Waste` metric, there are other changes that could improve the
current state of the coin selection module in BDK, which will impact the
privacy and the flexibility provided by it.

### Privacy

In Bitcoin Core, the term `Output Group` is associated with a structure that
joins all the UTXOs belonging to a certain ScriptPubKey, up to a specified
threshold. The idea behind this is to reduce the address footprint in the
blockchain, reducing traceability and improving privacy.
In BDK, OutputGroups are a mere way to aggregate metadata to UTXOs. But this
structure can be improved to something like what there is in Bitcoin, by
transforming the weighted utxos into a vector of them and adding a new field or
parameter to control the amount stored in the vector.

### Flexibility

A further tweak in the UTXO structure could be the transition to traits, which
define the minimal properties accepted by the algorithms to select the
underlying UTXOs.
The hope is that anyone can define new algorithms consuming any form of UTXO
wrapper that you can imagine, as long as they follow the behavior specified by
those primitive traits.

Also, there is a major architectural change proposal called `bdk_core` that
will refactor a lot of sections of BDK to improve its modularity and
flexibility. If you want to know more, you can read the
[blog post](https://bitcoindevkit.org/blog/bdk-core-pt1/) about it or dig
directly into its [prototype](https://github.com/LLFourn/bdk_core_staging).

## Conclusion

A lot of work is coming to the coin selection module of BDK.
Adding the `Waste` metric will be a great step in the improvement of the coin
selection features of the kit, and we hope to find new ways to measure the
selection capabilities. We are open to new ideas!
The new changes range from refactorings to enhancements. It's not hard to find
something to do in the project, as long as you spend some time figuring out how
the thing works. Hopefully, these new changes will make this task easier. And
we are ready to help anyone who needs it.
If you would like to improve something, request a new feature or discuss how
you would use BDK in your personal project, join us on
[Discord](https://discord.gg/dstn4dQ).

## Acknowledgements

Special thanks to my mentor [Daniela Brozzoni](https://github.com/danielabrozzoni) for the support and help provided
during the development of the above work, and to [Steve Myers](https://github.com/notmandatory),
for the final review of this article.

Thanks to all BDK contributors for their reviews and comments and thanks to the
Bitcoin community for the open source work that made this an enjoyable learning
experience.

Finally, thanks to the [Summer of Bitcoin](https://www.summerofbitcoin.org/) organizers, sponsors and speakers for
the wonderful initiative, and all the guide provided.

## References

### About coin selection considerations
- Jameson Lopp. "The Challenges of Optimizing Unspent Output Selection"
  _Cypherpunk Cogitations_.
  [https://blog.lopp.net/the-challenges-of-optimizing-unspent-output-selection/](https://blog.lopp.net/the-challenges-of-optimizing-unspent-output-selection/)

### About Waste metric
- Murch. "What is the Waste Metric?" _Murch ado about nothing_.
  [https://murch.one/posts/waste-metric/](https://murch.one/posts/waste-metric/)
- Andrew Chow. "wallet: Decide which coin selection solution to use based on
  waste metric" _Bitcoin Core_. [https://github.com/bitcoin/bitcoin/pull/22009](https://github.com/bitcoin/bitcoin/pull/22009)
- Bitcoin Core PR Review Club. "Decide which coin selection solution to use
  based on waste metric". _Bitcoin Core PR Review Club_.
  [https://bitcoincore.reviews/22009](https://bitcoincore.reviews/22009)

### About improving privacy in coin selection
- Josi Bake. "wallet: avoid mixing different OutputTypes during coin selection"
  _Bitcoin Core_. [https://github.com/bitcoin/bitcoin/pull/24584](https://github.com/bitcoin/bitcoin/pull/24584)
- Bitcoin Core PR Review Club. "Increase OUTPUT_GROUP_MAX_ENTRIES to 100"
  _Bitcoin Core PR Review Club_. [https://bitcoincore.reviews/18418](https://bitcoincore.reviews/18418)
- Bitcoin Core PR Review Club. "Avoid mixing different `OutputTypes` during
  coin selection" _Bitcoin Core PR Review Club_.
  [https://bitcoincore.reviews/24584](https://bitcoincore.reviews/24584)

### About `bdk_core`
- Lloyd Fournier. "bdk_core: a new architecture for the Bitcoin Dev Kit".
  _bitcoindevkit blog_. [https://bitcoindevkit.org/blog/bdk-core-pt1/](https://bitcoindevkit.org/blog/bdk-core-pt1/)

