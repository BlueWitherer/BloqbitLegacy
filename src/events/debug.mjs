import ClientModel from '../classes/ClientModel.mjs';
import { Events, WebhookClient } from 'discord.js';

export default {
    name: Events.Debug,
    once: false,
    /**
     * 
     * @param {ClientModel} bot 
     * @param {string} message 
     * 
     * @returns {void}
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