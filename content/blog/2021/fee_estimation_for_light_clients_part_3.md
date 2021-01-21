---
title: "Fee estimation for light-clients (Part 3)"
description: ""
author: "Riccardo Casatta"
date: "2021-01-21"
tags: ["fee", "machine learning"]
hidden: true
draft: false
---

This post is part 2 of 3 of a series. ([Part 1], [Part 2])

- [The model](#the-model)
    + [Splitting](#splitting)
    + [Preprocessing](#preprocessing)
    + [Build](#build)
    + [Finally, training](#finally--training)
- [The prediction phase](#the-prediction-phase)
- [Conclusion and future development](#conclusion-and-future-development)
- [Acknowledgements](#acknowledgements)

## The model

The code building and training the model with [tensorflow] is available in [google colab notebook] (jupyter notebook); you can also download the file as plain python and run it locally. About 30 minutes are needed to train the model, but it heavily depends on the hardware available.

![graph confirm_in blocks vs fee_rate](/images/20210115-111008-confirms_in-fee_rate.png)
<div align="center">Tired to read and want a short interesting evidence? In the last month a ~50 sat/vbyte transaction never took more than a day to confirm and a ~5 sat/vbyte never took more than a week</div><br/>

As a reference, in the code we have a calculation of the bitcoin core `estimatesmartfee` MAE[^MAE] and drift[^drift], note this are `[satoshi/bytes]` (not virtual bytes).
MAE is computed as `avg(abs(fee_rate_bytes - core_econ))` when `core_econ` is available (about 1.2M observations, sometime the value is not available when considered too old).


estimatesmartfee mode | MAE [satoshi/bytes] | drift
-|-|-
economic| 35.22 | 29.76
conservative | 54.28 | 53.13

As seen from the table, the error is quite high, but the positive drift suggests `estimatesmartfee` prefers to overestimate to avoid transactions not confirming.


As we said in the introduction, network traffic is correlated with time and we have the timestamp of when the transaction has been first seen, however a ML model doesn't like plain numbers too much, but it behaves better with "number that repeats", like categories, so we are converting the timestamp in `day_of_week` a number from 0 to 6, and `hours` a number from 0 to 24.

#### Splitting

The dataset is splitted in training and test data with a 80/20 proportion. As the name suggest the training part is used to train the model, the test is composed of other observations to test if the model is good with observations that has never seen (proving the model can generalize, not just memorizing the answer).

During the training the data is splitted again in 80/20 for training and validation respectively, validation is basically testing during training.

During splitting dataset is converted from a pandas data frame to tensorflow dataset, decreasing training times.

#### Preprocessing

The preprocessing phase is part of the model however it contains transformations without parameters trained by the model.
This transformations are useful because model trains better if data are in some format, and having this phase inside the model helps to avoid to prepare the data before feeding the model at prediction phase.

Our model performs 2 kind of preprocessing:

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

Honestly, about the neural network parameters, they are mostly the one taken from this tensorflow [example], we even tried to [tune hyperparameters], however, we decided to follow this [advice]: *"The simplest way to prevent overfitting is to start with a small model:"*. We hope this work will attract other data scientists to this bitcoin problem, improving the model. We also think that a longer time for the data collection is needed to capture various situations.

A significant part of a ML model are the activation functions, `relu` (Rectified Linear Unit) is one of the most used lately, because it's simple and works well as we learned in this [introducing neural network video]. `relu` it's equal to zero for negative values and equal to the input for positive values. Being non-linear allows the whole model to be non-linear.

For the last layer it is different: we want to enforce a minimum for the output, which is the minimum relay fee `1.0`[^minimum relay fee]. One could not simply cut the output of the model after prediction because all the training would not consider this constraint. So we need to build a custom activation function that the model training will be able to use for the [gradient descent] optimization step. Luckily this is very simple using tensorflow primitives:

```
def clip(x):
  min = tf.constant(1.0)
  return tf.where(tf.less(x, min), min, x)
```

Another important part is the optimizer, when we first read the aforementioned [example] the optimizer used was `RMSProp` however the example updated lately and we noticed the optimizer changed in favor of `Adam` which we read is the [latest trend] in data science. We changed the model to use `Adam` and effectively the training is faster with `Adam` and even slightly lower error is achieved.
Another important parameter is the learning rate, which we set to `0.01` after manual trials; however there might be space for improvements such as using [exponential decay], starting with an high learning rate and decreasing it through training epochs.

The last part of the model configuration is the loss function: the objective of the training is to find the minimum of this function. Usually for regression problem (the ones having a number as output, not a category) the most used is the Mean squared error (MSE). MSE is measured as the average of squared difference between predictions and actual observations, giving larger penalties to large difference because of the square. An interesting property is that the bigger the error the faster the changes is good at the beginning of the training, while slowing down when the model predicts better is desirable to avoid "jumping out" the local minimum.

#### Finally, the model training

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

The value `loss` is the MSE on the training data while `val_loss` is the MSE value on the validation data. As far as we understand the separated validation data helps to detect the machine learning enemy, overfitting. Because in case of overfitting the value `loss` continue to improve (almost indefinitely) while `val_loss` start improving with the loss but a certain point diverge, indicating the network is memorizing the training data to improve `loss` but in doing so losing generalizing capabilities.

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

The results have shown deep neural network are a tool capable of good bitcoin transaction fee estimations; this suggests that further ML research in this area might be promising.

This is just a starting point, there are many future improvements such as:

* Build a separate model with full knowledge, thus for full, always-connected nodes could be interesting and improve network resource allocation with respect to current estimators.
* Tensorflow is a huge dependency, and since it contains all the feature to build and train a model, most of the feature are not needed in the prediction phase. In fact tensorflow lite exists which is specifically created for embedded and mobile devices; the [prediction test tool] and the final integration in [bdk] should use it.
* There are other fields that should be explored that could improve model predictions, such as transaction weight, time from last block and many others. Luckily the architecture of the logger allows the generation of the dataset from the raw logs very quickly. Also some fields like `confirms_in` are so important that the model could benefit from expansion during pre-processing with technique such as [hashed feature columns].
* Bitcoin logger could be improved by a merge command to unify raw logs files, reducing redundancy and consequently disk occupation. Other than CSV the dataset could be created in multiple files in [TFRecord format] to allow more parallelism during training.
* At the moment we are training the model on a threadripper CPU, training the code on GPU or even TPU will be needed to decrease training time, especially because input data will grow and capture more mempool situations.
* The [prediction test tool] should estimate only using the p2p bitcoin network, without requiring a node. This work would be propedeutic for [bdk] integration
* At the moment mempool buckets are multiple inputs `a*` as show in the model graph; since they are related, is it possible to merge them in one TensorArray?
* Sometimes the model does not learn and [gets stuck]. It may depend on a particular configuration of the weight random initialization and the first derivative being zero for relu for negative number. If this is the case Leaky relu should solve the problem
* There are issues regarding dead neurons (going to 0) or neurons with big weight, weight results should be monitored for this events, and also weight decay and L2 regularization should be explored.
* Tune hyper-parameters technique should be re-tested.
* Predictions should be monotonic decreasing for growing `confirms_in` parameter; for obvious reason it doesn't make sense that an higher fee rate will result in a higher confirmation time. Since this is not enforced anywhere in the model, situation like this could happen and should be avoided.
```
[2021-01-18T09:31:30Z INFO  estimate_ml_fee] Estimated fee to enter in 1 blocks is 47.151127 sat/vbyte
[2021-01-18T09:31:30Z INFO  estimate_ml_fee] Estimated fee to enter in 6 blocks is 1.0932393 sat/vbyte
[2021-01-18T09:31:30Z INFO  estimate_ml_fee] Estimated fee to enter in 36 blocks is 4.499987 sat/vbyte
[2021-01-18T09:31:30Z INFO  estimate_ml_fee] Estimated fee to enter in 72 blocks is 12.659084 sat/vbyte
[2021-01-18T09:31:30Z INFO  estimate_ml_fee] Estimated fee to enter in 144 blocks is 9.928209 sat/vbyte
[2021-01-18T09:31:30Z INFO  estimate_ml_fee] Estimated fee to enter in 432 blocks is 6.9069905 sat/vbyte
```

## Acknowledgements

Thanks to [Square crypto] for sponsoring this work and thanks to the reviewers: [Leonardo Comandini], [Domenico Gabriele], [Alekos Filini], [Ferdinando Ametrano].

And also this tweet that remembered me [I] had this work in my TODO list

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">I don&#39;t understand Machine Learning(ML), but is it horrible to use ML to predict bitcoin fees? <br><br>I have heard tales of this &quot;Deep Learning&quot; thing where you throw a bunch of data at it and it gives you good results with high accuracy.</p>&mdash; sanket1729 (@sanket1729) <a href="https://twitter.com/sanket1729/status/1336624662365822977?ref_src=twsrc%5Etfw">December 9, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

This is the final part of the series. In the previous [Part 1] we talked about the problem and in [Part 3] we talked about the dataset.

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
