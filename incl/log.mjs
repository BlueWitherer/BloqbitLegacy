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
 * @param {string} t Text
 * @param {string} c Color code
 * 
 * @returns {string}
 */
const formatLog = (t, c) => {
    const lines = t.split('\n');
    return lines.map((ln) => `${c}${ln}${col.reset}`).join('\n');
};

/**
 * Get fully formatted log message
 * 
 * @param {string} time Timestamp
 * @param {string} color Color code
 * @param {string} tag Log level
 * @param {[message?: any, ...optionalParams: any[]]} args All arguments
 * 
 * @returns {string}
 */
const logMsg = (time, color, tag, ...args) => {
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
     * @param  {...any} args 
     */
    static print = (...args) => {
        console.log(logMsg(timeStamp(), col.white, ' LOG ', ...args));
    };

    /**
     * Debug log
     * @param  {...any} args 
     */
    static debug = (...args) => {
        console.debug(logMsg(timeStamp(), col.gray, 'DEBUG', ...args));
    };

    /**
     * Info log
     * @param  {...any} args 
     */
    static info = (...args) => {
        console.info(logMsg(timeStamp(), col.cyan, 'INFO', ...args));
    };

    /**
     * Done log
     * @param  {...any} args 
     */
    static done = (...args) => {
        console.log(logMsg(timeStamp(), col.green, 'DONE', ...args));
    };

    /**
     * Warn log
     * @param  {...any} args 
     */
    static warn = (...args) => {
        console.warn(logMsg(timeStamp(), col.yellow, 'WARN', ...args));
    };

    /**
     * Error log
     * @param  {...any} args 
     */
    static error = (...args) => {
        console.error(logMsg(timeStamp(), col.red, 'ERROR', ...args));
    };

    /**
     * Trace log
     * @param  {...any} args 
     */
    static trace = (...args) => {
        console.trace(logMsg(timeStamp(), col.gray, 'TRACE', ...args));
    };
};