console.log('Testing system...');

import dotenv from 'dotenv';

import { BloqbitClient } from './src/classes.mjs';
import Bot from './src/index.js';

dotenv.config();

const botModel = new BloqbitClient(process.env.TEST_TOKEN, process.env.TEST_SECRET, process.env.LOG_WH, process.env.MONGO_URI);
botModel.rest.setToken(process.env.TEST_TOKEN);

const start = async () => {
    const src = new Bot();
    return await src.activate(botModel, true);
};

(async () => {
    try {
        await start();
    } catch (error) {
        return console.error(error);
    } finally {
        return;
    };
})();