import { Events, EmbedBuilder, Role } from "discord.js";

import { BloqbitClient, LogEvent } from "../../classes.js";

import fetch from "../../modules/fetch.js";

export default new LogEvent(
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
            console.debug(`Handling deleted role log event on guild of ID ${role.guild?.id}...`);
            const system = await fetch.fetchGuild(role.guild?.id, bot.db);

            if (system) {
                if (system.logs.enabled && (system.logs.actions.rolesRem)) {
                    const emb = new EmbedBuilder({
                        "author": {
                            "name": `${role.guild?.name}`,
                            "icon_url": `${role.guild?.iconURL({ "forceStatic": false, "size": 128 })}`,
                        },
                        "title": `${bot.assets.icons.minus} Role Deleted`,
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

                    await fetch.sendLog(bot, system, emb, role.guild);
                } else {
                    console.warn(`Logs for deleted roles not enabled in guild '${role.guild?.name}' (${role.guild?.id})`);
                };
            } else {
                console.error(`Server '${role.guild?.name}' (${role.guild?.id}) not registered in database`);
            };

            return;
        } else {
            console.error(`Role of ID ${role.id} not in a guild`);
            return;
        };
    });