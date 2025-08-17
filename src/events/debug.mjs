import { BloqbitClient, log } from "#bloqbit/include";

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
            log.debug(message);
        } catch (err) {
            log.trace(err);
        };

        return;
    },
};