---
title: "Fee estimations for light-clients"
description: ""
author: "Riccardo Casatta"
date: "2021-01-18"
tags: ["rust", "fee", "machine learning"]
hidden: true
draft: false
---

## Introduction: what's fee estimation?

Fee estimation is the process of selecting the fee rate for a bitcoin transaction according to two factors:

* Current traffic of the Bitcoin network
* The urgency, or lack of urgency, of the sender to see the transaction confirmed in a block.

Selecting a too high fee rate could mean losing money because we may obtain the exact same thing (confirm in the same block) with a lower expense.

Selecting a too low fee rate could mean waiting a long time before the transaction confirms, or even worse, never see the transaction confirmed.

## The problem

Bitcoin core node offers fee estimation through the RPC method `estimatesmartfee`, there are also a lot of [estimators] online, so why we need yet another estimator?

Bitcoin core model is not suitable for light-clients such as mobile wallets, even in pruned mode. Online estimators are bad because:

* Privacy: Asking something to a server could leak the caller ip, if using tor, the timing is an information leak because it could relate to a transaction made soon after.
* Security: A compromised source of fee rates could provide too high fee rates causing loss of money or too low ones causing tx to never confirm.

Replace By Fee (RBF) and Child Pay For Parents (CPFP) are techniques minimizing the fee estimation problem, because one could simply under-estimate fee rate and raise if needed, however:
* RBF and CPFP may leak more information, such as detecting patterns that may leak the wallet used.
* Requires some level of interaction, requiring the client to be online again to perform the fee bump. Sometimes this could be very costly such in a context with offline signer.

So this work is an effort to build a **good fee estimator for purely peer to peer light clients** such as [neutrino] based ones or determine it is infeasible.

In the meantime, two other sub-goals are pursued:

* I want to share what I learned while tackling this problem
* I would like to attract data-scientist interest, I hope this is just the beginning as you will see while reading and in the big "Futures development" section.

## The difficulties and the solution?

The difficult part in doing fee estimation on a light client is the lack of information available, for example, bitcoin core `estimatesmartfee` use up to the last 1008 blocks and has full information about the mempool [^1], such as the fee rate of every one of these transactions but a light-client cannot rely on all this information.

However, other factors are available and may help in fee estimation, such as the day of the week since it's well-known the mempool usually empties during the [weekend]. Or the hour of the day to predict recurring daily events such as [bitmex withdrawals].

The idea is to apply Machine Learning (ML) techniques [^2] to discover patterns over this informations and see if they are enough to achieve good estimations.

However this creates another problem, machine learning needs data, a lot of data to work well, is this information available?

## The question and the needed data

We are going to use a DNN (Deep Neural Network) an ML technique in the supervised learning branch, the ELI5 is: give a lot of example inputs with the desired output to a black box, if there are relations between inputs and outputs, and if there are enough examples, the black box will give predicted output to inputs it has never seen before.

To understand what's our input and outputs, we need the question we want to answer. The question a fee estimator need to answer is:

*"Which fee rate should I use if I want this transaction to be confirmed in at most `n` blocks?"*

So we need a table with many rows like:

confirms_in | other_informations | fee_rate
-|-|-
1|...|100.34
2|...| 84.33
10|...| 44.44

where the `fee_rate` column is the output we want, called the `target` or `label` in ML terminology and the other columns are our inputs.

Is this data already available in the blockchain? Unfortunately, it isn't.
What's basically missing is when the node first saw a transaction that has been confirmed in a block. With hindsight, the fee-rate of that transaction is the exact value that was needed.

To have a model, we need the data.

## The data logger

The [data logger] is MIT licensed open source software written in Rust.

We need to save the time transactions enter in the node's mempool, to be more efficient and precise we should not call only the RPC endpoints but listen to [ZMQ] events. Luckily just released bitcoin core 0.21.0 added a new [ZMQ] topic `zmqpubsequence` [notifying] mempool events (and block events). The logger is also listening to `zmqpubrawtx` and `zmqpubrawblock` topics, to make less RPC calls.

Other than the time, we save other data for several reasons, in the end, we are not interested only in the timestamp of the transaction when enters the mempool, but more importantly, how many blocks will pass until this transaction is confirmed. In the final dataset this field is called `confirms_in`, if `1` it means the transaction is confirmed in the next block after it has been seen. This is a reason to save blocks in the raw logs (to see when a seen tx gets confirmed).

