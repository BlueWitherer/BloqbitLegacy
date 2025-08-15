import { BloqbitClient } from '../include.js';

import { Events, WebhookClient } from 'discord.js';

export default {
    name: Events.ShardError,
    once: false,
    /**
     * 
     * @param {BloqbitClient} bot 
     * @param {Error} error
     * @param {number} shardId 
     * 
     * @returns {Promise<void>}
     */
    execute: async (bot, error, shardId) => {
        const date = Math.floor(Date.now() / 1000);
        const devWH = new WebhookClient({ url: bot.dev_wh });

        try {
            console.error(shardId, error, error.stack);

            await devWH.send({
                "avatarURL": bot.client?.user?.displayAvatarURL({ "forceStatic": true, "size": 512, }),
                "embeds": [
                    {
                        "author": {
                            "name": `Shard Error`,
                        },
                        "description": `\`\`\`${error.message}\`\`\``,
                        "color": bot.assets.colors.secondary,
                        "fields": [
                            {
                                "name": "Shard ID",
                                "value": `**\`${shardId}\`**`,
                                "inline": false,
                            },
                            {
                                "name": "Time of Error",
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