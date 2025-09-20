use mysql_async::prelude::*;
use mysql_async::{OptsBuilder, Params, Pool, Value};
use napi::{JsNumber, JsString};
use napi_derive::napi;
use serde_json::{json, Value as JsonValue};

use crate::log::Log;

pub struct DatabaseConnection {
    pub pool: Pool,
}

impl DatabaseConnection {
    pub fn new(
        host: JsString,
        port: JsNumber,
        username: JsString,
        password: JsString,
        database: JsString,
    ) -> napi::Result<Self> {
        let opts = OptsBuilder::default()
            .ip_or_hostname(host.into_utf8().unwrap().into_owned().unwrap())
            .tcp_port(port.get_uint32().unwrap() as u16)
            .user(Some(username.into_utf8().unwrap().into_owned().unwrap()))
            .pass(Some(password.into_utf8().unwrap().into_owned().unwrap()))
            .db_name(Some(database.into_utf8().unwrap().into_owned().unwrap()));

        let pool = Pool::new(opts);

        Ok(Self { pool })
    }

    // Async helper to get a connection
    pub async fn get_conn(&self) -> Result<mysql_async::Conn, mysql_async::Error> {
        self.pool.get_conn().await
    }
}

#[napi]
pub struct Database {
    connection: DatabaseConnection,
}

#[napi]
impl Database {
    #[napi(constructor)]
    pub fn new(
        host: Option<JsString>,
        port: Option<JsNumber>,
        username: Option<JsString>,
        password: Option<JsString>,
        database: Option<JsString>,
    ) -> napi::Result<Self> {
        Ok(Self {
            connection: DatabaseConnection::new(
                host.unwrap(),
                port.unwrap(),
                username.unwrap(),
                password.unwrap(),
                database.unwrap(),
            )
            .unwrap(),
        })
    }

    #[napi]
    // Fetch a server's config as JSON string. Returns a Promise<string> in JS.
    pub async fn get(&self, server: String) -> napi::Result<String> {
        // minimal implementation: query DB and produce JSON
        match fetch_config_json(&self.connection.pool, &server).await {
            Ok(s) => Ok(s),
            Err(e) => {
                Log::error(&format!("get() error: {}", e));
                Err(napi::Error::from_reason(format!("DB fetch failed: {}", e)))
            }
        }
    }

    // Set the configuration for a server. For now this only ensures a `config` row exists.
    #[napi]
    pub async fn set(&self, server: String) -> napi::Result<()> {
        let mut conn = match self.connection.get_conn().await {
            Ok(c) => c,
            Err(e) => {
                Log::error(&format!("set() conn error: {}", e));
                return Err(napi::Error::from_reason("DB connection failed".to_string()));
            }
        };

        // Upsert config row
        if let Err(e) = conn
            .exec_drop(
                "INSERT INTO config (server) VALUES (?) ON DUPLICATE KEY UPDATE server = VALUES(server)",
                (server.clone(),),
            )
            .await
        {
            Log::error(&format!("set() exec error: {}", e));
            return Err(napi::Error::from_reason("DB upsert failed".to_string()));
        }

        // Fetch config id
        let config_row: Option<(i64,)> = match conn
            .exec_first(
                "SELECT id FROM config WHERE server = ? LIMIT 1",
                (server.clone(),),
            )
            .await
        {
            Ok(r) => r,
            Err(e) => {
                Log::error(&format!("set() fetch config id error: {}", e));
                return Err(napi::Error::from_reason(
                    "DB fetch config id failed".to_string(),
                ));
            }
        };

        let config_id = match config_row {
            Some((id,)) => id,
            None => {
                Log::error("set() config id not found after upsert");
                return Err(napi::Error::from_reason("config id not found".to_string()));
            }
        };

        // Ensure every single-row child table has a row for this config (use defaults similar to database.mts)
        if let Err(e) = upsert_automod(&mut conn, config_id).await {
            Log::error(&format!("set() upsert_automod error: {}", e));
            return Err(napi::Error::from_reason(
                "upsert automod failed".to_string(),
            ));
        }

        if let Err(e) = upsert_autopublish(&mut conn, config_id).await {
            Log::error(&format!("set() upsert_autopublish error: {}", e));
            return Err(napi::Error::from_reason(
                "upsert autopublish failed".to_string(),
            ));
        }

        if let Err(e) = upsert_ghostping(&mut conn, config_id).await {
            Log::error(&format!("set() upsert_ghostping error: {}", e));
            return Err(napi::Error::from_reason(
                "upsert ghostping failed".to_string(),
            ));
        }

        if let Err(e) = upsert_logs(&mut conn, config_id).await {
            Log::error(&format!("set() upsert_logs error: {}", e));
            return Err(napi::Error::from_reason("upsert logs failed".to_string()));
        }

        if let Err(e) = upsert_roles(&mut conn, config_id).await {
            Log::error(&format!("set() upsert_roles error: {}", e));
            return Err(napi::Error::from_reason("upsert roles failed".to_string()));
        }

        if let Err(e) = upsert_welcome(&mut conn, config_id).await {
            Log::error(&format!("set() upsert_welcome error: {}", e));
            return Err(napi::Error::from_reason(
                "upsert welcome failed".to_string(),
            ));
        }

        if let Err(e) = upsert_leveling(&mut conn, config_id).await {
            Log::error(&format!("set() upsert_leveling error: {}", e));
            return Err(napi::Error::from_reason(
                "upsert leveling failed".to_string(),
            ));
        }

        if let Err(e) = upsert_economy(&mut conn, config_id).await {
            Log::error(&format!("set() upsert_economy error: {}", e));
            return Err(napi::Error::from_reason(
                "upsert economy failed".to_string(),
            ));
        }

        // close connection (return to pool)
        let _ = conn.disconnect().await;

        Ok(())
    }
}

