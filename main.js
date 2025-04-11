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

        server.listen(PORT, () => {
            console.info(`Server is running on port ${PORT}`);
        });

        // Handle graceful shutdown signals (e.g., SIGINT, SIGTERM)
        process.on('SIGINT', async () => {
            console.info('Received SIGINT. Shutting down gracefully...');

            server.close(() => {
                console.info('Server has been stopped.');
                process.exit(0); // Exit with success code
            });
        });

        process.on('SIGTERM', async () => {
            console.info('Received SIGTERM. Shutting down gracefully...');

            server.close(() => {
                console.info('Server has been stopped.');
                process.exit(0); // Exit with success code
            });
        });

        return await src.activate(botModel, false);
    } catch (err) {
        console.error(`Failed to start the server - ${err}`);
        process.exit(1); // Exit with error code
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