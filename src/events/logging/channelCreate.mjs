import { Events, EmbedBuilder } from "discord.js";

import { BloqbitClient, LogEvent } from "../../classes.js";

import fetch from "../../modules/fetch.js";

export default new LogEvent(
    Events.ChannelCreate,
    /**
     * 
     * @param {BloqbitClient} bot
     * @param {unknown[]} args
     * 
     * @returns {Promise<void>}
     */
    async (bot, ...args) => {
        const channel = /** @type {import("discord.js").NonThreadGuildBasedChannel} */ (args[0]);

        if (channel.guild) {
            console.debug(`Handling created channel log event on guild of ID ${channel.guild?.id || channel.guildId}...`);
            const system = await fetch.fetchGuild(channel.guild?.id || channel.guildId, bot.db);

            if (system) {
                if (system.logs.enabled && (system.logs.actions.channelAdd)) {
                    const emb = new EmbedBuilder({
                        "author": {
                            "name": `${channel.guild?.name}`,
                            "icon_url": `${channel.guild?.iconURL({ "forceStatic": false, "size": 128 })}`,
                        },
                        "title": `${bot.assets.icons.plus} Channel Created`,
                        "color": bot.assets.colors.primary,
                        "fields": [
                            {
                                "name": "Channel",
                                "value": `<#${channel.id}>`,
                                "inline": false,
                            },
                            {
                                "name": "Channel ID",
                                "value": `\`${channel.id}\``,
                                "inline": true,
                            },
                            {
                                "name": "Channel Type",
                                "value": `\`${channel.type?.toString()}\``,
                                "inline": true,
                            },
                            {
                                "name": "Category",
                                "value": `${channel.parent ? `<#${channel.parent.id}>` : 'None'}`,
                                "inline": true,
                            },
                        ],
                    }).data;

                    await fetch.sendLog(bot.client, system, bot.db, emb, channel.guild);
                } else {
                    console.warn(`Logs for created channels not enabled in guild '${channel.guild?.name}' (${channel.guild?.id})`);
                };
            } else {
                console.error(`Server '${channel.guild?.name}' (${channel.guild?.id}) not registered in database`);
            };

            return;
        } else {
            console.error(`Channel of ID ${channel.id} not in a guild`);
            return;
        };
    });