/*
upsert for every table
 */

async fn upsert_automod(
    conn: &mut mysql_async::Conn,
    config_id: i64,
) -> Result<(), mysql_async::Error> {
    let sql = "INSERT INTO automod (config_id, enabled) VALUES (?, ?) ON DUPLICATE KEY UPDATE enabled = VALUES(enabled)";
    let params = Params::Positional(vec![Value::from(config_id), Value::from(false)]);
    conn.exec_drop(sql, params).await?;
    Ok(())
}

async fn upsert_autopublish(
    conn: &mut mysql_async::Conn,
    config_id: i64,
) -> Result<(), mysql_async::Error> {
    let sql = "INSERT INTO autopublish (config_id, enabled, channels, bots) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE enabled = VALUES(enabled), channels = VALUES(channels), bots = VALUES(bots)";
    let params = Params::Positional(vec![
        Value::from(config_id),
        Value::from(false),
        Value::from("[]".to_string()),
        Value::from(false),
    ]);
    conn.exec_drop(sql, params).await?;
    Ok(())
}

async fn upsert_ghostping(
    conn: &mut mysql_async::Conn,
    config_id: i64,
) -> Result<(), mysql_async::Error> {
    let sql = "INSERT INTO ghostping (config_id, enabled, noMods, settings) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE enabled = VALUES(enabled), noMods = VALUES(noMods), settings = VALUES(settings)";
    let params = Params::Positional(vec![
        Value::from(config_id),
        Value::from(false),
        Value::from(false),
        Value::from("{}".to_string()),
    ]);
    conn.exec_drop(sql, params).await?;
    Ok(())
}

async fn upsert_logs(
    conn: &mut mysql_async::Conn,
    config_id: i64,
) -> Result<(), mysql_async::Error> {
    let sql = "INSERT INTO logs (config_id, enabled, webhookEnabled, channel, webhook, inbox, actions) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE enabled = VALUES(enabled), webhookEnabled = VALUES(webhookEnabled), channel = VALUES(channel), webhook = VALUES(webhook), inbox = VALUES(inbox), actions = VALUES(actions)";
    let params = Params::Positional(vec![
        Value::from(config_id),
        Value::from(false),
        Value::from(false),
        Value::from("".to_string()),
        Value::from("".to_string()),
        Value::from("".to_string()),
        Value::from("{}".to_string()),
    ]);
    conn.exec_drop(sql, params).await?;
    Ok(())
}

async fn upsert_roles(
    conn: &mut mysql_async::Conn,
    config_id: i64,
) -> Result<(), mysql_async::Error> {
    let sql = "INSERT INTO roles (config_id, settings, immune, noPing, streaming, mute) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE settings = VALUES(settings), immune = VALUES(immune), noPing = VALUES(noPing), streaming = VALUES(streaming), mute = VALUES(mute)";
    let params = Params::Positional(vec![
        Value::from(config_id),
        Value::from("{}".to_string()),
        Value::from("[]".to_string()),
        Value::from("[]".to_string()),
        Value::from("".to_string()),
        Value::from("".to_string()),
    ]);
    conn.exec_drop(sql, params).await?;
    Ok(())
}

