/**
 * Enum representing the code name of the bot command category.
 */
class BotCommandCategory {
    public static CONFIG: string = "config";
    public static MOD: string = "moderator";
    public static UTIL: string = "util";
    public static GAME: string = "fun";

    /**
     * Returns all values of the BotCommandCategory enum.
     */
    public static values(): string[] {
        return [
            this.CONFIG,
            this.MOD,
            this.UTIL,
            this.GAME,
        ];
    }
}

export default BotCommandCategory;