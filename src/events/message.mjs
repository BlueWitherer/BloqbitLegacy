import { BloqbitClient, log } from "#bloqbit/include.ts";
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
        const date = Math.floor(Date.now() / 1000);
        const devWH = new WebhookClient({ url: bot.dev_wh });

        try {
            if (msg.channel?.type === ChannelType.DM || msg.channel?.type === ChannelType.GroupDM) {
                if (msg.author?.bot) {
                    log.error(`Direct message author ${msg.author?.username} (${msg.author?.id}) is a bot or invalid`);
                } else if (devWH) {
                    await devWH.send({
                        "avatarURL": bot.client?.user?.displayAvatarURL({ "forceStatic": true, "size": 512, }),
                        "embeds": [
                            {
                                "author": {
                                    "name": "Direct Message",
                                },
                                "color": bot.assets.colors.tertiary,
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
                } else {
                    log.error(`Direct message author ${msg.author?.username} (${msg.author?.id}) is a bot or invalid`);
                };
            } else {
                const msgs = await msg.channel?.messages?.fetch({ "limit": 100 });

                log.debug(`Cached ${msgs?.size}/${msg.channel?.messages?.cache?.size} messages from guild channel`);
            };
        } catch (err) {
            log.trace(err);
        };

        return;
    },
};