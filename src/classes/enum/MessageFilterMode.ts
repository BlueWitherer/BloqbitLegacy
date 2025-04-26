/**
 * Enum representing the type of filtering.
 */
class MessageFilterMode {
    /** Include filter mode */
    public static INCLUDE: number = 1;

    /** Exclude filter mode */
    public static EXCLUDE: number = 0;

    /**
     * Returns all values of the MessageFilterMode enum.
     */
    public static values(): number[] {
        return [
            this.INCLUDE,
            this.EXCLUDE,
        ];
    }
}

export default MessageFilterMode;