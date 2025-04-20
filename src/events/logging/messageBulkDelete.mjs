import { Events, Message, EmbedBuilder } from "discord.js";

import { BloqbitClient, LogEvent } from "../../classes.mjs";

import fetch from "../../modules/fetch.mjs";

export default new LogEvent(
    Events.MessageBulkDelete,
    /**
     * 
     * @param {BloqbitClient} bot
     * @param {import('discord.js').ReadonlyCollection<import('discord.js').Snowflake, import('discord.js').OmitPartialGroupDMChannel<Message | import('discord.js').PartialMessage>>} msgs
     * @param {import('discord.js').GuildTextBasedChannel} channel
     * 
     * @returns {Promise<void>}
     */
    async (bot, msgs, channel) => {
        const msg = msgs.first();

        if (channel.guild) {
            console.debug(`Handling bulk deleted message log event on guild of ID ${msg.guild?.id || msg.guildId}...`);
            const system = fetch.fetchGuild(msg.guild?.id || msg.guildId);

            if (system) {
                if (system.logs.enabled && (system.logs.actions.msgBulkDel)) {
                    const emb = new EmbedBuilder({
                        "author": {
                            "name": `${msg.guild?.name}`,
                            "icon_url": `${msg.guild?.iconURL({ "forceStatic": false, "size": 128 })}`,
                        },
                        "title": `${bot.assets.icons.xmark} Messages Bulk Deleted`,
                        "description": `**${msgs.size}** messages deleted.`,
                        "color": bot.assets.colors.secondary,
                        "fields": [
                            {
                                "name": "Channel",
                                "value": `<#${String(msg.channel?.id || msg.thread?.id)}>`,
                                "inline": true,
                            },
                        ],
                    }).data;

                    await fetch.sendLog(bot, system, emb, msg.guild);
                } else {
                    console.warn(`Logs for bulk-deleted messages not enabled in guild '${msg.guild?.name}' (${msg.guild?.id})`);
                };

                return;
            } else {
                console.error(`Server '${msg.guild?.name}' (${msg.guild?.id}) not registered in database`);
                return;
            };

            return;
        } else {
            console.error(`Message of ID ${msg.id} not in a guild`);
            return;
        };
    });