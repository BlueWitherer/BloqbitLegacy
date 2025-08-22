import { Events, EmbedBuilder, GuildMember } from "discord.js";

import { BloqbitClient, BotEvent, log } from "#bloqbit/include.ts";

import fetch from "#bloqbit/modules/fetch.mjs";

export default new BotEvent(
    Events.GuildMemberAdd,
    /**
     * 
     * @param {BloqbitClient} bot
     * @param {unknown[]} args
     * 
     * @returns {Promise<void>}
     */
    async (bot, ...args) => {
        const member = /** @type {GuildMember} */ (args[0]);

        if (member.guild) {
            log.debug(`Handling member join log event on guild of ID ${member.guild?.id}...`);
            const system = await fetch.fetchGuild(member.guild?.id, bot.db);

            if (system) {
                if (system.logs.enabled && (system.logs.actions.join)) {
                    const emb = new EmbedBuilder({
                        "author": {
                            "name": `${member.user?.username}`,
                            "icon_url": `${member.user?.displayAvatarURL({ "forceStatic": false, size: 64 })}`,
                        },
                        "title": `:heavy_plus_sign: User Joined`,
                        "color": bot.assets.colors.primary,
                        "fields": [
                            {
                                "name": "User",
                                "value": `<@!${member.user?.id}>`,
                                "inline": true,
                            },
                            {
                                "name": "Account Creation",
                                "value": `<t:${Math.floor(member.user?.createdTimestamp / 1000)}:F> • <t:${Math.floor(member.user?.createdTimestamp / 1000)}:R>`,
                                "inline": true,
                            },
                        ],
                    }).data;

                    await fetch.sendLog(bot.client, system, bot.db, emb, member.guild);
                } else {
                    log.warn(`Logs for member joins not enabled in guild '${member.guild?.name}' (${member.guild?.id})`);
                };
            } else {
                log.error(`Server '${member.guild?.name}' (${member.guild?.id}) not registered in database`);
            };

            return;
        } else {
            log.error(`Member of ID ${member.id} not in a guild`);
            return;
        };
    });