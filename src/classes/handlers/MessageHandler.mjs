import { Message, Client, PermissionsBitField, PermissionFlagsBits, Events } from 'discord.js';
import cache from '../../cache.mjs';
import moderation from '../../modules/moderation.mjs';
import { Config } from 'classes.mjs';

export default class MessageHandler {
    /**
     * 
     * @param {Client} client Discord bot client.
     */
    constructor(client) {
        console.debug("Initiating global message handler...");

        client.on(Events.MessageCreate, async (m) => {
            const s = cache.fetch(m.guild?.id);

            if (s && m) {
                console.debug(`Handling message of ID ${m.id}...`);
                await this.messageSend(s, m);
            };
        });
    };

    /**
     * @param {Config} system Server settings.
     * @param {Message} message Discord message.
     */
    messageSend = async (system, message) => {
        if (message.guild) {
            if (message.author.bot) {
                return;
            } else {
                const inF = moderation.inFilter(system, message);
                const liF = moderation.elFilter(system, message);
                const blF = moderation.blFilter(system, message);
                const dtF = moderation.dtFilter(system, message);

                if (inF.punishment >= 1) return await moderation.punish(inF.punishment, message, inF.warning.value);
                if (liF.punishment >= 1) return await moderation.punish(liF.punishment, message, liF.warning.value);
                if (blF.punishment >= 1) return await moderation.punish(blF.punishment, message, blF.warning.value);
                if (dtF.punishment >= 1) return await moderation.punish(dtF.punishment, message, dtF.warning.value);
            };
        };
    };
};