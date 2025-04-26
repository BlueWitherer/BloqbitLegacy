import { Message, Client, Events } from 'discord.js';
import cache from '../../cache.mjs';
import moderation from '../../modules/moderation.mjs';
import { Config, SaveDataClient } from '../../classes.js';

class MessageHandler {
    /**
     * Creates a new instance of MessageHandler.
     * @param client - Discord bot client.
     * @param db - Database settings.
     */
    constructor(client: Client, db: SaveDataClient) {
        console.debug("Initiating global message handler...");

        client.on(Events.MessageCreate, async (m: Message) => {
            const s = await cache.fetch(m.guild?.id ?? '', db);

            if (s && m) {
                console.debug(`Handling message of ID ${m.id}...`);
                await this.messageSend(s, m);
            }
        });
    }

    /**
     * Handles a message sent in a server.
     * @param system - Server settings.
     * @param message - Discord message.
     */
    messageSend = async (system: Config, message: Message): Promise<void> => {
        if (message.guild) {
            if (message.author.bot) {
                return;
            } else {
                moderation.antiMessages(message);

                const inF = moderation.inFilter(system, message);
                const liF = moderation.elFilter(system, message);
                const blF = moderation.blFilter(system, message);
                const dtF = moderation.dtFilter(system, message);

                if (inF.punishment >= 1) return await moderation.punish(inF.punishment, message, inF.warning.value);
                if (liF.punishment >= 1) return await moderation.punish(liF.punishment, message, liF.warning.value);
                if (blF.punishment >= 1) return await moderation.punish(blF.punishment, message, blF.warning.value);
                if (dtF.punishment >= 1) return await moderation.punish(dtF.punishment, message, dtF.warning.value);
            }
        }
    };
}

export default MessageHandler;