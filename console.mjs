// Save original console methods
const originalConsoleMethods = {
    debug: console.debug,
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
};

// ANSI escape codes for coloring
const colors = {
    gray: '\x1b[90m',     // Gray for debug
    white: '\x1b[37m',    // White for log
    cyan: '\x1b[36m',     // Cyan for info
    yellow: '\x1b[93m',   // Yellow for warn
    red: '\x1b[91m',      // Red for error
    bold: '\x1b[1m',      // Bold text
    reset: '\x1b[0m',     // Reset to default
};

/**
 * Function to format timestamp
 * 
 * @returns {string}
 */
const getTimestamp = () => {
    const now = new Date();

    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
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
    return lines.map(line => `${color}${line}${colors.reset}`).join('\n');
};

// Override console methods to add tags, timestamps, and recoloring
console.debug = (...args) => {
    const timestamp = getTimestamp();
    const message = args.join(' ');
    const recolored = recolorMultilineLog(message, colors.gray);

    if (message) originalConsoleMethods.debug(`${timestamp}${colors.gray} | ${colors.bold}DEBUG${colors.reset}${colors.gray} | ${recolored}${colors.reset}`);
};

console.log = (...args) => {
    const timestamp = getTimestamp();
    const message = args.join(' ');
    const recolored = recolorMultilineLog(message, colors.white);

    if (message) originalConsoleMethods.log(`${timestamp}${colors.white} | ${colors.bold}LOG  ${colors.reset}${colors.white} | ${recolored}${colors.reset}`);
};

console.info = (...args) => {
    const timestamp = getTimestamp();
    const message = args.join(' ');
    const recolored = recolorMultilineLog(message, colors.cyan);

    if (message) originalConsoleMethods.info(`${timestamp}${colors.cyan} | ${colors.bold}INFO ${colors.reset}${colors.cyan} | ${recolored}${colors.reset}`);
};

console.warn = (...args) => {
    const timestamp = getTimestamp();
    const message = args.join(' ');
    const recolored = recolorMultilineLog(message, colors.yellow);

    if (message) originalConsoleMethods.warn(`${timestamp}${colors.yellow} | ${colors.bold}WARN ${colors.reset}${colors.yellow} | ${recolored}${colors.reset}`);
};

console.error = (...args) => {
    const timestamp = getTimestamp();
    const message = args.join(' ');
    const recolored = recolorMultilineLog(message, colors.red);

    if (message) originalConsoleMethods.error(`${timestamp}${colors.red} | ${colors.bold}ERROR${colors.reset}${colors.red} | ${recolored}${colors.reset}`);
};