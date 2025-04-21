import { Events, EmbedBuilder, GuildBan } from "discord.js";

import { BloqbitClient, LogEvent } from "../../classes.mjs";

import fetch from "../../modules/fetch.mjs";

export default new LogEvent(
    Events.GuildBanRemove,
    /**
     * 
     * @param {BloqbitClient} bot
     * @param {GuildBan} ban
     * 
     * @returns {Promise<void>}
     */
    async (bot, ban) => {
        if (ban.guild) {
            console.debug(`Handling unban log event on guild of ID ${ban.guild?.id}...`);
            const system = fetch.fetchGuild(ban.guild?.id);

            if (system) {
                if (system.logs.enabled && (system.logs.actions.ban)) {
                    const emb = new EmbedBuilder({
                        "author": {
                            "name": `${ban.user?.username}`,
                            "icon_url": `${ban.user?.displayAvatarURL({ "forceStatic": false, size: 64 })}`,
                        },
                        "title": `${bot.assets.icons.check} User Unbanned`,
                        "color": bot.assets.colors.primary,
                        "fields": [
                            {
                                "name": "User",
                                "value": `**@${ban.user?.username}**`,
                                "inline": true,
                            },
                            {
                                "name": "Original Reason",
                                "value": `${ban.reason}`,
                                "inline": true
                            },
                        ],
                    }).data;

                    await fetch.sendLog(bot, system, emb, ban.guild);
                } else {
                    console.warn(`Logs for unbans not enabled in guild '${ban.guild?.name}' (${ban.guild?.id})`);
                };
            } else {
                console.error(`Server '${ban.guild?.name}' (${ban.guild?.id}) not registered in database`);
            };

            return;
        } else {
            console.error(`Member of ID ${ban.id} not in a guild`);
            return;
        };
    });