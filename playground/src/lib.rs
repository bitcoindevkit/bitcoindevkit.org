use std::collections::HashMap;
use std::rc::Rc;
use std::str::FromStr;

use js_sys::Promise;
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::future_to_promise;

use log::{debug, info};

use serde::Deserialize;

use clap::AppSettings;

use bdk::bitcoin;
use bdk::blockchain::EsploraBlockchain;
use bdk::database::memory::MemoryDatabase;
use bdk::keys::{GeneratableDefaultOptions, GeneratedKey};
use bdk::miniscript;
use bdk::*;

use bitcoin::*;

use miniscript::policy::Concrete;
use miniscript::Descriptor;

mod utils;

#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn init() {
    console_log::init_with_level(log::Level::Debug).unwrap();
    utils::set_panic_hook();

    info!("Initialization completed");
}

#[wasm_bindgen]
pub struct WalletWrapper {
    _change_descriptor: Option<String>,
    wallet: Rc<Wallet<EsploraBlockchain, MemoryDatabase>>,
}

#[wasm_bindgen]
impl WalletWrapper {
    #[wasm_bindgen(constructor)]
    pub async fn new(
        network: String,
        descriptor: String,
        change_descriptor: Option<String>,
        esplora: String,
    ) -> Result<WalletWrapper, String> {
        let network = match network.as_str() {
            "regtest" => Network::Regtest,
            "testnet" | _ => Network::Testnet,
        };

        debug!("descriptors: {:?} {:?}", descriptor, change_descriptor);

        let blockchain = EsploraBlockchain::new(&esplora, None);
        let wallet = Wallet::new(
            descriptor.as_str(),
            change_descriptor.as_ref().map(|x| x.as_str()),
            network,
            MemoryDatabase::new(),
            blockchain,
        )
        .await
        .map_err(|e| format!("{:?}", e))?;

        Ok(WalletWrapper {
            _change_descriptor: change_descriptor,
            wallet: Rc::new(wallet),
        })
    }

    #[wasm_bindgen]
    pub fn run(&self, line: String) -> Promise {
        let mut app = cli::make_cli_subcommands().setting(AppSettings::NoBinaryName);
        let wallet = Rc::clone(&self.wallet);

        future_to_promise(async move {
            let matches = app
                .get_matches_from_safe_borrow(line.split(" "))
                .map_err(|e| e.message)?;
            let res = cli::handle_matches(&wallet, matches)
                .await
                .map(|json| json.to_string())
                .map_err(|e| format!("{:?}", e))?;

            Ok(res.into())
        })
    }
}

#[derive(Debug, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
enum Alias {
    GenWif,
    GenExt { extra: String },
    Existing { extra: String },
}

impl Alias {
    fn into_key(self) -> String {
        match self {
            Alias::GenWif => {
                let generated: GeneratedKey<bitcoin::PrivateKey, miniscript::Legacy> =
                    GeneratableDefaultOptions::generate_default().unwrap();

                let mut key = generated.into_key();
                key.network = Network::Testnet;

                key.to_wif()
            }
            Alias::GenExt { extra: path } => {
                let generated: GeneratedKey<
                    bitcoin::util::bip32::ExtendedPrivKey,
                    miniscript::Legacy,
                > = GeneratableDefaultOptions::generate_default().unwrap();

                let mut xprv = generated.into_key();
                xprv.network = Network::Testnet;

                format!("{}{}", xprv, path)
            }
            Alias::Existing { extra } => extra,
        }
    }
}

#[wasm_bindgen]
pub fn compile(policy: String, aliases: String, script_type: String) -> Promise {
    future_to_promise(async move {
        let aliases: HashMap<String, Alias> =
            serde_json::from_str(&aliases).map_err(|e| format!("{:?}", e))?;
        let aliases: HashMap<String, String> = aliases
            .into_iter()
            .map(|(k, v)| (k, v.into_key()))
            .collect();

        let policy = Concrete::<String>::from_str(&policy).map_err(|e| format!("{:?}", e))?;

        let descriptor = match script_type.as_str() {
            "sh" => Descriptor::Sh(policy.compile().map_err(|e| format!("{:?}", e))?),
            "wsh" => Descriptor::Wsh(policy.compile().map_err(|e| format!("{:?}", e))?),
            "sh-wsh" => Descriptor::ShWsh(policy.compile().map_err(|e| format!("{:?}", e))?),
            _ => return Err("InvalidScriptType".into()),
        };

        let descriptor: Result<Descriptor<String>, String> = descriptor.translate_pk(
            |key| Ok(aliases.get(key).unwrap_or(key).into()),
            |key| Ok(aliases.get(key).unwrap_or(key).into()),
        );
        let descriptor = descriptor?;

        Ok(format!("{}", descriptor).into())
    })
}
