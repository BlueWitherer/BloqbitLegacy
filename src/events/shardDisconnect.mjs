import { BloqbitClient } from '../classes.js';
import { Events, WebhookClient } from 'discord.js';

export default {
    name: Events.ShardDisconnect,
    once: false,
    /**
     * 
     * @param {BloqbitClient} bot
     * @param {import('discord.js').CloseEvent} closeEvent
     * @param {number} shardId
     *
     * @returns {Promise<void>}
     */
    execute: async (bot, closeEvent, shardId) => {
        const date = Math.floor(Date.now() / 1000);
        const devWH = new WebhookClient({ url: bot.dev_wh });

        try {
            console.warn(`Shard ${shardId} disconnected. Code: ${closeEvent.code}`);

            await devWH.send({
                "avatarURL": bot.client?.user?.displayAvatarURL({ "forceStatic": true, "size": 512 }),
                "embeds": [
                    {
                        "author": {
                            "name": `Shard Disconnected`,
                        },
                        "description": `${bot.assets.default.icons.stop} Shard \`${shardId}\` has disconnected.`,
                        "color": bot.assets.colors.secondary,
                        "fields": [
                            {
                                "name": "Close Code",
                                "value": `**\`${closeEvent.code}\`**`,
                                "inline": true,
                            },
                            {
                                "name": "Time of Disconnection",
                                "value": `<t:${date}:F> • <t:${date}:R>`,
                                "inline": false,
                            },
                        ],
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