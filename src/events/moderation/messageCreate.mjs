import { Events, Message, ChannelType } from "discord.js";

import { BloqbitClient, BotEvent } from "#bloqbit/include";

import fetch from "#bloqbit/modules/fetch";
import moderation from "../../modules/moderation.js";

export default new BotEvent(
    Events.MessageCreate,
    /**
     * 
     * @param {BloqbitClient} bot
     * @param {unknown[]} args
     * 
     * @returns {Promise<void>}
     */
    async (bot, ...args) => {
        const msg = /** @type {import("discord.js").OmitPartialGroupDMChannel<Message>} */ (args[0]);

        if (msg.guild) {
            console.debug(`Handling created message moderation event on guild of ID ${msg.guild?.id || msg.guildId}...`);
            const system = await fetch.fetchGuild((msg.guild?.id || msg.guildId) ?? '', bot.db);

            if (system) {
                // automod
                if (system.automod.enabled) {
                    try {
                        if (msg.author?.bot) {
                            console.warn(`Message author of ID ${msg.author?.id} is a bot`);
                        } else {
                            await (async () => {
                                const inF = moderation.inFilter(system, msg);
                                const liF = moderation.elFilter(system, msg);
                                const blF = moderation.blFilter(system, msg);
                                const dtF = moderation.dtFilter(system, msg);

                                if (inF.punishment >= 1) return await moderation.punish(inF.punishment, msg, inF.warning.value);
                                if (liF.punishment >= 1) return await moderation.punish(liF.punishment, msg, liF.warning.value);
                                if (blF.punishment >= 1) return await moderation.punish(blF.punishment, msg, blF.warning.value);
                                if (dtF.punishment >= 1) return await moderation.punish(dtF.punishment, msg, dtF.warning.value);
                            })();

                            console.debug(`Message of ID ${msg.id} handled with moderation filters`);
                        };
                    } catch (err) {
                        console.trace(err);
                    };
                } else {
                    console.warn(`Auto-moderator not enabled in guild '${msg.guild?.name}' (${msg.guild?.id})`);
                };

                // autopublish
                if (system.autopublish.enabled) {
                    try {
                        if (system.autopublish.channels.includes(msg.channel?.id)) {
                            if (msg.channel?.type === ChannelType.GuildAnnouncement) {
                                if (!msg.author?.bot || (msg.author?.bot && system.autopublish.bots)) {
                                    if (msg.crosspostable) {
                                        await msg.crosspost();
                                    } else {
                                        console.error(`Message of ID ${msg.id} could not be published`);
                                    };
                                } else {
                                    console.error(`Message author of ID ${msg.author?.id} is invalid`);
                                };
                            } else {
                                console.error(`Channel of ID ${msg.channel?.id} is not an announcement channel`);
                            };
                        } else {
                            console.warn(`Channel of ID ${msg.channel?.id} not included in auto-publisher`);
                        };
                    } catch (err) {
                        console.trace(err);
                    };
                } else {
                    console.warn(`Auto-publisher not enabled in guild '${msg.guild?.name}' (${msg.guild?.id})`);
                };
            } else {
                console.error(`Server '${msg.guild?.name}' (${msg.guild?.id}) not registered in database`);
            };

            return;
        } else {
            console.error(`Message of ID ${msg.id} not in a guild`);
            return;
        };
    });