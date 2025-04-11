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

const botModel = new BloqbitClient(process.env.PUBLIC_TOKEN, process.env.PUBLIC_TOKEN, process.env.LOG_WH, process.env.MONGO_URI);
botModel.rest.setToken(process.env.PUBLIC_TOKEN);

// Get the port from the environment or default to 3000
const PORT = parseInt(process.env.PORT) ?? 3000;

// Create the HTTP server with modern async syntax
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Server is running.\n');
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

            server.close(() => {
                console.info('Server has been stopped.');

                bot.client.destroy();
                process.exit(0);
            });
        });

        process.on('SIGTERM', async () => {
            console.info('Received SIGTERM. Shutting down gracefully...');

            server.close(() => {
                console.info('Server has been stopped.');

                bot.client.destroy();
                process.exit(0);
            });
        });
    } catch (err) {
        console.error(`Failed to start the server - ${err}`);
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