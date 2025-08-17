import { Events, Message, EmbedBuilder, PermissionFlagsBits } from "discord.js";

import { BloqbitClient, BotEvent } from "../../include.js";

import fetch from "../../modules/fetch.js";

export default new BotEvent(
    Events.MessageDelete,
    /**
     * 
     * @param {BloqbitClient} bot
     * @param {unknown[]} args
     * 
     * @returns {Promise<void>}
     */
    async (bot, ...args) => {
        const msg = /** @type {import('discord.js').OmitPartialGroupDMChannel<Message | import('discord.js').PartialMessage>} */ (args[0]);

        if (msg.guild) {
            console.debug(`Handling deleted message log event on guild of ID ${msg.guild?.id || msg.guildId}...`);
            const system = await fetch.fetchGuild((msg.guild?.id || msg.guildId) ?? '', bot.db);

            if (system) {
                if (system.ghostping.enabled) {
                    const mentions = msg.mentions;

                    /**
                     * @type {string[]}
                     */
                    const pings = [];

                    if (mentions.users?.size > 0) {
                        const userPings = Array.from(mentions.users.values()).filter((u) => {
                            if (!u.bot && system.ghostping.settings.users) return true;
                            if (u.bot && system.ghostping.settings.bots) return true;

                            return false;
                        });

                        if (userPings.length > 0) userPings.forEach((u) => pings.push(`<@!${u.id}>`));
                    } else {
                        console.warn(`Message of ID ${msg.id} has no user mentions`);
                    };

                    if (mentions.roles?.size > 0) {
                        const rolePings = Array.from(mentions.roles.values()).filter((r) => {
                            if (r.id === msg.guild?.id && system.ghostping.settings.everyone) return true;
                            if (r && system.ghostping.settings.roles) return true;

                            return false;
                        });

                        if (rolePings.length > 0) rolePings.forEach((r) => pings.push(r.id === msg.guild?.id ? `@everyone` : `<@!${r.id}>`));
                    } else {
                        console.warn(`Message of ID ${msg.id} has no role mentions`);
                    };

                    const emb = new EmbedBuilder({
                        "author": {
                            "name": `${msg.author?.username}`,
                            "iconURL": `${msg.author?.displayAvatarURL({ "forceStatic": false, size: 64 })}`,
                        },
                        "title": `${bot.assets.icons.exclamation} Ghost Ping`,
                        "description": `${msg.cleanContent || `-# *Empty*`}`,
                        "color": bot.assets.colors.secondary,
                        "fields": [
                            {
                                "name": "Mentions",
                                "value": pings.join(', '),
                                "inline": false,
                            },
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
                                "inline": false,
                            },
                        ],
                        "image": {
                            "url": fetch.ifImage(msg instanceof Message ? msg : await msg.fetch()) || "",
                            "proxyURL": fetch.ifProxyImage(msg instanceof Message ? msg : await msg.fetch()) || "",
                        },
                    }).data;

                    if (pings.length > 0 && (!msg.member?.permissions?.has(PermissionFlagsBits.ManageMessages) && system.ghostping.noMods) && !msg.author?.bot) await fetch.sendLog(bot.client, system, bot.db, emb, msg.guild, system.logs.inbox);
                } else {
                    console.warn(`Logs for deleted messages not enabled in guild '${msg.guild?.name}' (${msg.guild?.id})`);
                };
            } else {
                console.error(`Server '${msg.guild?.name}' (${msg.guild?.id}) not registered in database`);
            };

            return;
        } else {
            console.error(`Message of ID ${msg.id} not in a guild`);
            return;
        };
    });