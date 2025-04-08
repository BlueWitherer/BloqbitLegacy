import { Events, Message, TextChannel, EmbedBuilder } from "discord.js"

import { BloqbitClient, LogEvent } from "../../classes.mjs"

import fetch from "../../modules/fetch.mjs";

export default new LogEvent(
    Events.MessageUpdate,
    /**
     * 
     * @param {BloqbitClient} bot
     * @param {Message} oldMsg 
     * @param {Message} newMsg 
     * 
     * @returns {Promise<void>}
     */
    async (bot, oldMsg, newMsg) => {
        const system = fetch.fetchGuild(oldMsg.guild?.id || newMsg.guild?.id);

        if (system) {
            if (system.logs.enabled && (system.logs.actions.msgUpd)) {
                /**
                 * @type {TextChannel} Configured log channel for this server
                 */
                const chnl = await newMsg.guild?.channels.fetch(system.logs.channel);
                const emb = new EmbedBuilder({
                    "author": {
                        "name": `${newMsg.author?.username}`,
                        "icon_url": `${newMsg.author?.displayAvatarURL({ "forceStatic": false, size: 1024 })}`,
                    },
                    "title": `${bot.assets.icons.exclamation} | Message Edited`,
                    "color": bot.assets.colors.primary,
                    "fields": [
                        {
                            "name": "Before",
                            "value": oldMsg.cleanContent,
                            "inline": false,
                        },
                        {
                            "name": "After",
                            "value": newMsg.cleanContent,
                            "inline": false,
                        },
                        {
                            "name": "Jump",
                            "value": `[Proceed](${newMsg.url})`,
                            "inline": false,
                        },
                        {
                            "name": "Author",
                            "value": `<@!${newMsg.author?.id}>`,
                            "inline": true,
                        },
                        {
                            "name": "Channel",
                            "value": `<#${String(newMsg.channel?.id || newMsg.thread.id)}>`,
                            "inline": true,
                        },
                        {
                            "name": "Originally Sent",
                            "value": `<t:${Math.floor(oldMsg.createdTimestamp / 1000)}:F> • <t:${Math.floor(oldMsg.createdTimestamp / 1000)}:R>`,
                            "inline": true,
                        },
                        {
                            "name": "Message ID",
                            "value": newMsg.id,
                            "inline": true,
                        },
                    ],
                    "image": {
                        "url": img,
                        "proxyURL": ifProxyImage(oldMsg),
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
                        console.error(`Failed to create logs webhook for guild '${newMsg.guild?.name}' (${newMsg.guild?.id})`)
                    };
                } else {
                    await chnl.send({
                        "content": "",
                        "embeds": [emb],
                    });
                };
            } else {
                console.error(`Logs for deleted messages not enabled in guild '${newMsg.guild?.name}' (${newMsg.guild?.id})`);
            };
        } else {
            console.error(`Server '${newMsg.guild?.name}' (${newMsg.guild?.id}) not registered in database`);
        };

        return;
    },
);