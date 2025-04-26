import { GuildMember, Message } from 'discord.js';

import resolve from './resolve.mjs';

import { ModeratorActionType, Config } from '../classes.mjs';

/**
 * Per-user antispam - mutes user if threshold is met
 * @type {Map<String, Array<String>>} User ID, array of message IDs
 */
const antispamMap = new Map();

/**
 * Per-channel antiraid - locks server if threshold is met
 * @type {Map<String, Array<String>>} Channel ID, array of message IDs
 */
const antiraidMap = new Map();

/**
 * Per-server antiraid - kicks all users that joined too quickly at once
 * @type {Map<String, Array<String>>} Server ID, array of user IDs
 */
const antialtsMap = new Map();

export default {
    /**
     * 
     * @param {number} level Severity of punishment
     * @param {Message} message Server member to receive punishment
     * @param {string} reason Reason behind punishment
     * 
     * @returns {Promise<void>}
     */
    punish: async (level, message, reason) => {
        if (level > ModeratorActionType.Ban) level = ModeratorActionType.Ban;

        /**
         * 
         * @param {GuildMember} m Member to ban
         * @param {string} r Reason for ban
         */
        const ban = async (m, r) => {
            await m.ban({
                "reason": r,
                "deleteMessageSeconds": 7 * 86400,
            });
        };

        /**
         * 
         * @param {GuildMember} m Member to softban
         * @param {string} r Reason for softban
         */
        const softban = async (m, r) => {
            const g = m.guild;

            await m.ban({
                "reason": r,
                "deleteMessageSeconds": 7 * 86400,
            });

            await g.members?.unban(m.user, r);
        };

        /**
         * 
         * @param {GuildMember} m Member to timeout
         * @param {string} r Reason for timeout
         */
        const timeout = async (m, r) => {
            await m.timeout(7 * 86400000, r);
        };

        if (message.member) {
            switch (level) {
                case ModeratorActionType.Warn:
                    //warn
                    console.debug(`${message.guild?.name} • Priority II Auto-moderator Author ${message.author?.id} of message ${message.id} warned.`);
                    break;

                case ModeratorActionType.Mute:
                    //mute
                    console.debug(`${message.guild?.name} • Priority II Auto-moderator Author ${message.author?.id} of message ${message.id} muted.`);
                    break;

                case ModeratorActionType.Timeout:
                    await timeout(message.member, reason);
                    console.debug(`${message.guild?.name} • Priority II Auto-moderator Author ${message.author?.id} of message ${message.id} timed out.`);
                    break;

                case ModeratorActionType.Blacklist:
                    //blacklist
                    console.debug(`${message.guild?.name} • Priority II Auto-moderator Author ${message.author?.id} of message ${message.id} blacklisted.`);
                    break;

                case ModeratorActionType.Softban:
                    await softban(message.member, reason);
                    console.debug(`${message.guild?.name} • Priority II Auto-moderator Author ${message.author?.id} of message ${message.id} soft-banned.`);
                    break;

                case ModeratorActionType.Ban:
                    await ban(message.member, reason);
                    console.debug(`${message.guild?.name} • Priority II Auto-moderator Author ${message.author?.id} of message ${message.id} banned.`);
                    break;

                default:
                    console.error(`${message.guild?.name} • Priority II Auto-moderator Server settings not resolvable`);
                    break;
            };
        };
    },

    /**
     * 
     * @param {Message} msg Discord message to add to spam lists
     * 
     * @returns {void}
     */
    antiMessages: (msg) => {
        console.warn("Anti-spam in W.I.P.");
        return;
    },

    /**
     * 
     * @param {Config} system Server settings object
     * @param {Message} msg Discord message to inspect
     */
    blFilter: (system, msg) => {
        if (system && msg) {
            try {
                const auto = system.automod;

                if (auto.enabled && auto.swearFilter.enabled) {
                    const blWords = auto.swearFilter.keywords;
                    const blWordsExtra = auto.swearFilter.keywordsSuper;

                    if (blWords.some((v) => msg.content.includes(v))) {
                        return resolve.warnObj(auto.swearFilter.punishment, resolve.msgWarning("Blacklisted Words", "Used words included in the keyword blacklist."));
                    } else if (blWordsExtra.some((v) => msg.content.includes(v))) {
                        return resolve.warnObj(auto.swearFilter.punishment + 1, resolve.msgWarning("Severe Blacklisted Words", "Used words included in the severe keyword blacklist."));
                    } else {
                        return resolve.warnObj(ModeratorActionType.None, resolve.msgWarning("Clear", "Message doesn't violate rule."));
                    };
                } else {
                    return resolve.warnObj(ModeratorActionType.None, resolve.msgWarning("Clear", "Filter disabled."));
                };
            } catch (err) {
                console.error(err);
                return resolve.warnObj(ModeratorActionType.None, resolve.msgWarning("Clear", "Programming error."));
            };
        } else {
            return resolve.warnObj(ModeratorActionType.None, resolve.msgWarning("Clear", "Programming error."));
        };
    },

    /**
     * 
     * @param {Config} system Server settings object
     * @param {Message} msg Discord message to inspect
     * 
     * @returns {{ punishment: number, warning: { name: string, value: string }}} Warning object
     */
    elFilter: (system, msg) => {
        if (system && msg) {
            try {
                const auto = system.automod;

                if (auto.enabled && auto.linkFilter.enabled) {
                    const urlRegex = new RegExp("\\bhttps?:\\/\\/[^\\s/$.?#].[^\\s]*");

                    if (urlRegex.test(msg.content)) {
                        return resolve.warnObj(auto.linkFilter.punishment, resolve.msgWarning("External URL", "Posted an external URL with the message."));
                    } else {
                        return resolve.warnObj(ModeratorActionType.None, resolve.msgWarning("Clear", "Message doesn't violate rule."));
                    };
                } else {
                    return resolve.warnObj(ModeratorActionType.None, resolve.msgWarning("Clear", "Filter disabled."));
                };
            } catch (err) {
                console.error(err);
                return resolve.warnObj(ModeratorActionType.None, resolve.msgWarning("Clear", "Programming error."));
            };
        } else {
            return resolve.warnObj(ModeratorActionType.None, resolve.msgWarning("Clear", "Programming error."));
        };
    },

    /**
     * 
     * @param {Config} system Server settings object
     * @param {Message} msg Discord message to inspect
     */
    inFilter: (system, msg) => {
        if (system && msg) {
            try {
                const auto = system.automod;

                if (auto.enabled && auto.inviteFilter.enabled) {
                    const inviteRegex = new RegExp("\\b(?:https?:\\/\\/)?(?:www\\.)?(?:discord\\.gg\\/[a-zA-Z0-9]+|discord\\.com\\/invite\\/[a-zA-Z0-9]+)\\b", 'g');

                    if (inviteRegex.test(msg.content)) {
                        console.debug(`Message ${msg.id} violates invite rule`);
                        return resolve.warnObj(auto.inviteFilter.punishment, resolve.msgWarning("Server Invite", "Posted a server invite with the message."));
                    } else {
                        return resolve.warnObj(ModeratorActionType.None, resolve.msgWarning("Clear", "Message doesn't violate rule."));
                    };
                } else {
                    return resolve.warnObj(ModeratorActionType.None, resolve.msgWarning("Clear", "Filter disabled."));
                };
            } catch (err) {
                console.error(err);
                return resolve.warnObj(ModeratorActionType.None, resolve.msgWarning("Clear", "Programming error."));
            };
        } else {
            return resolve.warnObj(ModeratorActionType.None, resolve.msgWarning("Clear", "Programming error."));
        };
    },

    /**
     * 
     * @param {Config} system Server settings object
     * @param {Message} msg Discord message to inspect
     */
    dtFilter: (system, msg) => {
        if (system && msg) {
            try {
                const auto = system.automod;

                if (auto.enabled && auto.inviteFilter.enabled) {
                    const wordRegex = /\b(\w+)\b/g; // Regex to match words

                    /**
                     * @type {Object<string, number>} Word counts
                     */
                    const wordCounts = {};
                    let match;

                    // Find and count each word
                    while ((match = wordRegex.exec(msg.content)) !== null) {
                        const word = match[1].toLowerCase();
                        wordCounts[word] = (wordCounts[word] || 0) + 1;
                    };

                    // Find duplicates
                    const duplicates = Object.keys(wordCounts).filter(word => wordCounts[word] > 1);

                    if (duplicates.length > 1) {
                        console.debug(`Message ${msg.id} violates dupe text rule`);
                        return resolve.warnObj(auto.inviteFilter.punishment, resolve.msgWarning("Duplicate Text", "Posted a message with duplicate text."));
                    } else {
                        return resolve.warnObj(ModeratorActionType.None, resolve.msgWarning("Clear", "Message doesn't violate rule."));
                    };
                } else {
                    return resolve.warnObj(ModeratorActionType.None, resolve.msgWarning("Clear", "Filter disabled."));
                };
            } catch (err) {
                console.error(err);
                return resolve.warnObj(ModeratorActionType.None, resolve.msgWarning("Clear", "Programming error."));
            };
        } else {
            return resolve.warnObj(ModeratorActionType.None, resolve.msgWarning("Clear", "Programming error."));
        };
    },
};