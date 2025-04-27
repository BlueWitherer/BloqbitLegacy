import "./console.mjs";

process.on('uncaughtException', (err) => {
    console.error('Unhandled Exception:', err.message, err.stack);
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});

process.on('warning', (warning) => {
    console.warn('Warning detected:', warning.name, warning.message, warning.stack);
});

if (global.gc) {
    global.gc();

    console.debug('Garbage collection triggered manually');
} else {
    console.warn('Garbage collection is not exposed. Use --expose-gc to enable it.');
};

console.log('Starting system...');

import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const start = async () => {
    const { BloqbitClient } = await import('./src/classes.js');
    const Bot = (await import('./src/index.js')).default;

    const botModel = new BloqbitClient(
        process.env.MAIN_TOKEN || (() => { throw new Error('MAIN_TOKEN is not defined'); })(),
        process.env.MAIN_SECRET || (() => { throw new Error('MAIN_SECRET is not defined'); })(),
        process.env.MAIN_LOG_WH || (() => { throw new Error('MAIN_LOG_WH is not defined'); })(),
        process.env.MONGO_URI || (() => { throw new Error('MONGO_URI is not defined'); })(),
        process.env.MAIN_GUILDED_TOKEN || "",
    );

    const PORT = parseInt(process.env.PORT || '3000');

    const server = http.createServer((req, res) => {
        console.debug(`Request details:\nURL: ${req.url}\nMethod: ${req.method}\nHeaders:`, req.headers);

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Server is running\n');
    });

    try {
        const src = new Bot();
        const bot = await src.activate(botModel, false);

        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        process.on('SIGINT', async () => {
            console.warn('Received SIGINT. Shutting down gracefully...');

            server.close(async () => {
                console.log('Server has been stopped');

                await bot.client?.destroy();
                process.exit(0);
            });
        });

        process.on('SIGTERM', async () => {
            console.warn('Received SIGTERM. Shutting down gracefully...');

            server.close(async () => {
                console.log('Server has been stopped');

                await bot.client?.destroy();
                process.exit(0);
            });
        });
    } catch (err) {
        console.error(`Failed to start the server: ${err}`);
        process.exit(1);
    };
};

(async () => {
    try {
        await start();
    } catch (err) {
        console.trace(err);
        return;
    } finally {
        return;
    };
})();