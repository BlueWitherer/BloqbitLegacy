import "./console.mjs";

process.on('uncaughtException', (err) => {
    console.error('Unhandled Exception:', err.stack);
});

process.on('unhandledRejection', (reason) => {
    if (reason instanceof Error) {
        console.trace('Unhandled Rejection:', reason.stack || 'No stack trace available');
    } else {
        console.error('Unhandled Rejection:', reason);
    };
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

    const noEnv = (env: string): string => { throw new Error(`Environment variable ${env} is not defined`); }

    const botModel = new BloqbitClient(
        process.env.MAIN_TOKEN || noEnv('MAIN_TOKEN'),
        process.env.MAIN_LOG_WH || noEnv('MAIN_LOG_WH'),
        process.env.MONGO_URI || noEnv('MONGO_URI'),
        process.env.MAIN_SECRET || undefined,
    );

    const SERVER_IP = (process.env.APP_HOST || process.env.REDIS_HOST || process.env.IP || process.env.SERVER_IP) || "0.0.0.0";
    const SERVER_PORT = parseInt((process.env.APP_PORT || process.env.REDIS_PORT || process.env.PORT || process.env.SERVER_PORT) || '3000');

    const server = http.createServer(async (req, res) => {
        console.debug(`Request details:\n      URL: ${req.url}\n      Method: ${req.method}\n      Headers:`, req.rawHeaders.map((h, i) => {
            return i % 2 === 0 ? `\n            ${h}: ${req.rawHeaders[i + 1]}` : null;
        }).filter((h) => h !== null));

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Server is running\n');
    });

    try {
        const cacheModule = (await import('./src/cache.mjs')).default;

        const src = new Bot();
        const bot = await src.activate(botModel, false);

        server.listen(SERVER_PORT, () => {
            console.log(`Server running on IP address ${SERVER_IP} with port ${SERVER_PORT}`);
        });

        setInterval(async () => {
            try {
                await cacheModule.flushToDb(botModel.db);
            } catch (err) {
                console.trace(err);
            } finally {
                console.debug('Cache flushed to database');
            };
        }, 3600000); // 60 min

        process.on('SIGINT', async () => {
            console.warn('Received SIGINT. Shutting down gracefully...');

            try {
                server.close(async () => {
                    try {
                        await cacheModule.flushToDb(botModel.db);
                        await bot.client?.destroy();
                    } catch (err) {
                        console.trace(err);
                    } finally {
                        console.log('Server has been stopped');
                        process.exit(0);
                    };
                });
            } catch (err) {
                console.trace(err);
                process.exit(1);
            };
        });

        process.on('SIGTERM', async () => {
            console.warn('Received SIGTERM. Shutting down gracefully...');

            try {
                server.close(async () => {
                    try {
                        await cacheModule.flushToDb(botModel.db);
                        await bot.client?.destroy();
                    } catch (err) {
                        console.trace(err);
                    } finally {
                        console.log('Server has been stopped');
                        process.exit(0);
                    };
                });
            } catch (err) {
                console.trace(err);
                process.exit(1);
            };
        });
    } catch (err) {
        console.trace(err);
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