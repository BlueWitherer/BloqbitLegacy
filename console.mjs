// save og console methods
const cons = {
    debug: console.debug,
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
};

const col = {
    gray: '\x1b[90m',     // debug
    white: '\x1b[37m',    // log
    cyan: '\x1b[36m',     // info
    yellow: '\x1b[93m',   // warn
    red: '\x1b[91m',      // error
    bold: '\x1b[1m',      // tag
    reset: '\x1b[0m',     // default
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
 * Recolor multi-line logs
 * 
 * @param {string} t Text to recolor
 * @param {string} c Color code to apply
 * 
 * @returns {string}
 */
const fullRecolor = (t, c) => {
    const lines = t.split('\n');
    return lines.map((ln) => `${c}${ln}${col.reset}`).join('\n');
};

// Override console methods to add tags, timestamps, and recoloring
console.debug = (...args) => {
    const time = timeStamp();
    const text = args.join(' ');
    const msg = fullRecolor(text, col.gray);

    cons.debug(`${time}${col.gray} | ${col.bold}DEBUG${col.reset}${col.gray} | ${msg}${col.reset}`);
};

console.log = (...args) => {
    const time = timeStamp();
    const text = args.join(' ');
    const msg = fullRecolor(text, col.white);

    cons.log(`${time}${col.white} | ${col.bold} LOG ${col.reset}${col.white} | ${msg}${col.reset}`);
};

console.info = (...args) => {
    const time = timeStamp();
    const text = args.join(' ');
    const msg = fullRecolor(text, col.cyan);

    cons.info(`${time}${col.cyan} | ${col.bold} INFO${col.reset}${col.cyan} | ${msg}${col.reset}`);
};

console.warn = (...args) => {
    const time = timeStamp();
    const text = args.join(' ');
    const msg = fullRecolor(text, col.yellow);

    cons.warn(`${time}${col.yellow} | ${col.bold} WARN${col.reset}${col.yellow} | ${msg}${col.reset}`);
};

console.error = (...args) => {
    const time = timeStamp();
    const text = args.join(' ');
    const msg = fullRecolor(text, col.red);

    cons.error(`${time}${col.red} | ${col.bold}ERROR${col.reset}${col.red} | ${msg}${col.reset}`);
};