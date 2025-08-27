/**
 * @enum Log levels.
 */
export enum LogLevel {
    TRACE = 0,
    DEBUG = 1,
    INFO = 2,
    WARN = 3,
    ERROR = 4,
    DONE = 5,
    PRINT = 6,
};

/**
 * Get the current set log level.
 */
const getLogLevel = (): number => {
    const env = process.env.LOG_LEVEL || "trace";
    const level = env.normalize().toLowerCase(); // super safe !

    switch (level) {
        case "trace":
            return 0;

        case "debug":
            return 1;

        case "info":
            return 2;

        case "warn":
            return 3;

        case "error":
            return 4;

        case "done":
            return 5;

        case "print":
            return 6;

        default:
            return 0;
    };
};

const logLevel = getLogLevel();

/**
 * Colors and formatting for console logs
 */
export class LogFormat {
    public static gray = '\x1b[90m'; // debug
    public static white = '\x1b[37m'; // log
    public static cyan = '\x1b[36m'; // info
    public static yellow = '\x1b[93m'; // warn
    public static red = '\x1b[91m'; // error
    public static green = '\x1b[92m'; // done
    public static bold = '\x1b[1m'; // tag
    public static reset = '\x1b[0m'; // default
};

/**
 * Format time
 */
const timeStamp = (): string => {
    const now = new Date();

    const yyyy = now.getUTCFullYear();
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(now.getUTCDate()).padStart(2, '0');
    const h = String(now.getUTCHours()).padStart(2, '0');
    const m = String(now.getUTCMinutes()).padStart(2, '0');
    const s = String(now.getUTCSeconds()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd} ${h}:${m}:${s} UTC`;
};

/**
 * Format multi-line logs
 * 
 * @param t Text
 * @param c Color code
 */
const formatLog = (t: string, c: LogFormat): string => {
    const lines = t.split('\n');
    return lines.map((ln) => `${c}${ln}${LogFormat.reset}`).join('\n');
};

/**
 * Get fully formatted log message
 * 
 * @param time Timestamp
 * @param color Color code
 * @param tag Log level
 * @param args All arguments
 */
const logMsg = (time: string, color: LogFormat, tag: string, ...args: [message?: any, ...optionalParams: any[]]): string => {
    const txt = args.join(' ');
    const msg = formatLog(txt, color);

    return `${time}${color} | ${LogFormat.bold}${tag}${LogFormat.reset}${color} | ${msg}${LogFormat.reset}`;
};

/**
 * Custom console methods with formatting
 */
export default class log {
    /**
     * Trace log
     * @param args
     */
    public static trace = (...args: any): void => {
        if (logLevel <= LogLevel.TRACE) console.trace(logMsg(timeStamp(), LogFormat.red, 'TRACE', ...args));
    };

    /**
     * Debug log
     * @param args 
     */
    public static debug = (...args: any): void => {
        if (logLevel <= LogLevel.DEBUG) console.debug(logMsg(timeStamp(), LogFormat.gray, 'DEBUG', ...args));
    };

    /**
     * Info log
     * @param args
     */
    public static info = (...args: any): void => {
        if (logLevel <= LogLevel.INFO) console.info(logMsg(timeStamp(), LogFormat.cyan, 'INFO', ...args));
    };

    /**
     * Warn log
     * @param args
     */
    public static warn = (...args: any): void => {
        if (logLevel <= LogLevel.WARN) console.warn(logMsg(timeStamp(), LogFormat.yellow, 'WARN', ...args));
    };

    /**
     * Error log
     * @param args
     */
    public static error = (...args: any): void => {
        if (logLevel <= LogLevel.ERROR) console.error(logMsg(timeStamp(), LogFormat.red, 'ERROR', ...args));
    };

    /**
     * Done log
     * @param args
     */
    public static done = (...args: any): void => {
        if (logLevel <= LogLevel.DONE) console.log(logMsg(timeStamp(), LogFormat.green, 'DONE', ...args));
    };

    /**
     * Print log
     * @param args 
     */
    public static print = (...args: any): void => {
        if (logLevel <= LogLevel.PRINT) console.log(logMsg(timeStamp(), LogFormat.white, ' LOG ', ...args));
    };
};