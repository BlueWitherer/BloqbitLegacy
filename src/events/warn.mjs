import { BloqbitClient } from '../classes.js';

import { Events, WebhookClient } from 'discord.js';

export default {
    name: Events.Warn,
    once: false,
    /**
     * 
     * @param {BloqbitClient} bot 
     * @param {string} message 
     * 
     * @returns {Promise<void>}
     */
    execute: async (bot, message) => {
        const date = Math.floor(Date.now() / 1000);
        const devWH = new WebhookClient({ url: bot.dev_wh });

        try {
            console.warn(message);

            await devWH.send({
                "avatarURL": bot.client?.user?.displayAvatarURL({ "forceStatic": true, "size": 512, }),
                "embeds": [
                    {
                        "author": {
                            "name": `Warning`,
                        },
                        "description": `\`\`\`\n${message}\n\`\`\``,
                        "color": bot.assets.colors.tertiary,
                        "fields": [
                            {
                                "name": "Time of Warning",
                                "value": `<t:${date}:F> • <t:${date}:R>`,
                                "inline": false,
                            },
                        ],
                        "footer": {
                            "text": bot.client?.user?.username || "Unknown User",
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