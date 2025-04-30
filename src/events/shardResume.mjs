import { BloqbitClient } from '../classes.js';
import { Events, WebhookClient } from 'discord.js';

export default {
    name: Events.ShardResume,
    once: false,
    /**
     * Handles the ShardResume event.
     *
     * @param {BloqbitClient} bot
     * @param {number} shardId
     * @param {number} replayedEvents
     *
     * @returns {Promise<void>}
     */
    execute: async (bot, shardId, replayedEvents) => {
        const devWH = new WebhookClient({ url: bot.dev_wh });

        try {
            console.info(`Shard ${shardId} has resumed. Replayed events: ${replayedEvents}`);

            await devWH.send({
                "avatarURL": bot.client?.user?.displayAvatarURL({ "forceStatic": true, "size": 512 }),
                "embeds": [
                    {
                        "author": {
                            "name": `Shard Resumed`,
                        },
                        "description": `${bot.assets.default.icons.play} Shard \`${shardId}\` has resumed operation.`,
                        "color": bot.assets.colors.primary,
                        "fields": [
                            {
                                "name": "Replayed Events",
                                "value": `**\`${replayedEvents}\`**`,
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