Another critical information is the `fee_rate` of the transaction, since the absolute fee value of the fee paid by a bitcoin transaction is not available nor derivable from only the transaction itself, we need the transaction's previous outputs values.

All this information (apart from the moment the transaction enter in the mempool) is recoverable from the blockchain, however, querying the bitcoin node could take a while, and I want to be able to recreate the ML dataset fast while iterating on the model training for example with different fields.

For these reasons, the logger is split into two parts, a process listening to the node which creates raw-logs, and another process that uses this log to create the dataset data. Raw logs are self-contained, for example, they contain any previous transaction output values of relevant txs, this causes some redundancy, but it's needed to recompute the dataset fast.

![High level graph](/images/high-level-graph.svg)

My logger instance started collecting data on the 18th of December 2020, and as of today (18th January 2020), raw logs are about 14GB.

I expect and hope raw logs will be useful also for other projects, for example, to monitor transactions propagation or other works involving mempool data, I will share raw logs data through torrent soon.

## The dataset

The [dataset] is publicly available (~400MB gzip compressed, ~1.6GB as plain CSV).

The output of the model, is clear and it's the fee rate, expressed in `[satoshi/vbytes]`.

What about the inputs? In general we want two things:

* Something that it's correlated to the output, even with a non-linear relation.
* It must be available in a light client, for example supposing to have the informations regarding the last 1000 blocks is considered too much.

We want to compare model results with another available estimation, thus we have also data to compute bitcoin core `estimatesmartfee` errors, but we are not going to use this data for the model.

The dataset will contain only transaction with already confirmed inputs. To consider transactions with unconfirmed inputs the fee rate should be computed as a whole, for example if transaction `t2` has an unconfirmed input coming from `t1` outputs (`t1` has all confirmed inputs) and all unspent outputs, a unique fee rate of the two txs is to consider. Supposing `f()` is the absolute fee and `w()` is tx weight, the fee rate is `(f(t1)+f(t2))/(w(t1)+w(t2))`. At the moment the model simply discard this txs for complexity reasons.

