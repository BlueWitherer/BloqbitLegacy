import { Events, EmbedBuilder, Role } from "discord.js";

import { BloqbitClient, BotEvent, log } from "#bloqbit/include.ts";

import fetch from "#bloqbit/modules/fetch.mjs";

export default new BotEvent(
    Events.GuildRoleDelete,
    /**
     * 
     * @param {BloqbitClient} bot
     * @param {...any} args
     * 
     * @returns {Promise<void>}
     */
    async (bot, ...args) => {
        const role = /** @type {import('discord.js').Role} */ (args[0]);

        if (role.guild) {
            log.debug(`Handling deleted role log event on guild of ID ${role.guild?.id}...`);
            const system = await fetch.fetchGuild(role.guild?.id, bot.db);

            if (system) {
                if (system.logs.enabled && (system.logs.actions.rolesRem)) {
                    const emb = new EmbedBuilder({
                        "author": {
                            "name": `${role.guild?.name}`,
                            "icon_url": `${role.guild?.iconURL({ "forceStatic": false, "size": 128 }) ?? bot.assets.images.defaults.guild}`,
                        },
                        "title": `:heavy_minus_sign: Role Deleted`,
                        "color": bot.assets.colors.secondary,
                        "fields": [
                            {
                                "name": "Role",
                                "value": `**@${role.name}**`,
                                "inline": false,
                            },
                            {
                                "name": "Role ID",
                                "value": `\`${role.id}\``,
                                "inline": true,
                            },
                            {
                                "name": "Role Color",
                                "value": `\`${role.hexColor}\``,
                                "inline": true,
                            },
                            {
                                "name": "Role Position",
                                "value": `\`${role.position}\``,
                                "inline": true,
                            },
                            {
                                "name": "Role Permissions",
                                "value": `\`${role.permissions?.toArray().join('\` | \`') || 'NONE'}\``,
                                "inline": false,
                            },
                        ],
                    }).data;

                    await fetch.sendLog(bot.client, system, bot.db, emb, role.guild);
                } else {
                    log.warn(`Logs for deleted roles not enabled in guild '${role.guild?.name}' (${role.guild?.id})`);
                };
            } else {
                log.error(`Server '${role.guild?.name}' (${role.guild?.id}) not registered in database`);
            };

            return;
        } else {
            log.error(`Role of ID ${role.id} not in a guild`);
            return;
        };
    });