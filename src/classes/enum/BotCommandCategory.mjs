/**
 * @enum {string} Code name of the bot command category.
 */
class BotCommandCategory {
    static CONFIG = "config";
    static MOD = "moderator";
    static UTIL = "util";
    static GAME = "fun";

    static values() {
        return [
            this.CONFIG,
            this.MOD,
            this.UTIL,
            this.GAME,
        ];
    };
};

export default BotCommandCategory;