async fn upsert_welcome(
    conn: &mut mysql_async::Conn,
    config_id: i64,
) -> Result<(), mysql_async::Error> {
    let sql = "INSERT INTO welcome (config_id, enabled, webhookEnabled, channel, webhook, message) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE enabled = VALUES(enabled), webhookEnabled = VALUES(webhookEnabled), channel = VALUES(channel), webhook = VALUES(webhook), message = VALUES(message)";
    let params = Params::Positional(vec![
        Value::from(config_id),
        Value::from(false),
        Value::from(false),
        Value::from("".to_string()),
        Value::from("".to_string()),
        Value::from("".to_string()),
    ]);
    conn.exec_drop(sql, params).await?;
    Ok(())
}

async fn upsert_leveling(
    conn: &mut mysql_async::Conn,
    config_id: i64,
) -> Result<(), mysql_async::Error> {
    let sql = "INSERT INTO leveling (config_id, enabled, xp_min, xp_max, xp_roles, xp_channels, xp_filterMode, levelMax, levelRewarding) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE enabled = VALUES(enabled), xp_min = VALUES(xp_min), xp_max = VALUES(xp_max), xp_roles = VALUES(xp_roles), xp_channels = VALUES(xp_channels), xp_filterMode = VALUES(xp_filterMode), levelMax = VALUES(levelMax), levelRewarding = VALUES(levelRewarding)";
    let params = Params::Positional(vec![
        Value::from(config_id),
        Value::from(false),
        Value::from(5i64),
        Value::from(25i64),
        Value::from("[]".to_string()),
        Value::from("[]".to_string()),
        Value::from(0i64),
        Value::from(100i64),
        Value::from(false),
    ]);
    conn.exec_drop(sql, params).await?;
    Ok(())
}

async fn upsert_economy(
    conn: &mut mysql_async::Conn,
    config_id: i64,
) -> Result<(), mysql_async::Error> {
    let sql = "INSERT INTO economy (config_id, enabled, currency_name, currency_namePlural, currency_symbol, currency_image, currency_useImg, gambling_enabled, gambling_min, gambling_max, drops_enabled, drops_channels, drops_filterMode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE enabled = VALUES(enabled), currency_name = VALUES(currency_name), currency_namePlural = VALUES(currency_namePlural), currency_symbol = VALUES(currency_symbol), currency_image = VALUES(currency_image), currency_useImg = VALUES(currency_useImg), gambling_enabled = VALUES(gambling_enabled), gambling_min = VALUES(gambling_min), gambling_max = VALUES(gambling_max), drops_enabled = VALUES(drops_enabled), drops_channels = VALUES(drops_channels), drops_filterMode = VALUES(drops_filterMode)";
    let params = Params::Positional(vec![
        Value::from(config_id),
        Value::from(false),
        Value::from("".to_string()),
        Value::from("".to_string()),
        Value::from("".to_string()),
        Value::from("".to_string()),
        Value::from(false),
        Value::from(false),
        Value::from(5i64),
        Value::from(100i64),
        Value::from(false),
        Value::from("[]".to_string()),
        Value::from(0i64),
    ]);
    conn.exec_drop(sql, params).await?;
    Ok(())
}

