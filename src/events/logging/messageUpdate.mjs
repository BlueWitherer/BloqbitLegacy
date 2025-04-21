import { Events, Message, EmbedBuilder } from "discord.js";

import { BloqbitClient, LogEvent } from "../../classes.mjs";

import fetch from "../../modules/fetch.mjs";

export default new LogEvent(
    Events.MessageUpdate,
    /**
     * 
     * @param {BloqbitClient} bot
     * @param {import('discord.js').OmitPartialGroupDMChannel<Message | import('discord.js').PartialMessage>} oldMsg 
     * @param {import('discord.js').OmitPartialGroupDMChannel<Message>} newMsg 
     * 
     * @returns {Promise<void>}
     */
    async (bot, oldMsg, newMsg) => {
        if (oldMsg.guild && newMsg.guild) {
            console.debug(`Handling edited message log event on guild of ID ${(newMsg.guild?.id || oldMsg.guild?.id) || (newMsg.guildId || oldMsg.guildId)}...`);
            const system = fetch.fetchGuild((newMsg.guild?.id || oldMsg.guild?.id) || (newMsg.guildId || oldMsg.guildId));

            if (system) {
                if (system.logs.enabled && (system.logs.actions.msgUpd)) {
                    const emb = new EmbedBuilder({
                        "author": {
                            "name": `${newMsg.author?.username}`,
                            "icon_url": `${newMsg.author?.displayAvatarURL({ "forceStatic": false, size: 64 })}`,
                        },
                        "title": `${bot.assets.icons.info} Message Edited`,
                        "color": bot.assets.colors.terciary,
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
                                "value": `<#${String(newMsg.channel?.id || newMsg.thread?.id)}>`,
                                "inline": true,
                            },
                            {
                                "name": "Message ID",
                                "value": `\`${newMsg.id}\``,
                                "inline": true,
                            },
                            {
                                "name": "Originally Sent",
                                "value": `<t:${Math.floor(oldMsg.createdTimestamp / 1000)}:F> • <t:${Math.floor(oldMsg.createdTimestamp / 1000)}:R>`,
                                "inline": false,
                            },
                        ],
                        "image": {
                            "url": fetch.ifImage(oldMsg),
                            "proxyURL": fetch.ifProxyImage(oldMsg),
                        },
                    }).data;

                    if (!newMsg.author?.bot && !(oldMsg.content === newMsg.content)) await fetch.sendLog(bot, system, emb, newMsg.guild);
                } else {
                    console.warn(`Logs for edited messages not enabled in guild '${newMsg.guild?.name}' (${newMsg.guild?.id})`);
                };

                if (system.logs.enabled && (system.logs.actions.msgPin)) {
                    const emb = new EmbedBuilder({
                        "author": {
                            "name": `${newMsg.author?.username}`,
                            "icon_url": `${newMsg.author?.displayAvatarURL({ "forceStatic": false, size: 64 })}`,
                        },
                        "title": `${bot.assets.icons.info} Message Pinned`,
                        "description": newMsg.cleanContent,
                        "color": bot.assets.colors.primary,
                        "fields": [
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
                                "value": `<#${String(newMsg.channel?.id || newMsg.thread?.id)}>`,
                                "inline": true,
                            },
                            {
                                "name": "Message ID",
                                "value": `\`${newMsg.id}\``,
                                "inline": true,
                            },
                            {
                                "name": "Originally Sent",
                                "value": `<t:${Math.floor(oldMsg.createdTimestamp / 1000)}:F> • <t:${Math.floor(oldMsg.createdTimestamp / 1000)}:R>`,
                                "inline": false,
                            },
                        ],
                        "image": {
                            "url": fetch.ifImage(oldMsg),
                            "proxyURL": fetch.ifProxyImage(oldMsg),
                        },
                    }).data;

                    if (newMsg.pinned && !oldMsg.pinned) await fetch.sendLog(bot, system, emb, newMsg.guild);
                } else {
                    console.warn(`Logs for pinned messages not enabled in guild '${newMsg.guild?.name}' (${newMsg.guild?.id})`);
                };
            } else {
                console.error(`Server '${newMsg.guild?.name}' (${newMsg.guild?.id}) not registered in database`);
            };

            return;
        } else {
            console.error(`Message of ID ${newMsg.id} not in a guild`);
            return;
        };
    });