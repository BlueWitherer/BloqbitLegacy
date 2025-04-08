import { Events, Message, WebhookClient, TextChannel, EmbedBuilder } from "discord.js"

import { BloqbitClient, LogEvent, SaveDataClient } from "../../classes.mjs"

import fetch from "../../modules/fetch.mjs";
import cache from "../../cache.mjs";

export default new LogEvent(
    Events.MessageUpdate,
    /**
     * 
     * @param {BloqbitClient} bot
     * @param {SaveDataClient} db
     * @param {Message} oldMsg 
     * @param {Message} newMsg 
     * 
     * @returns {Promise<void>}
     */
    async (bot, db, oldMsg, newMsg) => {
        const system = cache.fetch(newMsg.guild?.id);

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
                    "title": `${assets.icons.exclamation} | Message Edited`,
                    "color": assets.colors.primary,
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
                    const webClient = await fetch.checkLogsWebhook(bot, system, db, chnl);

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