import { Events, EmbedBuilder, GuildBan } from "discord.js";

import { BloqbitClient, BotEvent } from "#bloqbit/include";

import fetch from "#bloqbit/modules/fetch";

export default new BotEvent(
    Events.GuildBanAdd,
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
            console.debug(`Handling ban log event on guild of ID ${ban.guild?.id}...`);
            const system = await fetch.fetchGuild(ban.guild?.id, bot.db);

            if (system) {
                if (system.logs.enabled && (system.logs.actions.ban)) {
                    const emb = new EmbedBuilder({
                        "author": {
                            "name": `${ban.user?.username}`,
                            "icon_url": `${ban.user?.displayAvatarURL({ "forceStatic": false, size: 64 })}`,
                        },
                        "title": `${bot.assets.icons.xmark} User Banned`,
                        "color": bot.assets.colors.secondary,
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
                                "name": "Reason",
                                "value": `${ban.reason}`,
                                "inline": false,
                            },
                        ],
                    }).data;

                    await fetch.sendLog(bot.client, system, bot.db, emb, ban.guild);
                } else {
                    console.warn(`Logs for bans not enabled in guild '${ban.guild?.name}' (${ban.guild?.id})`);
                };
            } else {
                console.error(`Server '${ban.guild?.name}' (${ban.guild?.id}) not registered in database`);
            };

            return;
        } else {
            console.error(`Banned user of ID ${ban.user?.id} not from a guild`);
            return;
        };
    });