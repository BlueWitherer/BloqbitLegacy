use mysql::{OptsBuilder, Pool, PooledConn};
use napi::{JsNumber, JsString};
use napi_derive::napi;

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
        let pool = Pool::new(
            OptsBuilder::new()
                .ip_or_hostname(Some(host.into_utf8().unwrap().into_owned().unwrap()))
                .tcp_port(port.get_uint32().unwrap() as u16)
                .user(Some(username.into_utf8().unwrap().into_owned().unwrap()))
                .pass(Some(password.into_utf8().unwrap().into_owned().unwrap()))
                .db_name(Some(database.into_utf8().unwrap().into_owned().unwrap())),
        )
        .unwrap();

        Ok(Self { pool: pool })
    }

    pub fn get_conn(&self) -> Result<PooledConn, mysql::Error> {
        self.pool.get_conn()
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
    pub fn get() {
        Log::info("The system would reach the currently connected MariaDB database to retrieve server configuration data");
    }

    #[napi]
    pub fn set() {
        Log::warn("The system would reach the currently connected MariaDB database save server configuration data");
    }
}
