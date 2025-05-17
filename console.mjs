const cons = {
    debug: console.debug,
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
};

const col = {
    gray: '\x1b[90m', // debug
    white: '\x1b[37m', // log
    cyan: '\x1b[36m', // info
    yellow: '\x1b[93m', // warn
    red: '\x1b[91m', // error
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

// Override OG console methods to add formatting
console.debug = (...args) => {
    const time = timeStamp();
    cons.debug(logMsg(time, col.gray, 'DEBUG', ...args));
};

console.log = (...args) => {
    const time = timeStamp();
    cons.log(logMsg(time, col.white, ' LOG ', ...args));
};

console.info = (...args) => {
    const time = timeStamp();
    cons.info(logMsg(time, col.cyan, ' INFO', ...args));
};

console.warn = (...args) => {
    const time = timeStamp();
    cons.warn(logMsg(time, col.yellow, ' WARN', ...args));
};

console.error = (...args) => {
    const time = timeStamp();
    cons.error(logMsg(time, col.red, 'ERROR', ...args));
};