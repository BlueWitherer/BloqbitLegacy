/**
 * @enum Enum representing the code name of the bot command category.
 */
enum BotCommandCategory {
    CONFIG = "config",
    MOD = "moderator",
    UTIL = "util",
    GAME = "fun",
};

/**
 * Returns all values of the BotCommandCategory enum.
 */
export const BotCommandCategoryValues = Object.values(BotCommandCategory);

export default BotCommandCategory;