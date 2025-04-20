import { Events, DMChannel, EmbedBuilder } from "discord.js";

import { BloqbitClient, LogEvent } from "../../classes.mjs";

import fetch from "../../modules/fetch.mjs";

export default new LogEvent(
    Events.ChannelDelete,
    /**
     * 
     * @param {BloqbitClient} bot
     * @param {DMChannel | import("discord.js").NonThreadGuildBasedChannel} channel
     * 
     * @returns {Promise<void>}
     */
    async (bot, channel) => {
        if (channel.guild) {
            console.debug(`Handling deleted channel log event on guild of ID ${channel.guild?.id || channel.guildId}...`);
            const system = fetch.fetchGuild(channel.guild?.id || channel.guildId);

            if (system) {
                if (system.logs.enabled && (system.logs.actions.channelDel)) {
                    const emb = new EmbedBuilder({
                        "author": {
                            "name": `${channel.guild?.name}`,
                            "icon_url": `${channel.guild?.iconURL({ "forceStatic": false, "size": 128 })}`,
                        },
                        "title": `${bot.assets.icons.minus}Channel Deleted`,
                        "color": bot.assets.colors.secondary,
                        "fields": [
                            {
                                "name": "Channel",
                                "value": `**#${channel.name}**`,
                                "inline": true,
                            },
                        ],
                    }).data;

                    await fetch.sendLog(bot, system, emb, channel.guild);
                } else {
                    console.warn(`Logs for deleted channels not enabled in guild '${channel.guild?.name}' (${channel.guild?.id})`);
                };

                return;
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