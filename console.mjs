// Save original console methods
const cons = {
    debug: console.debug,
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
};

// ANSI escape codes for coloring
const col = {
    gray: '\x1b[90m',     // Gray for debug
    white: '\x1b[37m',    // White for log
    cyan: '\x1b[36m',     // Cyan for info
    yellow: '\x1b[93m',   // Yellow for warn
    red: '\x1b[91m',      // Red for error
    bold: '\x1b[1m',      // Bold text
    reset: '\x1b[0m',     // Reset to default
};

/**
 * Function to format time
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
 * Helper to recolor multi-line logs
 * 
 * @param {string} text 
 * @param {string} color 
 * 
 * @returns {string}
 */
const recolorMultilineLog = (text, color) => {
    const lines = text.split('\n');
    return lines.map(line => `${color}${line}${col.reset}`).join('\n');
};

// Override console methods to add tags, timestamps, and recoloring
console.debug = (...args) => {
    const time = timeStamp();
    const text = args.join(' ');
    const msg = recolorMultilineLog(text, col.gray);

    cons.debug(`${time}${col.gray} | ${col.bold}DEBUG${col.reset}${col.gray} | ${msg}${col.reset}`);
};

console.log = (...args) => {
    const time = timeStamp();
    const text = args.join(' ');
    const msg = recolorMultilineLog(text, col.white);

    cons.log(`${time}${col.white} | ${col.bold}LOG  ${col.reset}${col.white} | ${msg}${col.reset}`);
};

console.info = (...args) => {
    const time = timeStamp();
    const text = args.join(' ');
    const msg = recolorMultilineLog(text, col.cyan);

    cons.info(`${time}${col.cyan} | ${col.bold}INFO ${col.reset}${col.cyan} | ${msg}${col.reset}`);
};

console.warn = (...args) => {
    const time = timeStamp();
    const text = args.join(' ');
    const msg = recolorMultilineLog(text, col.yellow);

    cons.warn(`${time}${col.yellow} | ${col.bold}WARN ${col.reset}${col.yellow} | ${msg}${col.reset}`);
};

console.error = (...args) => {
    const time = timeStamp();
    const text = args.join(' ');
    const msg = recolorMultilineLog(text, col.red);

    cons.error(`${time}${col.red} | ${col.bold}ERROR${col.reset}${col.red} | ${msg}${col.reset}`);
};