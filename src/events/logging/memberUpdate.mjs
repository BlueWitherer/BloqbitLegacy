import { Events, EmbedBuilder, GuildMember } from "discord.js";

import { BloqbitClient, BotEvent, log } from "#bloqbit/include";

import fetch from "#bloqbit/modules/fetch";
import resolve from "#bloqbit/modules/resolve";

export default new BotEvent(
    Events.GuildMemberUpdate,
    /**
     * 
     * @param {BloqbitClient} bot
     * @param {unknown[]} args
     * 
     * @returns {Promise<void>}
     */
    async (bot, ...args) => {
        const oldMember = /** @type {GuildMember | import("discord.js").PartialGuildMember} */ (args[0]);
        const newMember = /** @type {GuildMember} */ (args[1]);

        if (oldMember.guild && newMember.guild) {
            log.debug(`Handling member update log event on guild of ID ${oldMember.guild?.id || newMember.guild?.id}...`);
            const system = await fetch.fetchGuild(oldMember.guild?.id || newMember.guild?.id, bot.db);

            const oldRoles = oldMember.roles?.cache;
            const newRoles = newMember.roles?.cache;

            const addedRoles = newRoles.filter((r) => !oldRoles.has(r.id));
            const removedRoles = oldRoles.filter((r) => !newRoles.has(r.id));

            if (system) {
                // nickname change
                if (system.logs.enabled && (system.logs.actions.nickname)) {
                    const emb = new EmbedBuilder({
                        "author": {
                            "name": `${newMember.user?.username}`,
                            "icon_url": `${newMember.user?.displayAvatarURL({ "forceStatic": false, size: 64 })}`,
                        },
                        "title": `${bot.assets.icons.info} User Nickname Updated`,
                        "color": bot.assets.colors.tertiary,
                        "fields": [
                            {
                                "name": "User",
                                "value": `<@!${newMember.user?.id}>`,
                                "inline": false,
                            },
                            {
                                "name": "Old Nickname",
                                "value": `${oldMember.nickname || oldMember.user?.username}`,
                                "inline": true,
                            },
                            {
                                "name": "New Nickname",
                                "value": `${newMember.nickname || newMember.user?.username}`,
                                "inline": true,
                            },
                        ],
                    }).data;

                    if (oldMember.nickname !== newMember.nickname) await fetch.sendLog(bot.client, system, bot.db, emb, newMember.guild);
                } else {
                    log.warn(`Logs for member nickname update not enabled in guild '${newMember.guild?.name}' (${oldMember.guild?.id || newMember.guild?.id})`);
                };

                // timeout begin
                if (system.logs.enabled && (system.logs.actions.timeout)) {
                    const emb = new EmbedBuilder({
                        "author": {
                            "name": `${newMember.user?.username}`,
                            "icon_url": `${newMember.user?.displayAvatarURL({ "forceStatic": false, size: 64 })}`,
                        },
                        "title": `${bot.assets.icons.xmark} User Timed Out`,
                        "color": bot.assets.colors.secondary,
                        "fields": [
                            {
                                "name": "User",
                                "value": `<@!${newMember.user?.id}>`,
                                "inline": false,
                            },
                            {
                                "name": "Until",
                                "value": `${newMember.communicationDisabledUntilTimestamp ? `<t:${Math.floor(newMember.communicationDisabledUntilTimestamp / 1000)}:R>` : "Unknown"}`,
                                "inline": true,
                            },
                        ],
                    }).data;

                    if (!oldMember.isCommunicationDisabled().valueOf() && newMember.isCommunicationDisabled().valueOf()) await fetch.sendLog(bot.client, system, bot.db, emb, newMember.guild);
                } else {
                    log.warn(`Logs for member timed out not enabled in guild '${newMember.guild?.name}' (${oldMember.guild?.id || newMember.guild?.id})`);
                };

                // timeout end
                if (system.logs.enabled && (system.logs.actions.timeout)) {
                    const emb = new EmbedBuilder({
                        "author": {
                            "name": `${newMember.user?.username}`,
                            "icon_url": `${newMember.user?.displayAvatarURL({ "forceStatic": false, size: 64 })}`,
                        },
                        "title": `${bot.assets.icons.check} User Timeout Expired`,
                        "color": bot.assets.colors.primary,
                        "fields": [
                            {
                                "name": "User",
                                "value": `<@!${newMember.user?.id}>`,
                                "inline": false,
                            },
                            {
                                "name": "Since",
                                "value": `${oldMember.isCommunicationDisabled().valueOf() ? `<t:${Math.floor(Date.now() / 1000)}:R>` : "Unknown"}`,
                                "inline": true,
                            },
                        ],
                    }).data;

                    if (oldMember.isCommunicationDisabled().valueOf() && !newMember.isCommunicationDisabled().valueOf()) await fetch.sendLog(bot.client, system, bot.db, emb, newMember.guild);
                } else {
                    log.warn(`Logs for member timeout expiring not enabled in guild '${newMember.guild?.name}' (${oldMember.guild?.id || newMember.guild?.id})`);
                };

                // roles given
                if (system.logs.enabled && (system.logs.actions.rolesAssign)) {
                    const emb = new EmbedBuilder({
                        "author": {
                            "name": `${newMember.user?.username}`,
                            "icon_url": `${newMember.user?.displayAvatarURL({ "forceStatic": false, size: 64 })}`,
                        },
                        "title": `${bot.assets.icons.plus} User Roles Given`,
                        "color": bot.assets.colors.primary,
                        "fields": [
                            {
                                "name": "User",
                                "value": `<@!${newMember.user?.id}>`,
                                "inline": false,
                            },
                            {
                                "name": "Roles",
                                "value": `**[${resolve.numberWithCommas(addedRoles.size)}]** ${addedRoles.map((r) => `<@&${r.id}>`).join(", ")}`,
                                "inline": false,
                            },
                        ],
                    }).data;

                    if (addedRoles.size > 0) await fetch.sendLog(bot.client, system, bot.db, emb, newMember.guild);
                } else {
                    log.warn(`Logs for member roles given not enabled in guild '${newMember.guild?.name}' (${oldMember.guild?.id || newMember.guild?.id})`);
                };

                // roles taken
                if (system.logs.enabled && (system.logs.actions.rolesUnassign)) {
                    const emb = new EmbedBuilder({
                        "author": {
                            "name": `${newMember.user?.username}`,
                            "icon_url": `${newMember.user?.displayAvatarURL({ "forceStatic": false, size: 64 })}`,
                        },
                        "title": `${bot.assets.icons.minus} User Roles Taken`,
                        "color": bot.assets.colors.secondary,
                        "fields": [
                            {
                                "name": "User",
                                "value": `<@!${newMember.user?.id}>`,
                                "inline": false,
                            },
                            {
                                "name": "Roles",
                                "value": `**[${resolve.numberWithCommas(removedRoles.size)}]** ${removedRoles.map((r) => `<@&${r.id}>`).join(", ")}`,
                                "inline": false,
                            },
                        ],
                    }).data;

                    if (removedRoles.size > 0) await fetch.sendLog(bot.client, system, bot.db, emb, newMember.guild);
                } else {
                    log.warn(`Logs for member roles taken not enabled in guild '${newMember.guild?.name}' (${oldMember.guild?.id || newMember.guild?.id})`);
                };
            } else {
                log.error(`Server '${newMember.guild?.name}' (${oldMember.guild?.id || newMember.guild?.id}) not registered in database`);
            };

            return;
        } else {
            log.error(`Member of ID ${newMember.id} not in a guild`);
            return;
        };
    });