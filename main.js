import "./console.mjs";

process.on('uncaughtException', (err) => {
    console.error('Unhandled Exception:', err);
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});

console.log('Starting up system...');

import http from 'http';
import dotenv from 'dotenv';

import { BloqbitClient } from './src/classes.mjs';
import Bot from './src/index.js';

dotenv.config();

const botModel = new BloqbitClient(process.env.MAIN_TOKEN, process.env.MAIN_SECRET, process.env.MAIN_LOG_WH, process.env.MONGO_URI, process.env.MAIN_GUILDED_TOKEN);

const PORT = parseInt(process.env.PORT) || 3000;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Server is running\n');
});

const start = async () => {
    try {
        const src = new Bot();
        const bot = await src.activate(botModel, false);

        server.listen(PORT, () => {
            console.info(`Server is running on port ${PORT}`);
        });

        process.on('SIGINT', async () => {
            console.info('Received SIGINT. Shutting down gracefully...');

            server.close(async () => {
                console.info('Server has been stopped');

                await bot.client?.destroy();
                process.exit(0);
            });
        });

        process.on('SIGTERM', async () => {
            console.info('Received SIGTERM. Shutting down gracefully...');

            server.close(async () => {
                console.info('Server has been stopped');

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
        return console.error(err);
    } finally {
        return;
    };
})();