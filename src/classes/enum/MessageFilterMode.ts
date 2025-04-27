/**
 * Enum representing the type of filtering.
 */
enum MessageFilterMode {
    INCLUDE = 1,
    EXCLUDE = 0,
};

/**
 * Returns all values of the MessageFilterMode enum.
 */
export const MessageFilterModeValues = Object.values(MessageFilterMode).filter(
    (value) => typeof value === "number"
) as number[];

export default MessageFilterMode;