use napi_derive::napi;
use std::collections::HashMap;

use crate::log::Log;

#[napi]
pub struct ConfigCache {
    inner: HashMap<String, String>,
}

#[napi]
impl ConfigCache {
    #[napi(constructor)]
    pub fn new() -> Self {
        Self {
            inner: HashMap::new(),
        }
    }

    #[napi]
    pub fn set(&mut self, guild_id: String, config: String) {
        Log::debug(
            format_args!(
                "Storing guild of ID {} into configuration cache...",
                guild_id
            )
            .as_str()
            .unwrap_or("Storing guild into configuration cache..."),
        );
        self.inner.insert(guild_id, config);
    }

    #[napi]
    pub fn get(&self, guild_id: String) -> Option<String> {
        Log::debug(
            format_args!(
                "Retrieving guild of ID {} from configuration cache...",
                guild_id
            )
            .as_str()
            .unwrap_or("Retrieving guild from configuration cache..."),
        );
        self.inner.get(&guild_id).cloned()
    }
}
