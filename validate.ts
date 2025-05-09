import "./console.mjs";

console.debug('Testing system...');

import { BloqbitClient } from './src/classes.js';

import dotenv from 'dotenv';

dotenv.config();

const start = async () => {
    const Bot = (await import('./src/index.js')).default;

    const botModel = new BloqbitClient(
        process.env.TEST_TOKEN ?? "",
        process.env.TEST_LOG_WH ?? "",
        process.env.MONGO_URI ?? "",
        process.env.TEST_SECRET ?? "",
    );

    const src = new Bot({ botModel: botModel });
    return await src.activate(true);
};

(async () => {
    try {
        await start();
    } catch (err) {
        console.trace(err);
    } finally {
        return;
    };
})();