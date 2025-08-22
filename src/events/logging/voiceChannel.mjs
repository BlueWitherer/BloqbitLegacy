import { Events, EmbedBuilder, GuildMember, VoiceState } from "discord.js";

import { BloqbitClient, BotEvent, log } from "#bloqbit/include";

import fetch from "#bloqbit/modules/fetch";

export default new BotEvent(
    Events.VoiceStateUpdate,
    /**
     * 
     * @param {BloqbitClient} bot
     * @param {unknown[]} args
     * 
     * @returns {Promise<void>}
     */
    async (bot, ...args) => {
        const oldState = /** @type {VoiceState} */ (args[0]);
        const newState = /** @type {VoiceState} */ (args[1]);

        if (oldState.guild && newState.guild) {
            log.debug(`Handling member voice chat log event on guild of ID ${oldState.guild?.id || newState.guild?.id}...`);
            const system = await fetch.fetchGuild(oldState.guild?.id || newState.guild?.id, bot.db);

            if (system) {
                if (system.logs.enabled && (system.logs.actions.vcJoin)) {
                    const emb = new EmbedBuilder({
                        "author": {
                            "name": `${newState.member?.user?.username}`,
                            "icon_url": `${newState.member?.user?.displayAvatarURL({ "forceStatic": false, size: 64 })}`,
                        },
                        "title": `:heavy_plus_sign: User Joined Voice Channel`,
                        "color": bot.assets.colors.primary,
                        "fields": [
                            {
                                "name": "User",
                                "value": `<@!${newState.member?.user?.id}>`,
                                "inline": false,
                            },
                            {
                                "name": "Channel",
                                "value": `<#${newState.channel?.id}>`,
                                "inline": true,
                            },
                        ],
                    }).data;

                    if (!oldState.channel && newState.channel) await fetch.sendLog(bot.client, system, bot.db, emb, newState.guild);
                } else {
                    log.warn(`Logs for member voice chat joins not enabled in guild '${newState.member?.guild?.name}' (${oldState.guild?.id || newState.guild?.id})`);
                };

                if (system.logs.enabled && (system.logs.actions.vcLeave)) {
                    const emb = new EmbedBuilder({
                        "author": {
                            "name": `${oldState.member?.user?.username}`,
                            "icon_url": `${oldState.member?.user?.displayAvatarURL({ "forceStatic": false, size: 64 })}`,
                        },
                        "title": `:heavy_minus_sign: User Left Voice Channel`,
                        "color": bot.assets.colors.secondary,
                        "fields": [
                            {
                                "name": "User",
                                "value": `<@!${oldState.member?.user?.id}>`,
                                "inline": false,
                            },
                            {
                                "name": "Channel",
                                "value": `<#${oldState.channel?.id}>`,
                                "inline": true,
                            },
                        ],
                    }).data;

                    if (oldState.channel && !newState.channel) await fetch.sendLog(bot.client, system, bot.db, emb, newState.guild);
                } else {
                    log.warn(`Logs for member voice chat leaves not enabled in guild '${newState.member?.guild?.name}' (${oldState.guild?.id || newState.guild?.id})`);
                };

                if (system.logs.enabled && (system.logs.actions.vcMove)) {
                    const emb = new EmbedBuilder({
                        "author": {
                            "name": `${newState.member?.user?.username}`,
                            "icon_url": `${newState.member?.user?.displayAvatarURL({ "forceStatic": false, size: 64 })}`,
                        },
                        "title": `:information_source: User Moved To Voice Channel`,
                        "color": bot.assets.colors.tertiary,
                        "fields": [
                            {
                                "name": "User",
                                "value": `<@!${newState.member?.user?.id}>`,
                                "inline": false,
                            },
                            {
                                "name": "Previous Channel",
                                "value": `<#${oldState.channel?.id}>`,
                                "inline": true,
                            },
                            {
                                "name": "Current Channel",
                                "value": `<#${newState.channel?.id}>`,
                                "inline": true,
                            },
                        ],
                    }).data;

                    if ((oldState.channel && newState.channel) && (oldState.channel?.id !== newState.channel?.id)) await fetch.sendLog(bot.client, system, bot.db, emb, newState.guild);
                } else {
                    log.warn(`Logs for member voice chat moves not enabled in guild '${newState.member?.guild?.name}' (${oldState.guild?.id || newState.guild?.id})`);
                };
            } else {
                log.error(`Server '${newState.member?.guild?.name}' (${oldState.guild?.id || newState.guild?.id}) not registered in database`);
            };

            return;
        } else {
            log.error(`Voice channel of ID ${newState.member?.id} not in a guild`);
            return;
        };
    });