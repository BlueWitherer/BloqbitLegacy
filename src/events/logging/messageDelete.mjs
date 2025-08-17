import { Events, Message, EmbedBuilder } from "discord.js";

import { BloqbitClient, BotEvent, log } from "#bloqbit/include";

import fetch from "#bloqbit/modules/fetch";
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
            log.debug(`Handling deleted message log event on guild of ID ${msg.guild?.id || msg.guildId}...`);
            const system = await fetch.fetchGuild((msg.guild?.id || msg.guildId) ?? '', bot.db);

            if (system) {
                if (system.logs.enabled && (system.logs.actions.msgDel)) {
                    const emb = new EmbedBuilder({
                        "author": {
                            "name": `${msg.author?.username}`,
                            "iconURL": `${msg.author?.displayAvatarURL({ "forceStatic": false, size: 64 })}`,
                        },
                        "title": `${bot.assets.icons.minus} Message Deleted`,
                        "description": `${msg.cleanContent}`,
                        "color": bot.assets.colors.secondary,
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
                                "inline": false,
                            },
                        ],
                        "image": {
                            "url": fetch.ifImage(msg instanceof Message ? msg : await msg.fetch()) || "",
                            "proxyURL": fetch.ifProxyImage(msg instanceof Message ? msg : await msg.fetch()) || "",
                        },
                    }).data;

                    if (!msg.author?.bot) await fetch.sendLog(bot.client, system, bot.db, emb, msg.guild);
                } else {
                    log.warn(`Logs for deleted messages not enabled in guild '${msg.guild?.name}' (${msg.guild?.id})`);
                };
            } else {
                log.error(`Server '${msg.guild?.name}' (${msg.guild?.id}) not registered in database`);
            };

            return;
        } else {
            log.error(`Message of ID ${msg.id} not in a guild`);
            return;
        };
    });