async fn fetch_config_json(
    pool: &Pool,
    server: &str,
) -> Result<String, Box<dyn std::error::Error>> {
    let mut conn = pool.get_conn().await?;

    // Fetch config id
    let row: Option<(i64, String)> = conn
        .exec_first(
            "SELECT id, server FROM config WHERE server = ? LIMIT 1",
            (server.to_string(),),
        )
        .await?;

    if row.is_none() {
        // return minimal JSON if not found
        let out = json!({ "server": server, "found": false });
        return Ok(serde_json::to_string(&out)?);
    }

    let (config_id, server_name) = row.unwrap();

    // fetch automod id
    let automod_row: Option<(i64, bool)> = conn
        .exec_first(
            "SELECT id, enabled FROM automod WHERE config_id = ? LIMIT 1",
            (config_id,),
        )
        .await?;

    let automod_json = if let Some((automod_id, enabled)) = automod_row {
        // fetch filters for this automod
        let filters: Vec<(String, bool, Option<String>, Option<String>, Option<i64>, Option<i64>, Option<i64>, Option<String>, Option<String>)> = conn
            .exec(
                "SELECT type, enabled, roles, channels, filterMode, permFilterMode, punishment, keywords, logs FROM filter WHERE automod_id = ?",
                (automod_id,),
            )
            .await?;

        let mut filters_map = serde_json::Map::new();
        for (
            ftype,
            fenabled,
            roles,
            channels,
            filter_mode,
            perm_filter_mode,
            punishment,
            keywords,
            logs,
        ) in filters
        {
            filters_map.insert(
                ftype.clone(),
                json!({
                    "enabled": fenabled,
                    "roles": roles.and_then(|s| serde_json::from_str::<JsonValue>(&s).ok()).unwrap_or(JsonValue::Array(vec![])),
                    "channels": channels.and_then(|s| serde_json::from_str::<JsonValue>(&s).ok()).unwrap_or(JsonValue::Array(vec![])),
                    "filterMode": filter_mode.unwrap_or(0),
                    "permFilterMode": perm_filter_mode.unwrap_or(0),
                    "punishment": punishment.unwrap_or(0),
                    "keywords": keywords.and_then(|s| serde_json::from_str::<JsonValue>(&s).ok()).unwrap_or(JsonValue::Array(vec![])),
                    "logs": logs.unwrap_or_default()
                })
            );
        }

        json!({ "enabled": enabled, "filters": JsonValue::Object(filters_map) })
    } else {
        json!({})
    };

    // fetch other single-row tables (examples)
    let autopublish_row: Option<(bool, Option<String>, Option<bool>)> = conn
        .exec_first(
            "SELECT enabled, channels, bots FROM autopublish WHERE config_id = ? LIMIT 1",
            (config_id,),
        )
        .await?;

    let autopublish_json = if let Some((enabled, channels, bots)) = autopublish_row {
        json!({
            "enabled": enabled,
            "channels": channels.and_then(|s| serde_json::from_str::<JsonValue>(&s).ok()).unwrap_or(JsonValue::Array(vec![])),
            "bots": bots.unwrap_or(false)
        })
    } else {
        json!({})
    };

    let ghostping_row: Option<(bool, bool, Option<String>)> = conn
        .exec_first(
            "SELECT enabled, noMods, settings FROM ghostping WHERE config_id = ? LIMIT 1",
            (config_id,),
        )
        .await?;

    let ghostping_json = if let Some((enabled, no_mods, settings)) = ghostping_row {
        json!({
            "enabled": enabled,
            "noMods": no_mods,
            "settings": settings.and_then(|s| serde_json::from_str::<JsonValue>(&s).ok()).unwrap_or(JsonValue::Object(serde_json::Map::new()))
        })
    } else {
        json!({})
    };

    let logs_row: Option<(bool, bool, Option<String>, Option<String>, Option<String>, Option<String>)> = conn
        .exec_first("SELECT enabled, webhookEnabled, channel, webhook, inbox, actions FROM logs WHERE config_id = ? LIMIT 1", (config_id,))
        .await?;

    let logs_json = if let Some((enabled, webhook_enabled, channel, webhook, inbox, actions)) =
        logs_row
    {
        json!({
            "enabled": enabled,
            "webhookEnabled": webhook_enabled,
            "channel": channel.unwrap_or_default(),
            "webhook": webhook.unwrap_or_default(),
            "inbox": inbox.unwrap_or_default(),
            "actions": actions.and_then(|s| serde_json::from_str::<JsonValue>(&s).ok()).unwrap_or(JsonValue::Object(serde_json::Map::new()))
        })
    } else {
        json!({})
    };

    let roles_row: Option<(Option<String>, Option<String>, Option<String>, Option<String>, Option<String>)> = conn
        .exec_first("SELECT settings, immune, noPing, streaming, mute FROM roles WHERE config_id = ? LIMIT 1", (config_id,))
        .await?;

    let roles_json = if let Some((settings, immune, no_ping, streaming, mute)) = roles_row {
        json!({
            "settings": settings.and_then(|s| serde_json::from_str::<JsonValue>(&s).ok()).unwrap_or(JsonValue::Object(serde_json::Map::new())),
            "immune": immune.and_then(|s| serde_json::from_str::<JsonValue>(&s).ok()).unwrap_or(JsonValue::Array(vec![])),
            "noPing": no_ping.and_then(|s| serde_json::from_str::<JsonValue>(&s).ok()).unwrap_or(JsonValue::Array(vec![])),
            "streaming": streaming.unwrap_or_default(),
            "mute": mute.unwrap_or_default()
        })
    } else {
        json!({})
    };

    let welcome_row: Option<(bool, bool, Option<String>, Option<String>, Option<String>)> = conn
        .exec_first("SELECT enabled, webhookEnabled, channel, webhook, message FROM welcome WHERE config_id = ? LIMIT 1", (config_id,))
        .await?;

    let welcome_json =
        if let Some((enabled, webhook_enabled, channel, webhook, message)) = welcome_row {
            json!({
                "enabled": enabled,
                "webhookEnabled": webhook_enabled,
                "channel": channel.unwrap_or_default(),
                "webhook": webhook.unwrap_or_default(),
                "message": { "content": message.unwrap_or_default() }
            })
        } else {
            json!({})
        };

    let leveling_row: Option<(bool, Option<i64>, Option<i64>, Option<String>, Option<String>, Option<i64>, Option<i64>, Option<bool>)> = conn
        .exec_first("SELECT enabled, xp_min, xp_max, xp_roles, xp_channels, xp_filterMode, levelMax, levelRewarding FROM leveling WHERE config_id = ? LIMIT 1", (config_id,))
        .await?;

    let leveling_json = if let Some((
        enabled,
        xp_min,
        xp_max,
        xp_roles,
        xp_channels,
        xp_filter_mode,
        level_max,
        level_rewarding,
    )) = leveling_row
    {
        json!({
            "enabled": enabled,
            "xp": {
                "min": xp_min.unwrap_or(5),
                "max": xp_max.unwrap_or(25),
                "roles": xp_roles.and_then(|s| serde_json::from_str::<JsonValue>(&s).ok()).unwrap_or(JsonValue::Array(vec![])),
                "channels": xp_channels.and_then(|s| serde_json::from_str::<JsonValue>(&s).ok()).unwrap_or(JsonValue::Array(vec![])),
                "filterMode": xp_filter_mode.unwrap_or(0)
            },
            "levelMax": level_max.unwrap_or(100),
            "levelRewarding": level_rewarding.unwrap_or(false)
        })
    } else {
        json!({})
    };

    let economy_row: Option<(bool, Option<String>, Option<String>, Option<String>, Option<String>, Option<bool>, Option<bool>, Option<i64>, Option<i64>, Option<bool>, Option<String>, Option<i64>)> = conn
        .exec_first("SELECT enabled, currency_name, currency_namePlural, currency_symbol, currency_image, currency_useImg, gambling_enabled, gambling_min, gambling_max, drops_enabled, drops_channels, drops_filterMode FROM economy WHERE config_id = ? LIMIT 1", (config_id,))
        .await?;

    let economy_json = if let Some((
        enabled,
        currency_name,
        currency_name_plural,
        currency_symbol,
        currency_image,
        currency_use_img,
        gambling_enabled,
        gambling_min,
        gambling_max,
        drops_enabled,
        drops_channels,
        drops_filter_mode,
    )) = economy_row
    {
        json!({
            "enabled": enabled,
            "currency": {
                "name": currency_name.unwrap_or_default(),
                "namePlural": currency_name_plural.unwrap_or_default(),
                "symbol": currency_symbol.unwrap_or_default(),
                "image": currency_image.unwrap_or_default(),
                "useImg": currency_use_img.unwrap_or(false)
            },
            "gambling": {
                "enabled": gambling_enabled.unwrap_or(false),
                "min": gambling_min.unwrap_or(5),
                "max": gambling_max.unwrap_or(100)
            },
            "drops": {
                "enabled": drops_enabled.unwrap_or(false),
                "channels": drops_channels.and_then(|s| serde_json::from_str::<JsonValue>(&s).ok()).unwrap_or(JsonValue::Array(vec![])),
                "filterMode": drops_filter_mode.unwrap_or(0)
            }
        })
    } else {
        json!({})
    };

    let config_obj = json!({
        "server": server_name,
        "automod": automod_json,
        "autopublish": autopublish_json,
        "ghostping": ghostping_json,
        "logs": logs_json,
        "roles": roles_json,
        "welcome": welcome_json,
        "leveling": leveling_json,
        "economy": economy_json
    });

    Ok(serde_json::to_string(&config_obj)?)
}
