use chrono::Utc;
use std::fmt::Write;

pub struct Log;

struct Colors<'a> {
    reset: &'a str,
    bold: &'a str,
    debug: &'a str,
    info: &'a str,
    warn: &'a str,
    error: &'a str,
    done: &'a str,
    print: &'a str,
}

const COL: Colors = Colors {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    debug: "\x1b[90m",
    info: "\x1b[36m",
    warn: "\x1b[93m",
    error: "\x1b[91m",
    done: "\x1b[92m",
    print: "\x1b[37m",
};

fn get_timestamp() -> String {
    Utc::now().format("%Y-%m-%d %H:%M:%S").to_string()
}

fn format_log(tag: &str, color: &str, msg: &str) -> String {
    let mut output: String = String::new();
    write!(
        &mut output,
        "{}{} {}| {}{}{}{} | {}",
        COL.reset,
        get_timestamp(),
        color,
        COL.bold,
        tag,
        COL.reset,
        color,
        msg
    )
    .unwrap_or_default();
    return output;
}

impl Log {
    pub fn debug(msg: &str) {
        println!("{}", format_log("DEBUG", COL.debug, msg));
    }

    pub fn info(msg: &str) {
        println!("{}", format_log("INFO", COL.info, msg));
    }

    pub fn warn(msg: &str) {
        println!("{}", format_log("WARN", COL.warn, msg));
    }

    pub fn error(msg: &str) {
        println!("{}", format_log("ERROR", COL.error, msg));
    }

    pub fn done(msg: &str) {
        println!("{}", format_log("DONE", COL.done, msg));
    }

    pub fn print(msg: &str) {
        println!("{}", format_log(" LOG ", COL.print, msg));
    }
}
