import { Events, Message, TextChannel, EmbedBuilder, ReadonlyCollection, OmitPartialGroupDMChannel, PartialMessage } from "discord.js"

import { BloqbitClient, LogEvent } from "../../classes.mjs"

import fetch from "../../modules/fetch.mjs";

export default new LogEvent(
    Events.MessageBulkDelete,
    /**
     * 
     * @param {BloqbitClient} bot
     * @param {ReadonlyCollection<string, OmitPartialGroupDMChannel<Message<boolean> | PartialMessage>>} msgs
     * 
     * @returns {Promise<void>}
     */
    async (bot, msgs) => {
        const msg = msgs.first();

        console.debug(`Handling bulk deleted message log event on guild of ID ${msg.guildId}...`);
        const system = fetch.fetchGuild(msg.guildId);

        if (system) {
            if (system.logs.enabled && (system.logs.actions.msgBulkDel)) {
                /**
                 * @type {TextChannel} Configured log channel for this server
                 */
                const chnl = await msg.guild?.channels.fetch(system.logs.channel);
                const emb = new EmbedBuilder({
                    "title": `${assets.icons.exclamation} | Messages Bulk Deleted`,
                    "description": `**${msgs.size}** messages deleted.`,
                    "color": assets.colors.primary,
                    "fields": [
                        {
                            "name": "Channel",
                            "value": `<#${String(msg.channel?.id || msg.thread.id)}>`,
                            "inline": true,
                        },
                    ],
                }).data;

                await fetch.sendLog(bot, system, emb, msg.guild);
            } else {
                console.error(`Logs for bulk-deleted messages not enabled in guild '${msg.guild?.name}' (${msg.guild?.id})`);
            };
        } else {
            console.error(`Server '${msg.guild?.name}' (${msg.guild?.id}) not registered in database`);
        };

        return;
    },
);