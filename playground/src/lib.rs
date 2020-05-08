use std::rc::Rc;

use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::future_to_promise;
use js_sys::Promise;

use log::{info, debug};

use clap::AppSettings;

use magical_bitcoin_wallet::*;
use magical_bitcoin_wallet::database::memory::MemoryDatabase;
use magical_bitcoin_wallet::bitcoin as bitcoin;

use bitcoin::*;

mod utils;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
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
    pub async fn new(network: String, descriptor: String, change_descriptor: Option<String>, esplora: String) -> Result<WalletWrapper, String> {
        let network = match network.as_str() {
            "regtest" => Network::Regtest,
            "testnet" | _ => Network::Testnet,
        };

        debug!("descriptors: {:?} {:?}", descriptor, change_descriptor);

        let blockchain = EsploraBlockchain::new(&esplora);
        let wallet = Wallet::new(descriptor.as_str(), change_descriptor.as_ref().map(|x| x.as_str()), network, MemoryDatabase::new(), blockchain).await.map_err(|e| format!("{:?}", e))?;

        Ok(WalletWrapper{
            _change_descriptor: change_descriptor,
            wallet: Rc::new(wallet),
        })
    }

    #[wasm_bindgen]
    pub fn run(&self, line: String) -> Promise {
        let mut app = cli::make_cli_subcommands().setting(AppSettings::NoBinaryName);
        let wallet = Rc::clone(&self.wallet);

        future_to_promise(async move {
            let matches = app.get_matches_from_safe_borrow(line.split(" ")).map_err(|e| e.message)?;
            let res = cli::handle_matches(&wallet, matches).await.map_err(|e| format!("{:?}", e))?;

            Ok(res.into())
        })
    }
}

