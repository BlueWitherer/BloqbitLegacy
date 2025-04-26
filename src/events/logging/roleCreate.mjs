import { Events, EmbedBuilder, Role } from "discord.js";

import { BloqbitClient, LogEvent } from "../../classes.mjs";

import fetch from "../../modules/fetch.mjs";

export default new LogEvent(
    Events.GuildRoleCreate,
    /**
     * 
     * @param {BloqbitClient} bot
     * @param {Role} role
     * 
     * @returns {Promise<void>}
     */
    async (bot, role) => {
        if (role.guild) {
            console.debug(`Handling created role log event on guild of ID ${role.guild?.id}...`);
            const system = await fetch.fetchGuild(role.guild?.id ?? '', bot.db);

            if (system) {
                if (system.logs.enabled && (system.logs.actions.rolesAdd)) {
                    const emb = new EmbedBuilder({
                        "author": {
                            "name": `${role.guild?.name}`,
                            "icon_url": `${role.guild?.iconURL({ "forceStatic": false, "size": 128 })}`,
                        },
                        "title": `${bot.assets.icons.plus} Role Created`,
                        "color": bot.assets.colors.primary,
                        "fields": [
                            {
                                "name": "Role",
                                "value": `<@&${role.id}>`,
                                "inline": true,
                            },
                            {
                                "name": "Role ID",
                                "value": `\`${role.id}\``,
                                "inline": true,
                            },
                        ],
                    }).data;

                    await fetch.sendLog(bot, system, emb, role.guild);
                } else {
                    console.warn(`Logs for created roles not enabled in guild '${role.guild?.name}' (${role.guild?.id})`);
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