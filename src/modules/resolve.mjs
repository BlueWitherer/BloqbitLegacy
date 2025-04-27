import { ModeratorActionType, MessageFilterMode } from '../classes.js';

export default {
    /**
     * 
     * @param {string} name Title of the warning
     * @param {string} description Description of the warning
     */
    msgWarning: (name, description) => {
        try {
            return {
                name: name,
                value: description,
            };
        } catch (err) {
            console.error(err);

            return {
                name: "Error",
                value: "An internal error occurred.",
            };
        };
    },

    /**
     * 
     * @param {number} value Punishment level
     * @param {{ name: string, value: string }} object Discord embed field
     */
    warnObj: (value, object) => {
        try {
            return {
                punishment: Number(value),
                warning: {
                    name: object.name,
                    value: object.value,
                },
            };
        } catch (err) {
            console.error(err);

            return {
                punishment: 0,
                warning: {
                    name: "Error",
                    value: "An internal error occurred.",
                },
            };
        };
    },

    /**
     * 
     * @param {number} punish Punishment ID.
     * 
     * @returns {string} Punishment name.
     */
    punishmentType: (punish) => {
        switch (punish) {
            case ModeratorActionType.Ban:
                return "ban";

            case ModeratorActionType.Softban:
                return "softban";

            case ModeratorActionType.Kick:
                return "kick";

            case ModeratorActionType.Blacklist:
                return "blacklist";

            case ModeratorActionType.Timeout:
                return "timeout";

            case ModeratorActionType.Mute:
                return "mute";

            case ModeratorActionType.Warn:
                return "warn";

            case ModeratorActionType.None:
                return "none";

            default:
                return "none";
        };
    },

    /**
     * 
     * @param {MessageFilterMode} mode Filter mode ID.
     * 
     * @returns {string} Filter mode name.
     */
    filterMode: (mode) => {
        switch (mode) {
            case MessageFilterMode.INCLUDE:
                return "include";

            case MessageFilterMode.EXCLUDE:
                return "exclude";

            default:
                return "exclude";
        };
    },

    /**
     * 
     * @param {boolean} bool If-enabled boolean
     * @param {boolean} emote Include emote
     * 
     * @returns {string} "enabled" or "disabled" with or without emote
     */
    abled: (bool, emote = false) => {
        /**
         * 
         * @param {boolean} e Emote
         * @param {boolean} b If enabled
         * 
         * @returns {string}
         */
        const addEmote = (e, b) => {
            if (e) {
                if (b) {
                    return "✅ ";
                } else {
                    return "❌ ";
                };
            } else {
                return "";
            };
        };

        if (bool) {
            return addEmote(emote, bool) + "enabled";
        } else {
            return addEmote(emote, bool) + "disabled";
        };
    },

    /**
     * 
     * @param {number} number Amount.
     * @param {string} singular Singular word.
     * @param {string} plural Plural word.
     * 
     * @returns {string} Singular or plural based on amount.
     */
    isPlural: (number, singular, plural) => {
        if (number < 1 || 1 < number) {
            return plural;
        } else {
            return singular;
        };
    },

    /**
     * 
     * @param {Number} x Number
     * 
     * @returns {string} String of number with thousand-digit commas
     */
    numberWithCommas: (x) => {
        try {
            if (Number.isSafeInteger(x)) {
                const numString = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                console.debug(numString);
                return numString;
            } else {
                console.error(`${x} is not a number`);
                return "0";
            };
        } catch (err) {
            console.error(err);
            return "0";
        };
    },

    /**
     * 
     * @param {number} num Full number
     * 
     * @returns {string} Abbreviated number
     */
    abbreviateNumber: (num) => {
        if (num >= 1e9) {
            return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
        } else if (num >= 1e6) {
            return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
        } else if (num >= 1e3) {
            return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
        } else {
            return num.toString();
        };
    },
};