/**
 * Enum representing the type of moderation action.
 */
enum ModeratorActionType {
    None = 0,
    Warn = 1,
    Mute = 2,
    Timeout = 3,
    Kick = 4,
    Softban = 5,
    Ban = 6,
};

/**
 * Returns all values of the ModeratorActionType enum.
 */
export const ModeratorActionTypeValues = Object.values(ModeratorActionType).filter(
    (value) => typeof value === "number"
) as number[];

export default ModeratorActionType;