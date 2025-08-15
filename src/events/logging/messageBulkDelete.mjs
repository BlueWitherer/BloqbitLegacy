import { Events, Message, EmbedBuilder } from "discord.js";

import { BloqbitClient, BotEvent } from "../../include.js";

import fetch from "../../modules/fetch.js";

export default new BotEvent(
    Events.MessageBulkDelete,
    /**
     * 
     * @param {BloqbitClient} bot
     * @param {unknown[]} args
     * 
     * @returns {Promise<void>}
     */
    async (bot, ...args) => {
        const msgs = /** @type {import('discord.js').ReadonlyCollection<import('discord.js').Snowflake, import('discord.js').OmitPartialGroupDMChannel<Message | import('discord.js').PartialMessage>>} */ (args[0]);
        const channel = /** @type {import('discord.js').GuildTextBasedChannel} */ (args[1]);

        const msg = msgs.first();

        if (channel.guild && msg) {
            console.debug(`Handling bulk deleted message log event on guild of ID ${msg.guild?.id || msg.guildId}...`);
            const system = await fetch.fetchGuild((msg.guild?.id || msg.guildId) ?? '', bot.db);

            if (system) {
                if (system.logs.enabled && (system.logs.actions.msgBulkDel)) {
                    const emb = new EmbedBuilder({
                        "author": {
                            "name": `${msg.guild?.name}`,
                            "icon_url": `${msg.guild?.iconURL({ "forceStatic": false, "size": 128 }) ?? bot.assets.images.defaults.guild}`,
                        },
                        "title": `${bot.assets.icons.xmark} Messages Bulk Deleted`,
                        "description": `**${msgs.size}** messages deleted`,
                        "color": bot.assets.colors.secondary,
                        "fields": [
                            {
                                "name": "Channel",
                                "value": `<#${String(msg.channel?.id || msg.thread?.id)}>`,
                                "inline": true,
                            },
                        ],
                    }).data;

                    if (msg.guild) {
                        await fetch.sendLog(bot.client, system, bot.db, emb, msg.guild);
                    } else {
                        console.error(`Guild is null for message ID ${msg.id}`);
                    };
                } else {
                    console.warn(`Logs for bulk-deleted messages not enabled in guild '${msg.guild?.name}' (${msg.guild?.id})`);
                };
            } else {
                console.error(`Server '${msg.guild?.name}' (${msg.guild?.id}) not registered in database`);
            };

            return;
        } else {
            if (msg) console.error(`Message of ID ${msg.id} not in a guild`);
            return;
        };
    });