For similar reasons there is the flag `parent_in_cpfp`. When a tx has inputs confirmed (so it's not excluded by previous rule) but 1 or more of its output has been spent in the same block, `parent_in_cpfp` it's 1.
Transactions with `parent_in_cpfp=1` are included in the dataset but excluded by current model, since the miner considered a merged fee rate of the 2 to build the block.

#### The mempool

The most important information come from the mempool status, however, we cannot feed the model with a list of mempool txs fee rate because this array has a variable length. To overcome this the mempool is converted in buckets which basically are counter of transactions with a fee rate in a specific range. The mempool buckets is defined by two parameters, the percentage increment and the max value.
Supposing to choose the mempool bucket to have parameter `50%` and `500.0 sat/vbytes` the buckets are like the following

bucket | min fee rate | max fee rate
-|-|-
a0|1.0|1.5 = min*(1+increment)
a1|1.5 = previous max|2.25
a2|2.25| 3.375
...|...|...
a15|437.89|inf

We previously stated this model is for light-client such as [neutrino] based ones, on this clients the mempool is already available (it's needed to check for receiving tx) but the problem is we can't compute fee rates of this transactions because previous confirmed inputs are not in the mempool!

Luckily, **thanks to temporal locality, an important part of mempool transactions spend outputs created very recently**, for example in the last 6 blocks.
The blocks are available trough the p2p network, and downloading the last 6 is considered a good compromise between resource consumption and accurate prediction. We need the model to be built with the same data available in the prediction phase, as a consequence the mempool data in the dataset refers only to txs having their inputs in the last 6 blocks. However the `bitcoin-csv` tool inside the [data logger] allows to change this parameter from command line.

#### The outliers

Another information the dataset contain is the block percentile fee rate, considering `r_i` to be the rate of the `ith` tx in a block, `q_k` is the fee rate value such that for each tx in a block `r_i` < `q_k` returns the `k%` txs in the block that are paying lower fees.

Percentiles are not used to feed the model but to filter some outliers tx.
Removing this observations is controversial at best and considered cheating at worse. However, it should be considered bitcoin core `estimatesmartfee` doesn't even bother to give estimation for the next block, I think because of the many txs that are confirming in the next block are huge overestimation, or clear errors like [this one] I found when I started logging data.
This outliers are a lot for txs confirming in the next block (`confirms_in=1`), less so for 2, mostly disappeared for 3 or more. It's counterintuitive overestimation exist for `confirms_in=2`, how it's possible an overestimation doesn't enter the very next block? The reason for that is network latency, the miner didn't see that tx yet, or block building latency, the miner saw the tx, but decided it's not efficient to rebuild the block template yet.

To keep the model balanced, when over-estimation are filtered out, simmetrycally under-estimation are filtered out too. This also has the effect to remove some txs that are included because fee is payed out-of-band.
Another reason to filter txs, is that the dataset is over-represented by txs with low `confirms_in`, like more tha 50% of txs confirms in the next block, so I think it's good to filter some of this txs

The filters applied are the followings:

confirms_in|lower|higher
-|-|-
1|q45|q55
2|q30|q70
3|q1|q99

Not yet convinced to remove this outliers? The [dataset] contains all the observations, make your model :)

#### Recap

column | used in the model | description
-|-|-
txid | no | Transaction hash, useful for debugging purpose to check correctness
timestamp | converted |The moment when the tx has been added in the mempool, in the model is used in the form `day_of_week` and `hour`
current_height | no |The blockchain height seen by the node in this moment
confirms_in | yes | This tx confirms at block height `current_height+confirms_in`
fee_rate | target | This tx fee rate measured in `[sat/vbytes]`
fee_rate_bytes | no | fee rate in satoshi / bytes, used to check bitcoin core `estimatesmartfee` predictions
block_avg_fee | no | block average fee rate `[sat/vbytes]` of block `current_height+confirms_in`
core_econ | no | bitcoin estimate smart fee result for `confirms_in` block target and in economic mode. Could be not available `?` when a block is connected more recently than the estimation has been requested, estimation are requested every 10 secs.
core_cons | no | same as previos but with conservative mode
mempool_len | no | sum of the mempool tx wit fee rate available (sum of every `a*` field)
parent_in_cpfp | no | it's 1 when the tx has outputs that are spent in the same block as the tx is confirmed (they are parent in a CPFP relations).
q1-q30-... | no | Tx confirming fast could be outliers, usually paying a lot more than required, this percentiles are used to filter those txs,
a1-a2-... | yes | contains the number of tx in the mempool with known fee rate in the ith bucket.


![The good, the bad and the ugly](/images/the-good-the-bad-the-ugly.jpg)
<div align="center">My biological neural network fired this, I think it's because a lot of chapters start with "The"</div>


## The model

The code building and training the model with [tensorflow] is available in [google colab notebook] (jupyter notebook), you can also download the file as plain python and execute locally. About 30 minutes are needed to train the model, but heavily depends on hardware available.

![graph confirm_in blocks vs fee_rate](/images/20210115-111008-confirms_in-fee_rate.png)
<div align="center">Tired to read and want a couple simple statement? In the last month a ~50 sat/vbyte tx never took more than a day to confirm and a ~5 sat/vbyte never took more than a week</div><br/>

As a reference, in the code we have a calculation of the bitcoin core `estimatesmartfee` MAE [^3] and drift [^4], note this are `[satoshi/bytes]` (not virtual bytes).
MAE is computed as `avg(abs(fee_rate_bytes - core_econ))` when `core_econ` is available (about 1.2M observations, sometime the value is not available when considered too old)


estimatesmartfee mode | MAE [satoshi/bytes] | drift
-|-|-
economic| 35.22 | 29.76
conservative | 54.28 | 53.13

As I said in the introduction, network traffic is correlated with time and we have the timestamp of when the transaction has been first seen, however a ML model doesn't like too much plain numbers, but it behaves better with "number that repeats", like categories, so we are converting the timestamp in `day_of_week` a number from 0 to 6, and `hours` a number from 0 to 24.

#### Splitting

The dataset is splitted in training and test data with a 80/20 proportion. As the name suggest the training part is used to train the model, the test is composed of other observations to test if the model is good with observations that has never seen (proving the model can generalize, not just memorizing the answer).

During the training the data is splitted again in 80/20 for training and validation respectively, validation is basically testing during training.

During splitting dataset is converted from a pandas data frame to tensorflow dataset, decreasing training times.

#### Preprocessing

Pre-processing phase is part of the model however it contains transformations without parameters trained by the model.
This transformations are useful because model trains better if data are in some format, and having this phase inside the model helps to avoid to prepare the data before feeding the model at prediction phase.

Our model perform 2 kind of preprocessing

* Normalization: model trains faster if numerical features have mean 0 and standard deviation equal to 1, so this layer is built by computing the `mean` and `std` from the series of a feature before training, and the model is feed with `(feature - mean)/std`. Our model normalize `confirms_in` feature and all the buckets `a*`

* one-hot vector: Numerical categories having a small number of different unique values like our `day_of_week` and `hours` could be trained better/faster by being converted in one hot vector. For example `day_of_week=6` (Sunday) is converted in a vector `['0', '0', '0', '0', '0', '0', '1']` while `day_of_week=5` (Saturday) is converted in the vector `['0', '0', '0', '0', '0', '1', '0']`

#### Build

```python3
all_features = tf.keras.layers.concatenate(encoded_features)
x = tf.keras.layers.Dense(64, activation="relu")(all_features)
x = tf.keras.layers.Dense(64, activation="relu")(x)
output = tf.keras.layers.Dense(1, activation=clip)(x)
model = tf.keras.Model(all_inputs, output)
optimizer = tf.optimizers.Adam(learning_rate=0.01)
model.compile(loss='mse',
              optimizer=optimizer,
              metrics=['mae', 'mse'])
```

![model graph](/images/20210115-111008-model.png)

The model is fed with the `encoded_features` coming from the processing phase, then there are 2 layers with 64 neurons each followed by one neuron giving the `fee_rate` as output.

With this configurations the model has:
* Total params: `7,412`
* Trainable params: `7,361`
* Non-trainable params: `51`

Non-trainable params comes from the normalization layer and are computed in the pre-processing phase (it contains, for example, the mean of a series). Trainable parameters are values initialized randomly and changed during the training phase. The trainable parameters are `7,361`, this number comes from the following, every neuron has an associated bias and a weight for every element in the inputs, thus:

```shell
(48 input_values_weights + 1 bias) * (64 first_layer_neurons)
+ (64 input_values_weights + 1 bias) * (64 second layer neurons)
+ (64 input values weights + 1 bias)

49*64+65*64+ = 7361
```

Honestly, about the neural network parameters, they are mostly the one taken from this tensorflow [example], I even tried to [tune hyperparameters], however, I preferred, for now, to take this [advise]: *"The simplest way to prevent overfitting is to start with a small model:"*. I hope this work will attract expert data-scientist to this bitcoin problem, improving the model, and also, I think a longer time for the data collection is needed to capture various situations.

A significant part of a ML model are the activation functions, `relu` (Rectified Linear Unit) is one of the most used lately, because it's simple and works well as I learned in this [introducing neural network video]. `relu` it's equal to zero for negative values and equal to the input for positive values. Being non-linear allows the whole model to be non-linear.

For the last layer it's different, we want to enforce a minimum for the output, which is the minimum relay fee `1.0` [^5]. One could not simply cut the output of the model after prediction because all the training would not consider this constraint. So we need to build a custom activation function on which the model training will be able to use for the [gradient descent] optimization step. Luckily is very simple using tensorflow primitives:

```
def clip(x):
  min = tf.constant(1.0)
  return tf.where(tf.less(x, min), min, x)
```

Another important part is the optimizer, when I first read the aforementioned [example] the optimizer used was `RMSProp` however the example updated lately and I noticed the optimizer changed in favor of `Adam` which I read is the [latest trend] in data science. I changed the model to use `Adam` and effectively the training is faster with `Adam` and even slightly less error is achieved.
The important part is the learning rate parameter which I set to `0.01` after manual trials, however there are some possible maybe-improvement such as using [exponential decay], starting with high learning rate and decreasing it through training epochs.

The last part of the model configuration is the loss function, the objective of the training is to find the minimum of this function. Usually for regression problem (the ones having a number as output, not a category) the most used is the Mean squared error (MSE). MSE is measured as the average of squared difference between predictions and actual observations, giving larger penalties to large difference because of the square. An interesting property is that the bigger the error the faster the changes is good at the beginning of the training, while slowing down when the model predicts better is desirable to avoid "jumping out" the local minimum.

#### Finally, training

```
PATIENCE = 20
MAX_EPOCHS = 200

def train():
  early_stop = keras.callbacks.EarlyStopping(monitor='val_loss', patience=PATIENCE)
  history = model.fit(train_ds, epochs=MAX_EPOCHS, validation_data=val_ds, verbose=1, callbacks=[early_stop])
  return history

history = train()
```

This steps is the core of the neural network, it takes a while, let's analyze the output:

```
Epoch 1/200
5617/5617 [==============================] - 40s 6ms/step - loss: 546.4828 - mae: 16.7178 - mse: 546.4828 - val_loss: 297.0464 - val_mae: 11.4745 - val_mse: 297.0464
...
Epoch 198/200
5617/5617 [==============================] - 38s 6ms/step - loss: 147.4738 - mae: 7.8188 - mse: 147.4738 - val_loss: 147.7298 - val_mae: 7.7628 - val_mse: 147.7298
```

Training is done in epochs, under every epoch all the training data is iterated and model parameters updated to minimize the loss function.

The number `5617` represent the number of steps. Theoretically the whole training data should be processed at once and parameters updated accordingly, however in practice this is infeasible for example for memory resource, thus the training happens in batch. In our case we have `1,437,841` observations in the training set and our batch size is `256`, thus we have `1,437,841/256=5616.56` which by excess result in `5617` steps.

The `40s` is the time it takes to process the epoch on google colab (my threadripper cpu takes `20s`, but GPU or TPU could do better).

The value `loss` is the MSE on the training data while `val_loss` is the MSE value on the validation data. As far as I understand the separated validation data helps to detect the machine learning enemy, overfitting. Because in case of overfitting the value `loss` continue to improve (almost indefinitely) while `val_loss` start improving with the loss but a certain point diverge, indicating the network is memorizing the training data to improve `loss` but in doing so losing generalizing capabilities.

Our model doesn't look to suffer overfitting cause `loss` and `val_loss` doesn't diverge during training

![train history](/images/20210115-111008-train-history.png)

While we told the training to do 200 epochs, the training stopped at 198 because we added an `early_stop` call back with `20` as  `PATIENCE`, meaning that after 20 epoch and no improvement in `val_loss` the training is halted, saving time and potentially avoiding overfitting.

## The prediction phase

A [prediction test tool] is available on github. At the moment it uses a bitcoin core node to provide network data for simplicity, but it queries it only for the mempool and the last 6 blocks, so it's something that also a light-client could do.

The following chart is probably the best visualization to evaluate the model, on the x axis there is the real fee rate while on the y axis there is the prediction, the more the points are centered on the bisection, the more the model is good.
We can see the model is doing quite well, the MAE is 8 which is way lower than `estimatesmartfee`. However, there are big errors some times, in particular for prediction for low blocks target as shown by the orange points. Creating a model only for blocks target greater than 2 instead of simply remove some observations may be an option.

![prediction results](/images/20210115-111008-true-and-predictions.png)

The following chart is instead a distribution of the errors, which for good model should resemble the normal distribution centered in 0, and it loooks like the model is respecting that.

![error distribution](/images/20210115-111008-error-distribution.png)

## Conclusion and future development

I think results have shown deep neural network are a tool capable to estimate bitcoin transactions fees with good results and more work should be spent in this area.

This is just a starting point, there are many future improvements such as:

* Build a separate model with full knowledge, thus for full, always-connected nodes could be interesting and improve network resource allocation in comparison with current estimator.
* Tensorflow is a huge dependency, and since it contains all the feature to build and train a model, most of the feature are not needed in the prediction phase. In fact tensorflow lite exist which is specifically created for embedded and mobile device, [prediction test tool] and the final integration in [bdk] should use that.
* There are other fields that should be explored that could improve model predictions, such as, tx weight, time from last block, etc. Luckily the architecture of the logger allows the recreation of the dataset from the raw logs very quickly. Also some fields like `confirms_in` are so important that the model could benefit from expansion during pre-processing with technique such as [hashed feature columns].
* Bitcoin logger could be improved by a merge command to unify raw logs files, reducing redundancy and consequently disk occupation.
* At the moment I am training the model on a threadripper CPU, training the code on GPU or even TPU will be needed to decrease training time, especially because input data will grow and capture more mempool situations.
* The [prediction test tool] should estimate only with p2p, without requiring a node. This work would be propedeutic for [bdk] integration
* At the moment mempool buckets are multiple inputs `a*` as show in the model graph, since they are related, is it possible to merge them in one TensorArray?
* Why the model sometimes doesn't learn and [get stuck]? It may depend by a particular configuration of the weight random initialization and the first derivative being zero for relu for negative number. If it's the case Leaky relu should solve
* There are issues regarding dead neurons (going to 0) or neurons with big weight, weight results should be monitored for this events, and also weight decay and L2 regularization should be explored.
* Tune hyper-parameters technique should be re-tested.
* Predictions should be monotonic decreasing for growing `confirms_in` parameter, for obvious reason it doesn't make sense that an higher fee rate will result in a higher confirmation time. Since this is not enforced anywhere in the model, situation like this could happen and should not.
```
[2021-01-18T09:31:30Z INFO  estimate_ml_fee] Estimated fee to enter in 1 blocks is 47.151127 sat/vbyte
[2021-01-18T09:31:30Z INFO  estimate_ml_fee] Estimated fee to enter in 6 blocks is 1.0932393 sat/vbyte
[2021-01-18T09:31:30Z INFO  estimate_ml_fee] Estimated fee to enter in 36 blocks is 4.499987 sat/vbyte
[2021-01-18T09:31:30Z INFO  estimate_ml_fee] Estimated fee to enter in 72 blocks is 12.659084 sat/vbyte
[2021-01-18T09:31:30Z INFO  estimate_ml_fee] Estimated fee to enter in 144 blocks is 9.928209 sat/vbyte
[2021-01-18T09:31:30Z INFO  estimate_ml_fee] Estimated fee to enter in 432 blocks is 6.9069905 sat/vbyte
```

## Thanks

Thanks to [Square crypto] for sponsoring this work and thanks to the reviewers TODO ADD REVIEWERS

And also this tweet that remembered me I had this work in my TODO list

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">I don&#39;t understand Machine Learning(ML), but is it horrible to use ML to predict bitcoin fees? <br><br>I have heard tales of this &quot;Deep Learning&quot; thing where you throw a bunch of data at it and it gives you good results with high accuracy.</p>&mdash; sanket1729 (@sanket1729) <a href="https://twitter.com/sanket1729/status/1336624662365822977?ref_src=twsrc%5Etfw">December 9, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

<br/><br/>

[^1]: mempool is the set of transactions that are valid by consensus rules (for example, they are spending existing bitcoin), broadcasted in the bitcoin peer to peer network, but they are not yet part of the blockchain.
[^2]: DISCLAIMER: I am not an expert data-scientist!
[^3]: MAE is Mean Absolute Error, which is the average of the series built by the absolute difference between the real value and the estimation.
[^4]: drift like MAE, but without the absolute value
[^5]: Most node won't relay transactions with fee lower than the min relay fee, which has a default of `1.0`


[core]: https://bitcoincore.org/
[bitmex withdrawals]: https://b10c.me/mempool-observations/2-bitmex-broadcast-13-utc/
[estimators]: https://b10c.me/blog/003-a-list-of-public-bitcoin-feerate-estimation-apis/
[neutrino]: https://github.com/bitcoin/bips/blob/master/bip-0157.mediawiki
[weekend]: https://www.blockchainresearchlab.org/2020/03/30/a-week-with-bitcoin-transaction-timing-and-transaction-fees/
[notifying]: https://github.com/bitcoin/bitcoin/blob/master/doc/zmq.md#usage
[ZMQ]: https://github.com/RCasatta/bitcoin-logger/src/zmq.rs
[data logger]: https://github.com/RCasatta/bitcoin-logger
[this one]: https://blockstream.info/tx/33291156ab79e9b4a1019b618b0acfa18cbdf8fa6b71c43a9eed62a849b86f9a
[dataset]: https://storage.googleapis.com/bitcoin_log/dataset_17.csv.gz
[google colab notebook]: https://colab.research.google.com/drive/1yamwh8nE4NhmGButep-pfUT-1uRKs49a?usp=sharing
[plain python]: https://github.com/RCasatta/
[example]: https://www.tensorflow.org/tutorials/keras/regression
[tune hyperparameters]: https://www.tensorflow.org/tutorials/keras/keras_tuner
[advise]: https://www.tensorflow.org/tutorials/keras/overfit_and_underfit#demonstrate_overfitting
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
