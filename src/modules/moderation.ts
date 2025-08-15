import resolve from './resolve.js';

export interface Warning {
    name: string;
    value: string;
};

export interface WarnObject {
    punishment: ModeratorActionType;
    warning: Warning;
};

import { Config, ModeratorActionType } from '../include.js';

import { GuildMember, Message } from 'discord.js';

export default {
    /**
     * Punishes a user based on the severity level.
     * 
     * @param level - Severity of punishment.
     * @param message - Discord message triggering the punishment.
     * @param reason - Reason for the punishment.
     */
    punish: async (level: ModeratorActionType, message: Message, reason: string): Promise<void> => {
        if (level > ModeratorActionType.Ban) level = ModeratorActionType.Ban;

        const ban = async (member: GuildMember, reason: string): Promise<void> => {
            await member.ban({
                reason,
                deleteMessageSeconds: 7 * 86400, // 7 days
            });
        };

        const softban = async (member: GuildMember, reason: string): Promise<void> => {
            const guild = member.guild;

            await member.ban({
                reason,
                deleteMessageSeconds: 7 * 86400, // 7 days
            });

            await guild.members.unban(member.user, reason);
        };

        const timeout = async (member: GuildMember, reason: string): Promise<void> => {
            await member.timeout(7 * 86400000, reason); // 7 days
        };

        if (message.member) {
            try {
                switch (level) {
                    case ModeratorActionType.Warn:
                        console.info(`[MOD] ${message.guild?.name} - User ${message.author?.id} warned for message ${message.id}`);
                        break;

                    case ModeratorActionType.Mute:
                        console.info(`[MOD] ${message.guild?.name} - User ${message.author?.id} muted for message ${message.id}`);
                        break;

                    case ModeratorActionType.Timeout:
                        await timeout(message.member, reason);
                        console.info(`[MOD] ${message.guild?.name} - User ${message.author?.id} timed out for message ${message.id}`);
                        break;

                    case ModeratorActionType.Softban:
                        await softban(message.member, reason);
                        console.info(`[MOD] ${message.guild?.name} - User ${message.author?.id} soft-banned for message ${message.id}`);
                        break;

                    case ModeratorActionType.Ban:
                        await ban(message.member, reason);
                        console.info(`[MOD] ${message.guild?.name} - User ${message.author?.id} banned for message ${message.id}`);
                        break;

                    case ModeratorActionType.None:
                        console.debug(`[MOD] ${message.guild?.name} - User ${message.author?.id} not affected for message ${message.id}`);
                        break;

                    default:
                        console.error(`[MOD] ${message.guild?.name} - Invalid punishment level`);
                        break;
                };
            } catch (err) {
                console.trace(err);
            };
        } else {
            console.error(`[MOD] ${message.guild?.name} - Invalid member`);
        };
    },

    /**
     * Filters messages for blacklisted words.
     * 
     * @param system - Server settings object.
     * @param msg - Discord message to inspect.
     * 
     * @returns A warning object.
     */
    blFilter: (system: Config, msg: Message): WarnObject => {
        if (system && msg) {
            try {
                const auto = system.automod;

                if (auto.enabled && auto.swearFilter.enabled) {
                    const blWords = auto.swearFilter.keywords;

                    if (blWords.some((v) => msg.content.includes(v))) {
                        return resolve.warnObj(
                            auto.swearFilter.punishment,
                            resolve.msgWarning("Blacklisted Words", "Used words included in the keyword blacklist."),
                        );
                    } else {
                        return resolve.warnObj(
                            ModeratorActionType.None,
                            resolve.msgWarning("Clear", "Message doesn't violate rule."),
                        );
                    };
                } else {
                    return resolve.warnObj(
                        ModeratorActionType.None,
                        resolve.msgWarning("Clear", "Filter disabled."),
                    );
                };
            } catch (err) {
                console.trace(err);

                return resolve.warnObj(
                    ModeratorActionType.None,
                    resolve.msgWarning("Clear", "Programming error."),
                );
            };
        } else {
            return resolve.warnObj(
                ModeratorActionType.None,
                resolve.msgWarning("Clear", "Programming error."),
            );
        };
    },

    /**
     * Filters messages for external links.
     * 
     * @param system - Server settings object.
     * @param msg - Discord message to inspect.
     * 
     * @returns A warning object.
     */
    elFilter: (system: Config, msg: Message): WarnObject => {
        if (system && msg) {
            try {
                const auto = system.automod;

                if (auto.enabled && auto.linkFilter.enabled) {
                    const urlRegex = /\bhttps?:\/\/[^\s/$.?#].[^\s]*/;

                    if (urlRegex.test(msg.content)) {
                        return resolve.warnObj(
                            auto.linkFilter.punishment,
                            resolve.msgWarning("External URL", "Posted an external URL with the message.")
                        );
                    } else {
                        return resolve.warnObj(
                            ModeratorActionType.None,
                            resolve.msgWarning("Clear", "Message doesn't violate rule.")
                        );
                    };
                } else {
                    return resolve.warnObj(
                        ModeratorActionType.None,
                        resolve.msgWarning("Clear", "Filter disabled.")
                    );
                };
            } catch (err) {
                console.trace(err);

                return resolve.warnObj(
                    ModeratorActionType.None,
                    resolve.msgWarning("Clear", "Programming error.")
                );
            };
        } else {
            return resolve.warnObj(
                ModeratorActionType.None,
                resolve.msgWarning("Clear", "Programming error.")
            );
        };
    },

    /**
     * Filters messages for server invites.
     * 
     * @param system - Server settings object.
     * @param msg - Discord message to inspect.
     * 
     * @returns A warning object.
     */
    inFilter: (system: Config, msg: Message): WarnObject => {
        if (system && msg) {
            try {
                const auto = system.automod;

                if (auto.enabled && auto.inviteFilter.enabled) {
                    const inviteRegex = /\b(?:https?:\/\/)?(?:www\.)?(?:discord\.gg\/[a-zA-Z0-9]+|discord\.com\/invite\/[a-zA-Z0-9]+)\b/;

                    if (inviteRegex.test(msg.content)) {
                        return resolve.warnObj(
                            auto.inviteFilter.punishment,
                            resolve.msgWarning("Server Invite", "Posted a server invite with the message.")
                        );
                    } else {
                        return resolve.warnObj(
                            ModeratorActionType.None,
                            resolve.msgWarning("Clear", "Message doesn't violate rule.")
                        );
                    };
                } else {
                    return resolve.warnObj(
                        ModeratorActionType.None,
                        resolve.msgWarning("Clear", "Filter disabled.")
                    );
                };
            } catch (err) {
                console.trace(err);

                return resolve.warnObj(
                    ModeratorActionType.None,
                    resolve.msgWarning("Clear", "Programming error.")
                );
            };
        } else {
            return resolve.warnObj(
                ModeratorActionType.None,
                resolve.msgWarning("Clear", "Programming error.")
            );
        };
    },

    /**
     * Filters messages for duplicate text.
     * 
     * @param system - Server settings object.
     * @param msg - Discord message to inspect.
     * 
     * @returns A warning object.
     */
    dtFilter: (system: Config, msg: Message): WarnObject => {
        if (system && msg) {
            try {
                const auto = system.automod;

                if (auto.enabled && auto.inviteFilter.enabled) {
                    const wordRegex = /\b(\w+)\b/g;
                    const wordCounts: Record<string, number> = {};
                    let match;

                    while ((match = wordRegex.exec(msg.content)) !== null) {
                        const word = match[1].toLowerCase();
                        wordCounts[word] = (wordCounts[word] || 0) + 1;
                    };

                    const duplicates = Object.keys(wordCounts).filter(word => wordCounts[word] > 1);

                    if (duplicates.length > 1) {
                        return resolve.warnObj(
                            auto.inviteFilter.punishment,
                            resolve.msgWarning("Duplicate Text", "Posted a message with duplicate text.")
                        );
                    } else {
                        return resolve.warnObj(
                            ModeratorActionType.None,
                            resolve.msgWarning("Clear", "Message doesn't violate rule.")
                        );
                    };
                } else {
                    return resolve.warnObj(
                        ModeratorActionType.None,
                        resolve.msgWarning("Clear", "Filter disabled.")
                    );
                };
            } catch (err) {
                console.trace(err);

                return resolve.warnObj(
                    ModeratorActionType.None,
                    resolve.msgWarning("Clear", "Programming error.")
                );
            };
        } else {
            return resolve.warnObj(
                ModeratorActionType.None,
                resolve.msgWarning("Clear", "Programming error.")
            );
        };
    },
};