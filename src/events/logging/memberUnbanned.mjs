import { Events, EmbedBuilder, GuildBan } from "discord.js";

import { BloqbitClient, BotEvent, log } from "#bloqbit/include.ts";

import fetch from "#bloqbit/modules/fetch.mjs";

export default new BotEvent(
    Events.GuildBanRemove,
    /**
     * 
     * @param {BloqbitClient} bot
     * @param {unknown[]} args
     * 
     * @returns {Promise<void>}
     */
    async (bot, ...args) => {
        const ban = /** @type {GuildBan} */ (args[0]);

        if (ban.guild) {
            log.debug(`Handling unban log event on guild of ID ${ban.guild?.id}...`);
            const system = await fetch.fetchGuild(ban.guild?.id, bot.db);

            if (system) {
                if (system.logs.enabled && (system.logs.actions.ban)) {
                    const emb = new EmbedBuilder({
                        "author": {
                            "name": `${ban.user?.username}`,
                            "icon_url": `${ban.user?.displayAvatarURL({ "forceStatic": false, size: 64 })}`,
                        },
                        "title": `:white_check_mark: User Unbanned`,
                        "color": bot.assets.colors.primary,
                        "fields": [
                            {
                                "name": "User",
                                "value": `**@${ban.user?.username}**`,
                                "inline": false,
                            },
                            {
                                "name": "User ID",
                                "value": `\`${ban.user?.id}\``,
                                "inline": true,
                            },
                            {
                                "name": "Original Reason",
                                "value": `${ban.reason}`,
                                "inline": false,
                            },
                        ],
                    }).data;

                    await fetch.sendLog(bot.client, system, bot.db, emb, ban.guild);
                } else {
                    log.warn(`Logs for unbans not enabled in guild '${ban.guild?.name}' (${ban.guild?.id})`);
                };
            } else {
                log.error(`Server '${ban.guild?.name}' (${ban.guild?.id}) not registered in database`);
            };

            return;
        } else {
            log.error(`Unbanned user of ID ${ban.user?.id} not from a guild`);
            return;
        };
    });