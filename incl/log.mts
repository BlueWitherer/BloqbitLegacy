/**
 * Colors and formatting for console logs
 */
const col = {
    gray: '\x1b[90m', // debug
    white: '\x1b[37m', // log
    cyan: '\x1b[36m', // info
    yellow: '\x1b[93m', // warn
    red: '\x1b[91m', // error
    green: '\x1b[92m', // done
    bold: '\x1b[1m', // tag
    reset: '\x1b[0m', // default
};

/**
 * Format time
 * 
 * @returns {string}
 */
const timeStamp = () => {
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
const formatLog = (t: string, c: string): string => {
    const lines = t.split('\n');
    return lines.map((ln) => `${c}${ln}${col.reset}`).join('\n');
};

/**
 * Get fully formatted log message
 * 
 * @param time Timestamp
 * @param color Color code
 * @param tag Log level
 * @param args All arguments
 */
const logMsg = (time: string, color: string, tag: string, ...args: [message?: any, ...optionalParams: any[]]): string => {
    const txt = args.join(' ');
    const msg = formatLog(txt, color);

    return `${time}${color} | ${col.bold}${tag}${col.reset}${color} | ${msg}${col.reset}`;
};

/**
 * Custom console methods with formatting
 */
export default class log {
    /**
     * Print log
     * @param args 
     */
    static print = (...args: any) => {
        console.log(logMsg(timeStamp(), col.white, ' LOG ', ...args));
    };

    /**
     * Debug log
     * @param args 
     */
    static debug = (...args: any) => {
        console.debug(logMsg(timeStamp(), col.gray, 'DEBUG', ...args));
    };

    /**
     * Info log
     * @param args
     */
    static info = (...args: any) => {
        console.info(logMsg(timeStamp(), col.cyan, 'INFO', ...args));
    };

    /**
     * Done log
     * @param args
     */
    static done = (...args: any) => {
        console.log(logMsg(timeStamp(), col.green, 'DONE', ...args));
    };

    /**
     * Warn log
     * @param args
     */
    static warn = (...args: any) => {
        console.warn(logMsg(timeStamp(), col.yellow, 'WARN', ...args));
    };

    /**
     * Error log
     * @param args
     */
    static error = (...args: any) => {
        console.error(logMsg(timeStamp(), col.red, 'ERROR', ...args));
    };

    /**
     * Trace log
     * @param args
     */
    static trace = (...args: any) => {
        console.trace(logMsg(timeStamp(), col.gray, 'TRACE', ...args));
    };
};