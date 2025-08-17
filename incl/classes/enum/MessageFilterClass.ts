/**
 * @enum Enum representing the code name for the type of automated filter.
 */
enum MessageFilterClass {
    SWEAR = "swearFilter",
    URL = "linkFilter",
    INV = "inviteFilter",
    DUPETXT = "dupetextFilter",
    MASSPING = "massmentionFilter",
};

/**
 * Returns all values of the MessageFilterClass enum.
 */
export const MessageFilterClassValues = Object.values(MessageFilterClass);

export default MessageFilterClass;