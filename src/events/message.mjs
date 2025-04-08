import cache from '../cache.mjs';
import BloqbitClient from '../classes/BloqbitClient.mjs';
import { Events, Message, ChannelType, WebhookClient } from 'discord.js';

export default {
    name: Events.MessageCreate,
    once: false,
    /**
     * 
     * @param {BloqbitClient} bot 
     * @param {Message} msg 
     * 
     * @returns {Promise<void>}
     */
    execute: async (bot, msg) => {
        if (msg.guild) {
            msg.channel?.messages?.fetch({ limit: 200 })
                .then(() => {
                    console.log(`Message sent by @${msg.author?.username} (${msg.author?.id}) in #${msg.channel?.name} (${msg.channel?.id}) Message Count: ${msg.channel?.messages?.cache.size}`);
                });
        } else if (msg.channel?.type === ChannelType.DM) {
            msg.channel?.messages?.fetch({ limit: 200 })
                .then(() => {
                    console.log(`Direct message sent by @${msg.author?.username} (${msg.author?.id}) to @${bot.client?.user?.username} Message Count: ${msg.channel?.messages?.cache.size}`);
                });
        };

        if (msg.channel?.type === ChannelType.DM || msg.channel?.type === ChannelType.GroupDM) {
            const devWH = new WebhookClient({ url: bot.dev_wh });

            if (msg.author?.bot) {
                console.warn(`Direct messenger ${msg.author?.username} (${msg.author?.id}) is a bot or invalid.`);
            } else if (devWH) {
                const date = Math.floor(Date.now() / 1000);

                await devWH.send({
                    "avatarURL": bot.client?.user?.displayAvatarURL({ "forceStatic": true, "size": 512, }),
                    "content": "",
                    "embeds": [
                        {
                            "author": {
                                "name": "Direct Message",
                            },
                            "color": bot.assets.colors.terciary,
                            "description": msg.content,
                            "fields": [
                                {
                                    "name": "Sent At",
                                    "value": `<t:${date}:F> • <t:${date}:R>`,
                                    "inline": false,
                                },
                            ],
                            "footer": {
                                "text": msg.author?.username,
                                "icon_url": msg.author?.displayAvatarURL({ "forceStatic": false, "size": 128 }),
                            },
                        },
                    ],
                });
            };
        };
    },
};