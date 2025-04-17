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
    cyan: '\x1b[36m',     // Cyan for info
    yellow: '\x1b[33m',   // Yellow for warn
    red: '\x1b[31m',      // Red for error
    reset: '\x1b[0m',     // Reset to default
};

// Function to format timestamp
const getTimestamp = () => {
    return new Date().toISOString();
};

// Override console methods to add tags, timestamps, and coloring
console.log = (...args) => {
    const timestamp = getTimestamp();
    originalConsoleMethods.log(`${colors.reset}${timestamp} ${colors.reset}[LOG] ${args.join(' ')}${colors.reset}`); // No color for log
};

console.debug = (...args) => {
    const timestamp = getTimestamp();
    originalConsoleMethods.debug(`${colors.reset}${timestamp} ${colors.reset}[DEBUG] ${args.join(' ')}${colors.reset}`); // No color for debug
};

console.info = (...args) => {
    const timestamp = getTimestamp();
    originalConsoleMethods.info(`${colors.reset}${timestamp} ${colors.cyan}[INFO] ${args.join(' ')}${colors.reset}`); // Cyan, reset at end
};

console.warn = (...args) => {
    const timestamp = getTimestamp();
    originalConsoleMethods.warn(`${colors.reset}${timestamp} ${colors.yellow}[WARN] ${args.join(' ')}${colors.reset}`); // Yellow, reset at end
};

console.error = (...args) => {
    const timestamp = getTimestamp();
    originalConsoleMethods.error(`${colors.reset}${timestamp} ${colors.red}[ERROR] ${args.join(' ')}${colors.reset}`); // Red, reset at end
};