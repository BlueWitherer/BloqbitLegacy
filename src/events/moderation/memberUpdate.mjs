import { Events, EmbedBuilder, GuildMember, PresenceUpdateStatus, ActivityType } from "discord.js";

import { BloqbitClient, BotEvent, log } from "#bloqbit/include";

import fetch from "#bloqbit/modules/fetch";

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

            if (system) {
                // streaming role
                if (system.roles.settings.streaming) {
                    const streamingRole = newMember.guild.roles.cache.get(system.roles.streaming);

                    if (newMember.presence?.activities.some((a) => a.type === ActivityType.Streaming)) {
                        if (streamingRole) {
                            if (newMember.roles.cache.has(streamingRole.id)) {
                            } else {
                                log.debug(`Adding streaming role to member ${newMember.id} in guild ${newMember.guild?.id}`);
                                await newMember.roles.add(streamingRole);
                            };
                        } else {
                            log.warn(`Streaming role not found in guild '${newMember.guild?.name}' (${oldMember.guild?.id || newMember.guild?.id})`);
                        };
                    } else {
                        if (streamingRole) {
                            if (newMember.roles.cache.has(streamingRole.id)) {
                                log.debug(`Removing streaming role from member ${newMember.id} in guild ${newMember.guild?.id}`);
                                await newMember.roles.remove(streamingRole);
                            };
                        } else {
                            log.warn(`Streaming role not found in guild '${newMember.guild?.name}' (${oldMember.guild?.id || newMember.guild?.id})`);
                        };
                    };
                } else {
                    log.warn(`Logs for member nickname update not enabled in guild '${newMember.guild?.name}' (${oldMember.guild?.id || newMember.guild?.id})`);
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