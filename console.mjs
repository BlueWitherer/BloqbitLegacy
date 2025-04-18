// Save original console methods
const originalConsoleMethods = {
    log: console.log,
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
};

// ANSI escape codes for coloring
const colors = {
    white: '\x1b[37m',    // White for log
    gray: '\x1b[90m',     // Gray for debug
    cyan: '\x1b[36m',     // Cyan for info
    yellow: '\x1b[93m',   // Yellow for warn
    red: '\x1b[91m',      // Red for error
};

// Function to format timestamp
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

// Modify console methods to add tags, timestamps, and coloring
console.log = (...args) => {
    const timestamp = getTimestamp();
    originalConsoleMethods.log(`${colors.white}${timestamp} ${colors.white}[LOG] ${args.join(`${colors.white} `)}${colors.white}`);
};

console.debug = (...args) => {
    const timestamp = getTimestamp();
    originalConsoleMethods.debug(`${colors.white}${timestamp} ${colors.gray}[DEBUG] ${args.join(`${colors.gray} `)}${colors.white}`);
};

console.info = (...args) => {
    const timestamp = getTimestamp();
    originalConsoleMethods.info(`${colors.white}${timestamp} ${colors.cyan}[INFO] ${args.join(`${colors.cyan} `)}${colors.white}`);
};

console.warn = (...args) => {
    const timestamp = getTimestamp();
    originalConsoleMethods.warn(`${colors.white}${timestamp} ${colors.yellow}[WARN] ${args.join(`${colors.yellow} `)}${colors.white}`);
};

console.error = (...args) => {
    const timestamp = getTimestamp();
    originalConsoleMethods.error(`${colors.white}${timestamp} ${colors.red}[ERROR] ${args.join(`${colors.red} `)}${colors.white}`);
};