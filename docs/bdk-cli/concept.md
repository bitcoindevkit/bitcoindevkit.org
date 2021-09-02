# Concept

Now, in order to better grasp some of the design choices made by BDK, it's important to understand the main concept driving the development of this project, and the goal that it's trying to
achieve.

BDK is aiming first of all to be a **set of libraries and tools**, all meant to be very reusable and adaptable. Developers working on their own wallets or other projects that are trying to integrate
Bitcoin can pick the tools they need and piece them together to prototype and quickly ship a working product. This means that the `bdk-cli` that we've just installed is designed to be a **very thin layer** over the
APIs exposed by the various components of the library, **not a full, end-user-ready Bitcoin wallet**.

This concept leads to a few design choices that are arguably very bad for the "UX" of this wallet, but that allow developers to work more directly with the underlying library. For instance:

* BDK has an internal database that's used to store data about received transactions, spendable UTXOs, etc. This database is stored by default in your home folder, in `~/.bdk-bitcoin`. The database
  **will never** contain any data that can't be recreated purely by looking at the blockchain. Keys, descriptors, Electrum endpoints **are not stored in the database**. This explains why you'll have to specify them every
  time in the command line. It can be seen more like a *cache* and can be safely deleted without risking funds.
* BDK doesn't automatically "monitor" the blockchain, instead there's a `sync` command that has to be called by the user.
* When you create a transaction and then sign it, it's not automatically broadcast to the network. There's a `broadcast` command that does this. Moreover, the command doesn't accept a normal Bitcoin raw transaction,
  but instead a *PSBT*. That's because internally transactions are always moved as PSBTs, and again, the `broadcast` command is just a very thin wrapper over the raw library call.

There are probably more of these examples, but hopefully by this point you'll have more or less understood the gist of it. If you are not a developer, some parts of this will feel weird, inefficient, hard
to understand, and that's absolutely normal. Just try to survive through the pain and you'll be rewarded!
