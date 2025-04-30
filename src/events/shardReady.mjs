import { BloqbitClient } from '../classes.js';

import { Events, WebhookClient } from 'discord.js';

export default {
    name: Events.ShardReady,
    once: false,
    /**
     * 
     * @param {BloqbitClient} bot
     * @param {number} shardId
     * @param {Set<import('discord.js').Snowflake>} unavailableGuilds
     *
     * @returns {Promise<void>}
     */
    execute: async (bot, shardId, unavailableGuilds) => {
        const devWH = new WebhookClient({ url: bot.dev_wh });

        try {
            console.info(`Shard ${shardId} is ready. Unavailable guilds: ${unavailableGuilds.size}`);

            await devWH.send({
                "avatarURL": bot.client?.user?.displayAvatarURL({ "forceStatic": true, "size": 512 }),
                "embeds": [
                    {
                        "author": {
                            "name": `Shard Ready`,
                        },
                        "description": `${bot.assets.default.icons.record} Shard \`${shardId}\` is now ready.`,
                        "color": bot.assets.colors.primary,
                        "fields": [
                            {
                                "name": "Shard ID",
                                "value": `**\`${shardId}\`**`,
                                "inline": false,
                            },
                            {
                                "name": "Unavailable Guilds",
                                "value": unavailableGuilds.size > 0
                                    ? `**\`${unavailableGuilds.size}\`** guild(s) unavailable.`
                                    : "No unavailable guilds.",
                                "inline": true,
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