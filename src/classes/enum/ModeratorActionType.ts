/**
 * Enum representing the type of moderation action.
 */
class ModeratorActionType {
    /** Ban action */
    public static Ban: number = 7;

    /** Softban action */
    public static Softban: number = 6;

    /** Kick action */
    public static Kick: number = 5;

    /** Blacklist action */
    public static Blacklist: number = 4;

    /** Timeout action */
    public static Timeout: number = 3;

    /** Mute action */
    public static Mute: number = 2;

    /** Warn action */
    public static Warn: number = 1;

    /** No action */
    public static None: number = 0;

    /**
     * Returns all values of the ModeratorActionType enum.
     */
    public static values(): number[] {
        return [
            this.Ban,
            this.Softban,
            this.Kick,
            this.Blacklist,
            this.Timeout,
            this.Mute,
            this.Warn,
            this.None,
        ];
    }
}

export default ModeratorActionType;