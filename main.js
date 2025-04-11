process.on('uncaughtException', (err) => {
    console.error('Unhandled Exception:', err);
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});

console.log('Starting up system...');

import dotenv from 'dotenv';

import { BloqbitClient } from './src/classes.mjs';
import Bot from './src/index.js';

dotenv.config();

const botModel = new BloqbitClient(process.env.PUBLIC_TOKEN, process.env.PUBLIC_TOKEN, process.env.LOG_WH, process.env.MONGO_URI);
botModel.rest.setToken(process.env.PUBLIC_TOKEN);

const start = async () => {
    const src = new Bot();
    return await src.activate(botModel, false);
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