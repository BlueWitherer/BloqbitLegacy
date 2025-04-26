import { BloqbitClient } from '../classes.js';
import { Events } from 'discord.js';

export default {
    name: Events.Debug,
    once: false,
    /**
     * 
     * @param {BloqbitClient} bot 
     * @param {string} message 
     * 
     * @returns {Promise<void>}
     */
    execute: async (bot, message) => {
        try {
            console.debug(message);
        } catch (err) {
            console.error(err);
        };

        return;
    },
};