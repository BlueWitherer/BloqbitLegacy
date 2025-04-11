console.log('Testing system...');

import dotenv from 'dotenv';

import { BloqbitClient } from './src/classes.mjs';
import Bot from './src/index.js';

dotenv.config();

const botModel = new BloqbitClient(process.env.TEST_TOKEN, process.env.TEST_SECRET, process.env.TEST_LOG_WH, process.env.MONGO_URI, process.env.TEST_GUILDED_TOKEN);

const start = async () => {
    const src = new Bot();
    return await src.activate(botModel, true);
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