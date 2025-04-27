import { Events, Message, EmbedBuilder, MessageReaction } from "discord.js";

import { BloqbitClient, LogEvent } from "../../classes.js";

import fetch from "../../modules/fetch.js";
import resolve from "../../modules/resolve.js";

export default new LogEvent(
    Events.MessageReactionRemoveAll,
    /**
     * 
     * @param {BloqbitClient} bot
     * @param {unknown[]} args
     * 
     * @returns {Promise<void>}
     */
    async (bot, ...args) => {
        const msg = /** @type {import('discord.js').OmitPartialGroupDMChannel<Message | import('discord.js').PartialMessage>} */ (args[0]);
        const reactions = /** @type {import("discord.js").ReadonlyCollection<string | import("discord.js").Snowflake, MessageReaction>} */ (args[1]);

        if (msg.guild) {
            console.debug(`Handling all reactions deleted from message log event on guild of ID ${msg.guild?.id || msg.guildId}...`);
            const system = await fetch.fetchGuild((msg.guild?.id || msg.guildId) ?? '', bot.db);

            if (system) {
                if (system.logs.enabled && (system.logs.actions.remAllReact)) {
                    const emb = new EmbedBuilder({
                        "author": {
                            "name": `${msg.author?.username}`,
                            "iconURL": `${msg.author?.displayAvatarURL({ "forceStatic": false, size: 64 })}`,
                        },
                        "title": `${bot.assets.icons.exclamation} All Reactions Removed from Message`,
                        "description": `${msg.cleanContent}`,
                        "color": bot.assets.colors.tertiary,
                        "fields": [
                            {
                                "name": "Jump",
                                "value": `[Proceed](${msg.url})`,
                                "inline": false,
                            },
                            {
                                "name": "Reactions",
                                "value": `**${resolve.numberWithCommas(reactions.size)} removed** - ${reactions.map((reaction) => `<${reaction.emoji?.animated ? "a" : ""}:ico:${reaction.emoji?.id}>`).join(", ")}`,
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

                    if (!msg.author?.bot) await fetch.sendLog(bot, system, emb, msg.guild);
                } else {
                    console.warn(`Logs for all reactions deleted from message not enabled in guild '${msg.guild?.name}' (${msg.guild?.id})`);
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