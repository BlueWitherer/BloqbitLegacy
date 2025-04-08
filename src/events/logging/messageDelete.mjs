import { Events, Message, TextChannel, EmbedBuilder } from "discord.js"

import { BloqbitClient, LogEvent } from "../../classes.mjs"

import fetch from "../../modules/fetch.mjs";

export default new LogEvent(
    Events.MessageDelete,
    /**
     * 
     * @param {BloqbitClient} bot
     * @param {Message} msg 
     * 
     * @returns {Promise<void>}
     */
    async (bot, msg) => {
        const system = fetch.fetchGuild(msg.guild?.id);

        if (system) {
            if (system.logs.enabled && (system.logs.actions.msgDel)) {
                /**
                 * @type {TextChannel} Configured log channel for this server
                 */
                const chnl = await msg.guild?.channels.fetch(system.logs.channel);
                const emb = new EmbedBuilder({
                    "author": {
                        "name": `${msg.author?.username}`,
                        "icon_url": `${msg.author?.displayAvatarURL({ "forceStatic": false, size: 1024, "extension": "gif" })}`,
                    },
                    "title": `${bot.assets.icons.exclamation} | Message Deleted`,
                    "description": msg.cleanContent,
                    "color": bot.assets.colors.primary,
                    "fields": [
                        {
                            "name": "Jump",
                            "value": `[Proceed](${msg.url})`,
                            "inline": false,
                        },
                        {
                            "name": "Author",
                            "value": `<@!${msg.author?.id}>`,
                            "inline": true,
                        },
                        {
                            "name": "Channel",
                            "value": `<#${msg.channel?.id}>`,
                            "inline": true,
                        },
                        {
                            "name": "Message ID",
                            "value": `\`${msg.id}\``,
                            "inline": true,
                        },
                        {
                            "name": "Originally Sent",
                            "value": `<t:${Math.floor(msg.createdTimestamp / 1000)}:F> • <t:${Math.floor(msg.createdTimestamp / 1000)}:R>`,
                            "inline": true,
                        },
                    ],
                    "image": {
                        "url": fetch.ifImage(msg),
                        "proxyURL": fetch.ifProxyImage(msg),
                    },
                }).data;

                if (system.logs.webhookEnabled) {
                    const webClient = await fetch.checkLogsWebhook(bot, system, bot.db, chnl);

                    if (webClient) {
                        await webClient.send({
                            "content": "",
                            "embeds": [emb],
                        });
                    } else {
                        console.error(`Failed to create logs webhook for guild '${msg.guild?.name}' (${msg.guild?.id})`)
                    };
                } else {
                    await chnl.send({
                        "content": "",
                        "embeds": [emb],
                    });
                };
            } else {
                console.error(`Logs for deleted messages not enabled in guild '${msg.guild?.name}' (${msg.guild?.id})`);
            };
        } else {
            console.error(`Server '${msg.guild?.name}' (${msg.guild?.id}) not registered in database`);
        };

        return;
    },
);