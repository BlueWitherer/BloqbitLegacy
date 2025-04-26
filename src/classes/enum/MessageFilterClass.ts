/**
 * Enum representing the code name for the type of automated filter.
 */
class MessageFilterClass {
    /** Swear filter */
    public static SWEAR: string = "swearFilter";

    /** Link filter */
    public static URL: string = "linkFilter";

    /** Invite filter */
    public static INV: string = "inviteFilter";

    /** Duplicate text filter */
    public static DUPETXT: string = "dupetextFilter";

    /** Mass mention filter */
    public static MASSPING: string = "massmentionFilter";

    /**
     * Returns all values of the MessageFilterClass enum.
     */
    public static values(): string[] {
        return [
            this.SWEAR,
            this.URL,
            this.INV,
            this.DUPETXT,
            this.MASSPING,
        ];
    }
}

export default MessageFilterClass;