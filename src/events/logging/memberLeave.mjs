import { Events, EmbedBuilder, GuildMember } from "discord.js";

import { BloqbitClient, LogEvent } from "../../classes.js";

import fetch from "../../modules/fetch.js";

export default new LogEvent(
    Events.GuildMemberRemove,
    /**
     * 
     * @param {BloqbitClient} bot
     * @param {unknown[]} args
     * 
     * @returns {Promise<void>}
     */
    async (bot, ...args) => {
        const member = /** @type {GuildMember | import("discord.js").PartialGuildMember} */ (args[0]);

        if (member.guild) {
            console.debug(`Handling member leave log event on guild of ID ${member.guild?.id}...`);
            const system = await fetch.fetchGuild(member.guild?.id, bot.db);

            if (system) {
                if (system.logs.enabled && (system.logs.actions.leave)) {
                    const emb = new EmbedBuilder({
                        "author": {
                            "name": `${member.user?.username}`,
                            "icon_url": `${member.user?.displayAvatarURL({ "forceStatic": false, size: 64 })}`,
                        },
                        "title": `${bot.assets.icons.minus} User Left`,
                        "color": bot.assets.colors.secondary,
                        "fields": [
                            {
                                "name": "User",
                                "value": `<@!${member.user?.id}>`,
                                "inline": true,
                            },
                            {
                                "name": "Joined At",
                                "value": member.joinedTimestamp
                                    ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F> • <t:${Math.floor(member.joinedTimestamp / 1000)}:R>`
                                    : "Unknown",
                                "inline": true,
                            },
                        ],
                    }).data;

                    await fetch.sendLog(bot, system, emb, member.guild);
                } else {
                    console.warn(`Logs for member leaves not enabled in guild '${member.guild?.name}' (${member.guild?.id})`);
                };
            } else {
                console.error(`Server '${member.guild?.name}' (${member.guild?.id}) not registered in database`);
            };

            return;
        } else {
            console.error(`Member of ID ${member.id} not in a guild`);
            return;
        };
    });