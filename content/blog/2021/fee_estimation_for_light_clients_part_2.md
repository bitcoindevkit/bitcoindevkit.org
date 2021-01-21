---
title: "Fee estimation for light-clients (Part 2)"
description: ""
author: "Riccardo Casatta"
date: "2021-01-21"
tags: ["fee", "machine learning"]
hidden: true
draft: false
---

This post is part 2 of 3 of a series. ([Part 1], [Part 3])

- [The dataset](#the-dataset)
    + [The mempool](#the-mempool)
    + [The outliers](#the-outliers)
    + [Recap](#recap)

## The dataset

The [dataset] is publicly available (~400MB gzip compressed, ~1.6GB as plain CSV).

The output of the model is the fee rate, expressed in `[satoshi/vbytes]` **TODO: missing link??**.

What about the inputs? Generally speaking, we have two main requirements for what can be included as input for our model:

* It must be correlated to the output, even with a non-linear relation.
* It must be available to a light client: for instance, assuming to have knowledge and an index of the last 1000 blocks is considered too much.

To evaluate the approach we are taking, we also want to compare our model's results with another available estimation: for this reason the dataset includes data to compute the error agains Bitcoin Core's `estimatesmartfee` results, though we are not going to use it for this model.

The dataset will contain only transactions that spend already confirmed inputs. If we wanted to include transactions with unconfirmed inputs as well, the fee rate would have to be computed as a whole;
for example if transaction `t2` spends an unconfirmed input from `t1` (while `t1` only spends confirmed inputs, and all its other outputs are unspent), the aggregated fee rate would have to be used.
Supposing `f()` is extracts the absolute fee and `w()` the transaction weight, the aggregated fee rate would be `(f(t1) + f(t2)) / (w(t1) + w(t2))`. Thus, as already said previously, to keep things simple the model simply discards all the transaction
that would need to perform this computation.

For the same reason the dataset has the `parent_in_cpfp` flag. When a transaction has inputs confirmed (so it's not excluded by the previous rule) but one or more of its output have been spent by a transaction confirmed in the same block, `parent_in_cpfp` is `1`.
Transactions with `parent_in_cpfp = 1` are included in the dataset but excluded by the current model, since the miner probably considered an aggregated fee rate while picking the transactions to build a block.

#### The mempool

The most important input of our model is the current *status* of the mempool itself. However, we cannot feed the model with a list of the fee rate of every unconfirmed transaction, because this array would have a variable length.
To overcome this, the transaction contained in the mempool are grouped in "buckets" which are basically subsets of the mempool where all the transactions contained in a bucket have a similar fee rate. In particular we only care about the
*number* of transaction in every *bucket*, not which transactions it contains.

The mempool buckets array is defined by two parameters, the `percentage_increment` and the `array_max` value.
Supposing to choose the mempool buckets array to have parameters `percentage_increment = 50%` and `array_max = 500.0 sat/vbytes` the buckets would be constructed like so:

bucket | bucket min fee rate | bucket max fee rate
-|-|-
a0|1.0|1.5 = min*(1+`percentage_increment`)
a1|1.5 = previous max|2.25
a2|2.25| 3.375
...|...|...
a15|437.89|inf

The array stops at `a15` because `a16` would have a bucket min greater than `array_max`.

We previously stated this model is for light-client such as [neutrino] based ones. In these clients the mempool is already available (it's needed to check for received transactions) but the problem is we can't compute fee rates of this transactions because previous confirmed inputs are not in the mempool!

Luckily, **thanks to temporal locality [^temporal locality], an important part of mempool transactions spend outputs created very recently**, for example in the last 6 blocks.
The blocks are available through the p2p network, and downloading the last 6 is considered a good compromise between resource consumption and accurate prediction. We need the model to be built with the same data available in the prediction phase, as a consequence the mempool data in the dataset refers only to transactions having their inputs in the last 6 blocks. However the `bitcoin-csv` tool inside the [data logger] allows to configure this parameter.

#### The outliers

Another information the dataset contain is the block percentile fee rate, considering `r_i` to be the rate of the `ith` transaction in a block, `q_k` is the fee rate value such that for each transaction in a block `r_i` < `q_k` returns the `k%` transactions in the block that are paying lower fees.

Percentiles are not used to feed the model but to filter some outliers tx.
Removing this observations is controversial at best and considered cheating at worse. However, it should be considered that bitcoin core `estimatesmartfee` doesn't even bother to give estimation for the next block, we think this is due to the fact that many transactions that are confirming in the next block are huge overestimation [^overestimation], or clearly errors like [this one] we found when we started logging data.
These outliers are a lot for transactions confirming in the next block (`confirms_in=1`), less so for `confirms_in=2`, mostly disappeared for `confirms_in=3` or more. It's counterintuitive that overestimation exist for `confirms_in>1`, by definition an overestimation is a fee rate way higher than needed, so how is possible that an overestimation doesn't enter the very next block? There are a couple of reasons why a block is discovered without containing a transaction with high fee rate:
* network latency: my node saw the transaction but the miner didn't see that transaction yet,
* block building latency: the miner saw the transaction, but didn't finish to rebuild the block template or decided it's more efficient to finish a cycle on the older block template.

To keep the model balanced, when overestimation is filtered out, underestimation are filtered out as well. This also has the effect to remove some of the transactions possibly included because a fee is payed out-of-band.
Another reason to filter transactions is that the dataset is over-represented by transactions with low `confirms_in`: more than 50% of transactions get confirmed in the next block, so we think it's good to filter some of these transactions.

The applied filters are the following:

confirms_in|lower|higher
-|-|-
1|q45|q55
2|q30|q70
3|q1|q99

Not yet convinced by the removal of these outliers? The [dataset] contains all the observations, make your model :)

#### Recap

column | used in the model | description
-|-|-
txid | no | Transaction hash, useful for debugging
timestamp | converted | The time when the transaction has been added in the mempool, in the model is used in the form `day_of_week` and `hour`
current_height | no | The blockchain height seen by the node in this moment
confirms_in | yes | This transaction confirmed at block height `current_height+confirms_in`
fee_rate | target | This transaction fee rate measured in `[sat/vbytes]`
fee_rate_bytes | no | fee rate in satoshi / bytes, used to check bitcoin core `estimatesmartfee` predictions
block_avg_fee | no | block average fee rate `[sat/vbytes]` of block `current_height+confirms_in`
core_econ | no | bitcoin `estimatesmartfee` result for `confirms_in` block target and in economic mode. Could be not available `?` when a block is connected more recently than the estimation has been requested, estimation are requested every 10 secs.
core_cons | no | Same as above but with conservative mode
mempool_len | no | Sum of the mempool transaction with fee rate available (sum of every `a*` field)
parent_in_cpfp | no | It's 1 when the transaction has outputs that are spent in the same block in which the transaction is confirmed (they are parent in a CPFP relations).
q1-q30-... | no | Transaction confirming fast could be outliers, usually paying a lot more than required, this percentiles are used to filter those transactions,
a1-a2-... | yes | Contains the number of transaction in the mempool with known fee rate in the ith bucket.


![The good, the bad and the ugly](/images/the-good-the-bad-the-ugly.jpg)
<div align="center">My biological neural network fired this, I think it's because a lot of chapters start with "The"</div>
<br/><br/>

In the previous [Part 1] we talked about the problem.

In the following [Part 3] we are going to talk about the model.

[^fee rate]: The transaction fee rate is the ratio between the absolute fee expressed in satoshi, over the weight of the transaction measured in virtual bytes. The weight of the transaction is similar to the byte size, however a part of the transaction (the segwit part) is discounted, their byte size is considered less because it creates less burden for the network.
[^mempool]: mempool is the set of transactions that are valid by consensus rules (for example, they are spending existing bitcoin), broadcasted in the bitcoin peer to peer network, but they are not yet part of the blockchain.
[^temporal locality]: In computer science temporal locality refers to the tendency to access recent data more often than older data.
[^disclaimer]: DISCLAIMER: I am not an expert data-scientist!
[^MAE]: MAE is Mean Absolute Error, which is the average of the series built by the absolute difference between the real value and the estimation.
[^drift]: drift like MAE, but without the absolute value
[^minimum relay fee]: Most node won't relay transactions with fee lower than the min relay fee, which has a default of `1.0`
[^blocks target]: Conceptually similar to bitcoin core `estimatesmartfee` parameter called "blocks target", however, `confirms_in` is the real value not the desired target.
[^fast]: 14GB of compressed raw logs are processed and a compressed CSV produced in about 4 minutes.

[Part 1]: /blog/2021/01/fee-estimation-for-light-clients-part-1/
[Part 2]: /blog/2021/01/fee-estimation-for-light-clients-part-2/
[Part 3]: /blog/2021/01/fee-estimation-for-light-clients-part-3/
[`estimatesmartfee`]: https://bitcoincore.org/en/doc/0.20.0/rpc/util/estimatesmartfee/
[core]: https://bitcoincore.org/
[bitmex withdrawals]: https://b10c.me/mempool-observations/2-bitmex-broadcast-13-utc/
[fee estimators]: https://b10c.me/blog/003-a-list-of-public-bitcoin-feerate-estimation-apis/
[neutrino]: https://github.com/bitcoin/bips/blob/master/bip-0157.mediawiki
[weekend]: https://www.blockchainresearchlab.org/2020/03/30/a-week-with-bitcoin-transaction-timing-and-transaction-fees/
[ZMQ]: https://github.com/bitcoin/bitcoin/blob/master/doc/zmq.md
[data logger]: https://github.com/RCasatta/bitcoin_logger
[this one]: https://blockstream.info/tx/33291156ab79e9b4a1019b618b0acfa18cbdf8fa6b71c43a9eed62a849b86f9a
[dataset]: https://storage.googleapis.com/bitcoin_log/dataset_17.csv.gz
[google colab notebook]: https://colab.research.google.com/drive/1yamwh8nE4NhmGButep-pfUT-1uRKs49a?usp=sharing
[plain python]: https://github.com/RCasatta/
[example]: https://www.tensorflow.org/tutorials/keras/regression
[tune hyperparameters]: https://www.tensorflow.org/tutorials/keras/keras_tuner
[advice]: https://www.tensorflow.org/tutorials/keras/overfit_and_underfit#demonstrate_overfitting
[introducing neural network video]: https://youtu.be/aircAruvnKk?t=1035
[gradient descent]: https://en.wikipedia.org/wiki/Gradient_descent#:~:text=Gradient%20descent%20is%20a%20first,the%20direction%20of%20steepest%20descent.
[latest trend]: https://towardsdatascience.com/adam-latest-trends-in-deep-learning-optimization-6be9a291375c
[exponential decay]: https://www.tensorflow.org/api_docs/python/tf/compat/v1/train/exponential_decay
[prediction test tool]: https://github.com/RCasatta/estimate_ml_fee
[bdk]: https://github.com/bitcoindevkit/bdk
[Square crypto]: https://squarecrypto.org/
[get stuck]: https://github.com/RCasatta/bitcoin_logger/blob/master/notes.md
[hashed feature columns]: https://www.tensorflow.org/tutorials/structured_data/feature_columns#hashed_feature_columns
[tensorflow]: https://www.tensorflow.org/
[TFRecord format]: https://www.tensorflow.org/tutorials/load_data/tfrecord
[Leonardo Comandini]: https://twitter.com/LeoComandini
[Domenico Gabriele]: https://twitter.com/domegabri
[Alekos Filini]: https://twitter.com/afilini
[Ferdinando Ametrano]: https://twitter.com/Ferdinando1970
[I]: https://twitter.com/RCasatta
