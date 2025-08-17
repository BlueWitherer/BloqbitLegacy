import { BloqbitClient } from "#bloqbit/include";

import { Events, WebhookClient } from 'discord.js';

export default {
    name: Events.Error,
    once: false,
    /**
     * 
     * @param {BloqbitClient} bot 
     * @param {Error} error 
     * 
     * @returns {Promise<void>}
     */
    execute: async (bot, error) => {
        const date = Math.floor(Date.now() / 1000);
        const devWH = new WebhookClient({ url: bot.dev_wh });

        try {
            console.error(error.stack);

            await devWH.send({
                "avatarURL": bot.client?.user?.displayAvatarURL({ "forceStatic": true, "size": 512, }),
                "embeds": [
                    {
                        "author": {
                            "name": `Error`,
                        },
                        "description": `\`\`\`${error.message}\`\`\``,
                        "color": bot.assets.colors.secondary,
                        "fields": [
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