import { BloqbitClient } from '../classes.js';

import { Events, WebhookClient } from 'discord.js';

export default {
    name: Events.ShardReconnecting,
    once: false,
    /**
     *
     * @param {BloqbitClient} bot
     * @param {number} shardId
     *
     * @returns {Promise<void>}
     */
    execute: async (bot, shardId) => {
        const devWH = new WebhookClient({ url: bot.dev_wh });

        try {
            console.info(`Shard ${shardId} is reconnecting...`);

            await devWH.send({
                "avatarURL": bot.client?.user?.displayAvatarURL({ "forceStatic": true, "size": 512 }),
                "embeds": [
                    {
                        "author": {
                            "name": `Shard Reconnecting`,
                        },
                        "description": `${bot.assets.default.icons.update} Shard \`${shardId}\` is attempting to reconnect.`,
                        "color": bot.assets.colors.tertiary,
                        "footer": {
                            "text": bot.client?.user?.username ?? '',
                            "icon_url": bot.client?.user?.displayAvatarURL({ "forceStatic": false, "size": 128 }),
                        },
                    },
                ],
            });
        } catch (err) {
            console.trace(err);
        };

        return;
    },
};