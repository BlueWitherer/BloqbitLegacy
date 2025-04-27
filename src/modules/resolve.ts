import { ModeratorActionType, MessageFilterMode } from '../classes.js';

export interface Warning {
    name: string;
    value: string;
};

export interface WarnObject {
    punishment: number;
    warning: Warning;
};

export default {
    /**
     * Creates a warning object.
     * 
     * @param name Title of the warning.
     * @param description Description of the warning.
     * 
     * @returns A warning object.
     */
    msgWarning: (name: string, description: string): Warning => {
        try {
            return { name, value: description };
        } catch (err) {
            console.error(err);
            return { name: "Error", value: "An internal error occurred." };
        };
    },

    /**
     * Creates a warn object.
     * @param value Punishment level.
     * @param object Discord embed field.
     * 
     * @returns A warn object.
     */
    warnObj: (value: number, object: Warning): WarnObject => {
        try {
            return {
                punishment: Number(value),
                warning: { name: object.name, value: object.value },
            };
        } catch (err) {
            console.error(err);
            return {
                punishment: 0,
                warning: { name: "Error", value: "An internal error occurred." },
            };
        };
    },

    /**
     * Gets the punishment type name.
     * 
     * @param punish Punishment ID.
     * 
     * @returns Punishment name.
     */
    punishmentType: (punish: number): string => {
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
     * Gets the filter mode name.
     * 
     * @param mode Filter mode ID.
     * 
     * @returns Filter mode name.
     */
    filterMode: (mode: MessageFilterMode): string => {
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
     * Returns "enabled" or "disabled" with or without an emote.
     * 
     * @param bool If-enabled boolean.
     * @param emote Include emote.
     * 
     * @returns "enabled" or "disabled" with or without emote.
     */
    abled: (bool: boolean, emote: boolean = false): string => {
        const addEmote = (e: boolean, b: boolean): string => {
            if (e) {
                return b ? "✅ " : "❌ ";
            };

            return "";
        };

        return addEmote(emote, bool) + (bool ? "enabled" : "disabled");
    },

    /**
     * Determines singular or plural based on the amount.
     * 
     * @param number - Amount.
     * @param singular - Singular word.
     * @param plural - Plural word.
     * 
     * @returns Singular or plural based on amount.
     */
    isPlural: (number: number, singular: string, plural: string): string => {
        return number === 1 ? singular : plural;
    },

    /**
     * Formats a number with thousand-digit commas.
     * 
     * @param x - Number.
     * 
     * @returns String of number with thousand-digit commas.
     */
    numberWithCommas: (x: number): string => {
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
     * Abbreviates a number.
     * 
     * @param num - Full number.
     * 
     * @returns Abbreviated number.
     */
    abbreviateNumber: (num: number): string => {
        if (num >= 1e9) {
            return (num / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
        } else if (num >= 1e6) {
            return (num / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
        } else if (num >= 1e3) {
            return (num / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
        } else {
            return num.toString();
        };
    },
};