import { Events, EmbedBuilder, GuildMember, PresenceUpdateStatus, ActivityType } from "discord.js";

import { BloqbitClient, BotEvent } from "../../classes.js";

import fetch from "../../modules/fetch.js";
import resolve from "../../modules/resolve.js";

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
            console.debug(`Handling member update log event on guild of ID ${oldMember.guild?.id || newMember.guild?.id}...`);
            const system = await fetch.fetchGuild(oldMember.guild?.id || newMember.guild?.id, bot.db);

            if (system) {
                // streaming role
                if (system.roles.settings.streaming) {
                    const streamingRole = newMember.guild.roles.cache.get(system.roles.streaming);

                    if (newMember.presence?.activities.some((a) => a.type === ActivityType.Streaming)) {
                        if (streamingRole) {
                            if (newMember.roles.cache.has(streamingRole.id)) {
                            } else {
                                console.debug(`Adding streaming role to member ${newMember.id} in guild ${newMember.guild?.id}`);
                                await newMember.roles.add(streamingRole);
                            };
                        } else {
                            console.warn(`Streaming role not found in guild '${newMember.guild?.name}' (${oldMember.guild?.id || newMember.guild?.id})`);
                        };
                    } else {
                        if (streamingRole) {
                            if (newMember.roles.cache.has(streamingRole.id)) {
                                console.debug(`Removing streaming role from member ${newMember.id} in guild ${newMember.guild?.id}`);
                                await newMember.roles.remove(streamingRole);
                            };
                        } else {
                            console.warn(`Streaming role not found in guild '${newMember.guild?.name}' (${oldMember.guild?.id || newMember.guild?.id})`);
                        };
                    };
                } else {
                    console.warn(`Logs for member nickname update not enabled in guild '${newMember.guild?.name}' (${oldMember.guild?.id || newMember.guild?.id})`);
                };
            } else {
                console.error(`Server '${newMember.guild?.name}' (${oldMember.guild?.id || newMember.guild?.id}) not registered in database`);
            };

            return;
        } else {
            console.error(`Member of ID ${newMember.id} not in a guild`);
            return;
        };
    });