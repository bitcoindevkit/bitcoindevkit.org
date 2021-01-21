---
title: "Fee estimation for light-clients (Part 1)"
description: ""
author: "Riccardo Casatta"
date: "2021-01-21"
tags: ["fee", "machine learning"]
hidden: true
draft: false
---

This post is part 1 of 3 of a series. ([Part 2], [Part 3])

- [Introduction: what is fee estimation?](#introduction-what-is-fee-estimation)
- [The problem](#the-problem)
    + [The challenges and the solution](#the-challenges-and-the-solution)
    + [The question](#the-question)
    + [The data logger](#the-data-logger)

## Introduction: what is fee estimation?

Fee estimation is the process of selecting the fee rate[^fee rate] for a bitcoin transaction being created, according to two main factors:

* The current congestion of the Bitcoin network.
* The urgency, or lack thereof, for the transaction confirmation, i.e, its inclusion in a block.

A fee rate should be adequate to the above factors: a fee too high would be a waste of money, because the same result could have been achieved with a lower expense. On the other end, a fee rate too low would wait for a confirmation longer than planned or, even worse, could not be confirmed at all.

## The problem

Bitcoin Core offers fee estimation through the [`estimatesmartfee`] RPC method, and there are also a lot of third-party [fee estimators] online, so do we need yet another estimator?

The model used by Bitcoin Core is not well suited for light-clients such as mobile wallets, even when running in pruned mode. Online estimators are lacking in terms of:

* Privacy: Contacting the server leaks your IP (unless you are using Tor or a VPN), and the request timing may be used to correlate the request to a transaction broadcasted to the network soon thereafter.
* Security: A malicious estimator could provide a high fee rate leading to a waste of money, or a low fee rate hampering the transaction confirmation.

Replace By Fee (RBF) and Child Pays For Parent (CPFP) are techniques that can somewhat minimize the fee estimation problem, because one could simply underestimate the fee rate and then raise it when necessary, however:
* RBF and CPFP may leak more information, such as patterns that may allow to detect the kind of wallet used, or which one of the transaction outputs is the change.
* Requires additional interaction: the client must come back "online" to perform the fee bump. Sometimes this might be impractical or risky, for instance when using an offline signer or a multisignature with geographically distributed keys.

Thus, this work is an effort to build a **good fee estimator for purely peer to peer light clients** such as [neutrino] based ones, or at least determine whether the approach we take is infeasible and open the discussion
for other, better, models.

In the meantime, another sub-goal is pursued: attract the interest of data scientists; Indeed the initial step for this analysis consists in constructing a data set, which could also also help kickstart other studies on fee
esimation or, more broadly, the Bitcoin mempool.

#### The challenges and the solution

The hardest part of doing fee estimation on a light client is the lack of information: for example, Bitcoin Core's `estimatesmartfee` uses up to the last 1008 blocks and knows everything about the mempool[^mempool], such as
the fee rate of every transaction it contains, but a light-client does not.

Also, there are other factors that may help doing fee estimation, such as the day of the week (the mempool usually empties during the [weekend]) or the time of the day to anticipate recurring daily events
(such as the batch of [bitmex withdrawals]).

The idea is to apply Machine Learning (ML) techniques[^disclaimer] to discover patterns over what a light-client knows and see if they are enough to achieve consistently good estimations.

#### The question

We are going to use a DNN (Deep Neural Network), a ML technique in the supervised learning branch. The "ELI5" is: give a lot of example inputs and the desired output to a black box; if there are correlations between inputs and outputs,
and there are enough examples, the black box will eventually start predicting the correct output even with inputs it has never seen before.

To define our inputs and outputs, we need to start from the question we want to answer. For a fee estimator this is:

*"Which fee rate should I use if I want this transaction to be confirmed in at most `n` blocks?"*

This can be translated to a table with many rows like:

confirms_in | other_informations | fee_rate
-|-|-
1|...|100.34
2|...| 84.33
10|...| 44.44

where the `fee_rate` column is the output we want, also called the "*target*" or "*label*" in ML terminology, and the other columns are our inputs.

Can we build this table just by looking at the Bitcoin blockchain? Unfortunately, we can't:
The main thing that's missing is an indication of when the node first saw a transaction that has been later confirmed in a block. With that knowledge we can say that the fee-rate of that transaction was the exact value required to confirm
within the number of blocks it actually took to be confirmed. For instance, if we see transaction `t` when the blockchain is at height `1000` and then we notice that `t` has been included in block `1006`, we can deduce that the
fee-rate paid by `t` was the exact value required to get confirmed within the next `6` blocks.

So to build our model, we first need to gather this data, and machine learning needs a *lot* of data to work well.

#### The data logger

The [data logger] is built with the purpose of collecting all the data we need, and it's MIT licensed open source software written in Rust.

We need to register the moment in time when transactions enter in the node's mempool; to be efficient and precise we should not only call the RPC endpoints but listen to [ZMQ] events. Luckily, the just released bitcoin core 0.21.0 added a new [ZMQ] topic `zmqpubsequence` notifying mempool events (and block events). The logger is also listening to `zmqpubrawtx` and `zmqpubrawblock` topics, to make less RPC calls.

We are not only interested in the timestamp of the transaction entering the mempool, but also how many blocks it will take until the same transaction is confirmed.
In the final dataset this field is called `confirms_in`[^blocks target]; if `confirms_in = 1` it means the transaction is confirmed in the first block created after it has been seen for the first time.

Another critical piece of information logged by the data logger is the `fee_rate` of the transaction, since the absolute fee value paid by a bitcoin transaction is not available nor derivable given only the transaction itself, as the inputs don't have explicit amounts.

All this data (apart from the time of the transaction entering in the mempool) can actually be reconstructed simply by looking at the blockchain. However, querying the bitcoin node can be fairly slow, and during the model training iterations we want to recreate the ML dataset rapidly[^fast], for example whenever we need to modify or add a new field.

For these reasons, the logger is split into two parts: a process listening to the events sent by our node, which creates raw logs, and then a second process that uses these logs to create the final CSV dataset.
Raw logs are self-contained: for example, they contain all the previous transaction output values for every relevant transaction. This causes some redundancy, but in this case it's better to trade some efficiency for more performance
when recreating the dataset.

![High level graph](/images/high-level-graph.svg)

My logger instance started collecting data on the 18th of December 2020, and as of today (18th January 2020), the raw logs are about 14GB.

I expect (or at least hope) the raw logs will be useful also for other projects as well, like monitoring the propagation of transactions or other works involving raw mempool data. We will share raw logs data through torrent soon.

In the following [Part 2] we are going to talk about the dataset.

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
