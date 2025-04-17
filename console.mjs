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
    gray: '\x1b[90m',     // Gray for debug
    cyan: '\x1b[36m',     // Cyan for info
    yellow: '\x1b[33m',   // Yellow for warn
    red: '\x1b[31m',      // Red for error
    reset: '\x1b[0m',     // Reset to default
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
    originalConsoleMethods.log(`${colors.reset}${timestamp} ${colors.reset}[LOG] ${args.join(' ')}${colors.reset}`);
};

console.debug = (...args) => {
    const timestamp = getTimestamp();
    originalConsoleMethods.debug(`${colors.reset}${timestamp} ${colors.gray}[DEBUG] ${args.join(' ')}${colors.reset}`);
};

console.info = (...args) => {
    const timestamp = getTimestamp();
    originalConsoleMethods.info(`${colors.reset}${timestamp} ${colors.cyan}[INFO] ${args.join(' ')}${colors.reset}`);
};

console.warn = (...args) => {
    const timestamp = getTimestamp();
    originalConsoleMethods.warn(`${colors.reset}${timestamp} ${colors.yellow}[WARN] ${args.join(' ')}${colors.reset}`);
};

console.error = (...args) => {
    const timestamp = getTimestamp();
    originalConsoleMethods.error(`${colors.reset}${timestamp} ${colors.red}[ERROR] ${args.join(' ')}${colors.reset}`);
};