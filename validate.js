console.log('Testing system...');

import dotenv from 'dotenv';

import { ClientModel } from './src/classes.mjs';
import StartClient from './src/index.js';

dotenv.config();

const botModel = new ClientModel(process.env.TEST_TOKEN, process.env.TEST_SECRET);
botModel.rest.setToken(process.env.TEST_TOKEN);

const start = async () => {
    const src = new StartClient();
    return await src.activate(botModel, true);
};

(async () => {
    try {
        await start();
    } catch (error) {
        return console.error(error);
    };
})();