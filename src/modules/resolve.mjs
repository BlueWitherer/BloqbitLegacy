import fs from 'fs';
import path from 'path';
import { ModeratorActionType, MessageFilterMode, Config } from "../classes.mjs";

export default {
    /**
     * 
     * @param {object} obj The object to copy from
     * 
     * @returns {Config} The new object with the values copied to it
     */
    deepCopySettings: (obj) => {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        };

        const objCopy = new Config({}).toObject();

        for (const key in obj) {
            if (key !== "_id") objCopy[key] = obj[key];
        };

        return objCopy;
    },

    /**
     * 
     * @param {array} array The array 
     * @param {any} value The value to query
     * 
     * @returns {array | void} The array with the value removed
     */
    removeArrayItem: (array, value) => {
        if (array && value !== null) {
            try {
                const index = array.indexOf(value);

                if (index > -1) {
                    array.splice(index, 1);
                    return array;
                } else {
                    return array;
                };
            } catch (err) {
                return console.error(err);
            };
        } else {
            return [];
        };
    },

    /**
     * 
     * @param {number} number Number
     * 
     * @returns {boolean | null} Boolean from number
     */
    boolNumber: (number) => {
        if (number <= 0 || number >= 1) {
            try {
                if (number > 0) {
                    return true;
                } else {
                    return false;
                };
            } catch (err) {
                console.error(err);
                return null;
            };
        } else {
            return null;
        };
    },

    /**
     * 
     * @param {boolean} bool Boolean
     * 
     * @returns {number} Number from boolean
     */
    numberBool: (bool) => {
        bool = Boolean(bool);

        if (bool === true || bool === false) {
            try {
                if (bool) {
                    return 1;
                } else {
                    return 0;
                };
            } catch (err) {
                console.error(err);
                return -1;
            };
        } else {
            return -1;
        };
    },

    /**
     * 
     * @param {string} string String JSON
     * 
     * @returns {any} JSON object
     */
    parseJson: (string) => {
        if (string) {
            try {
                return JSON.parse(string);
            } catch (err) {
                return console.error(err);
            };
        } else {
            return {};
        };
    },

    /**
     * 
     * @param {any} parsed JSON object
     * 
     * @returns {string} Parsed JSON object
     */
    stringJson: (parsed) => {
        if (parsed) {
            try {
                return JSON.stringify(parsed);
            } catch (err) {
                console.error(err);
                return "";
            };
        } else {
            return "";
        };
    },

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
     * @param {boolean} bool Boolean
     * 
     * @returns {string} "enabled" or "disabled"
     */
    abled: (bool) => {
        if (bool) {
            return "enabled";
        } else {
            return "disabled";
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
            return singular
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
                console.error(`${x} is not a number.`);
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

    /**
     * 
     * @param {string} filePath Full path to the file
     */
    importJson: async (filePath) => {
        try {
            const absolutePath = path.join(__dirname, filePath);
            const data = fs.readFileSync(absolutePath, {
                encoding: "utf-8",
            });

            return JSON.parse(data);
        } catch (err) {
            console.error('Error reading JSON file: ', err);
        };
    },
};