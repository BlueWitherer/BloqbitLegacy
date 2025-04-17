import { Events, EmbedBuilder } from "discord.js";

import { BloqbitClient, LogEvent } from "../../classes.mjs";

import fetch from "../../modules/fetch.mjs";

export default new LogEvent(
    Events.ChannelCreate,
    /**
     * 
     * @param {BloqbitClient} bot
     * @param {import("discord.js").NonThreadGuildBasedChannel} channel
     * 
     * @returns {Promise<void>}
     */
    async (bot, channel) => {
        if (channel.guild) {
            console.debug(`Handling created channel log event on guild of ID ${channel.guild?.id || channel.guildId}...`);
            const system = fetch.fetchGuild(channel.guild?.id || channel.guildId);

            if (system) {
                if (system.logs.enabled && (system.logs.actions.channelAdd)) {
                    const emb = new EmbedBuilder({
                        "title": `${bot.assets.icons.plus} | Channel Created`,
                        "color": bot.assets.colors.primary,
                        "fields": [
                            {
                                "name": "Channel",
                                "value": `<#${channel.id}>`,
                                "inline": true,
                            },
                            {
                                "name": "Channel ID",
                                "value": `\`${channel.id}\``,
                                "inline": true,
                            },
                        ],
                    }).data;

                    await fetch.sendLog(bot, system, emb, channel.guild);
                } else {
                    console.error(`Logs for created channels not enabled in guild '${channel.guild?.name}' (${channel.guild?.id})`);
                    return;
                };
            } else {
                console.error(`Server '${channel.guild?.name}' (${channel.guild?.id}) not registered in database`);
                return;
            };

            return;
        } else {
            console.error(`Channel of ID ${channel.id} not in a guild`);
            return;
        };
    });