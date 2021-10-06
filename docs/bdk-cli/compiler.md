# Compiler

## Introduction

If you want to play around with more complicated spending policies, you'll start to find it harder and harder to manually create the descriptors. This is where the miniscript compiler comes in! The `bdk` library
includes a very simple compiler that can produce a descriptor given a spending policy. The syntax used to encode the spending policy is very well described [in this page](http://bitcoin.sipa.be/miniscript/),
specifically in the "Policy to Miniscript compiler". The compiler included in BDK does basically the same job, but produces descriptors for `rust-miniscript` that have some minor differences from
the ones made by the C++ implementation used in that website.

## Installation

To install the miniscript compiler run the following command:

```bash
cargo install --git https://github.com/bitcoindevkit/bdk --features="compiler" --example miniscriptc
```

Once the command is done, you should have a `miniscriptc` command available. You can check if that's the case by running `miniscriptc --help`.

## Usage

In this case the interface is very simple: it accepts two arguments called "POLICY" and "TYPE", in this order. The first one, as the name implies, sets the spending policy to compile. The latter defines the type
of address that should be used to encapsulate the produced script, like a P2SH, P2WSH, etc.

Optionally, the `--parsed_policy` flag can be enabled and it will make the compiler print the JSON "human-readable" version of the spending policy, as described in the [`policies subcommand`](/bdk-cli/interface/#policies) of the CLI.

The `--network` flag can be used to change the network encoding of the address shown.

::: tip Tip
Keep in mind that since the compiler loads and interprets the descriptor, all the public keys specified in the policy must be valid public keys. This differs from the web tool linked above that also accepts
placeholders too. As described in the previous sections of this guide, the keys can be either `xpub`/`xprv` with or without metadata and a derivation path, WIF keys or raw hex public keys.
:::

## Example

Let's take this policy for example:

```bash
miniscriptc --parsed_policy "and(pk(cSQPHDBwXGjVzWRqAHm6zfvQhaTuj1f2bFH58h55ghbjtFwvmeXR),or(50@pk(02e96fe52ef0e22d2f131dd425ce1893073a3c6ad20e8cac36726393dfb4856a4c),older(1000)))" sh-wsh
```

The compiler should print something like:

```text
[2020-04-29T10:42:05Z INFO  miniscriptc] Compiling policy: and(pk(cSQPHDBwXGjVzWRqAHm6zfvQhaTuj1f2bFH58h55ghbjtFwvmeXR),or(50@pk(02e96fe52ef0e22d2f131dd425ce1893073a3c6ad20e8cac36726393dfb4856a4c),older(1000)))
[2020-04-29T10:42:05Z INFO  miniscriptc] ... Descriptor: sh(wsh(and_v(or_c(c:pk(02e96fe52ef0e22d2f131dd425ce1893073a3c6ad20e8cac36726393dfb4856a4c),v:older(1000)),c:pk(cSQPHDBwXGjVzWRqAHm6zfvQhaTuj1f2bFH58h55ghbjtFwvmeXR))))
[2020-04-29T10:42:05Z INFO  miniscriptc] ... First address: 2MsqrJuZewY3o3ADAy1Uhi5vsBqTANjH3Cf
```

JSON policy:

```json
{
  "type":"THRESH",
  "items":[
    {
      "type":"THRESH",
      "items":[
        {
          "type":"SIGNATURE",
          "pubkey":"02e96fe52ef0e22d2f131dd425ce1893073a3c6ad20e8cac36726393dfb4856a4c",
          "satisfaction":{
            "type":"NONE"
          },
          "contribution":{
            "type":"NONE"
          }
        },
        {
          "type":"RELATIVETIMELOCK",
          "value":1000,
          "satisfaction":{
            "type":"NONE"
          },
          "contribution":{
            "type":"COMPLETE",
            "condition":{
              "csv":1000
            }
          }
        }
      ],
      "threshold":1,
      "satisfaction":{
        "type":"NONE"
      },
      "contribution":{
        "type":"PARTIALCOMPLETE",
        "n":2,
        "m":1,
        "items":[
          1
        ],
        "conditions":{
          "[1]":[
            {
              "csv":1000
            }
          ]
        }
      }
    },
    {
      "type":"SIGNATURE",
      "pubkey":"02e96fe52ef0e22d2f131dd425ce1893073a3c6ad20e8cac36726393dfb4856a4c",
      "satisfaction":{
        "type":"NONE"
      },
      "contribution":{
        "type":"COMPLETE",
        "condition":{

        }
      }
    }
  ],
  "threshold":2,
  "satisfaction":{
    "type":"NONE"
  },
  "contribution":{
    "type":"PARTIALCOMPLETE",
    "n":2,
    "m":2,
    "items":[
      0,
      1
    ],
    "conditions":{
      "[0, 1]":[
        {
          "csv":1000
        }
      ]
    }
  }
}
```

## Troubleshooting

#### Nothing is printed

This might mean that you have a `RUST_LOG` variable set to a value that suppresses the compiler's log. You can try adding `miniscriptc=info` to your `RUST_LOG` value and see if that works, or open a new clean
shell.
