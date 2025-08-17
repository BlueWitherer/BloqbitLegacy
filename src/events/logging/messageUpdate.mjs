import { Events, Message, EmbedBuilder } from "discord.js";

import { BloqbitClient, BotEvent } from "#bloqbit/include";

import fetch from "#bloqbit/modules/fetch";

export default new BotEvent(
    Events.MessageUpdate,
    /**
     * 
     * @param {BloqbitClient} bot
     * @param {...any} args
     * 
     * @returns {Promise<void>}
     */
    async (bot, ...args) => {
        const oldMsg = /** @type {import('discord.js').OmitPartialGroupDMChannel<Message | import('discord.js').PartialMessage>} */ (args[0]);
        const newMsg = /** @type {import('discord.js').OmitPartialGroupDMChannel<Message>} */ (args[1]);

        if (oldMsg.guild && newMsg.guild) {
            console.debug(`Handling message update log event on guild of ID ${(newMsg.guild?.id || oldMsg.guild?.id) || (newMsg.guildId || oldMsg.guildId)}...`);
            const system = await fetch.fetchGuild(((newMsg.guild?.id || oldMsg.guild?.id) || (newMsg.guildId || oldMsg.guildId)) ?? '', bot.db);

            if (system) {
                // message edit
                if (system.logs.enabled && (system.logs.actions.msgUpd)) {
                    const emb = new EmbedBuilder({
                        "author": {
                            "name": `${newMsg.author?.username}`,
                            "iconURL": `${newMsg.author?.displayAvatarURL({ "forceStatic": false, size: 64 })}`,
                        },
                        "title": `${bot.assets.icons.info} Message Edited`,
                        "color": bot.assets.colors.tertiary,
                        "fields": [
                            {
                                "name": "Before",
                                "value": `${oldMsg.cleanContent || `-# *Empty*`}`,
                                "inline": false,
                            },
                            {
                                "name": "After",
                                "value": `${newMsg.cleanContent || `-# *Empty*`}`,
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
                            "url": fetch.ifImage(oldMsg instanceof Message ? oldMsg : await oldMsg.fetch()) || "",
                            "proxyURL": fetch.ifProxyImage(oldMsg instanceof Message ? oldMsg : await oldMsg.fetch()) || "",
                        },
                    }).data;

                    if (!newMsg.author?.bot && (oldMsg.content !== newMsg.content)) await fetch.sendLog(bot.client, system, bot.db, emb, newMsg.guild);
                } else {
                    console.warn(`Logs for edited messages not enabled in guild '${newMsg.guild?.name}' (${newMsg.guild?.id})`);
                };

                // message pin
                if (system.logs.enabled && (system.logs.actions.msgPin)) {
                    const emb = new EmbedBuilder({
                        "author": {
                            "name": `${newMsg.author?.username}`,
                            "icon_url": `${newMsg.author?.displayAvatarURL({ "forceStatic": false, size: 64 })}`,
                        },
                        "title": `${bot.assets.icons.info} Message Pinned`,
                        "description": `${newMsg.cleanContent}`,
                        "color": bot.assets.colors.tertiary,
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
                            "url": fetch.ifImage(oldMsg instanceof Message ? oldMsg : await oldMsg.fetch()) || "",
                            "proxyURL": fetch.ifProxyImage(oldMsg instanceof Message ? oldMsg : await oldMsg.fetch()) || "",
                        },
                    }).data;

                    if (!oldMsg.pinned && newMsg.pinned) await fetch.sendLog(bot.client, system, bot.db, emb, newMsg.guild);
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