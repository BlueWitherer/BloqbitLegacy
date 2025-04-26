import "./console.mjs";

console.debug('Testing system...');

import { BloqbitClient } from './src/classes.js';

import dotenv from 'dotenv';

dotenv.config();

const start = async () => {
    const Bot = (await import('./src/index.js')).default;

    const botModel = new BloqbitClient(
        process.env.TEST_TOKEN ?? (() => { throw new Error('TEST_TOKEN is not defined'); })(),
        process.env.TEST_SECRET ?? (() => { throw new Error('TEST_SECRET is not defined'); })(),
        process.env.TEST_LOG_WH ?? (() => { throw new Error('TEST_LOG_WH is not defined'); })(),
        process.env.MONGO_URI ?? (() => { throw new Error('MONGO_URI is not defined'); })(),
        process.env.TEST_GUILDED_TOKEN ?? (() => { throw new Error('TEST_GUILDED_TOKEN is not defined'); })()
    );

    const src = new Bot();
    return await src.activate(botModel, true);
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