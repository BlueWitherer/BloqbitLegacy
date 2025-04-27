/**
 * Enum representing the type of server action to be logged.
 */
enum ServerLogEventType {
    AutoModerator = "Bloqbit auto-moderator",
    Moderator = "moderator actions",
    ServerUpdate = "server update",
    ServerInvites = "server invites",
    MemberJoin = "member join",
    MemberLeave = "member leave",
    MemberTimeout = "member timeout",
    MemberBan = "member ban",
    MemberKick = "member kick",
    MemberNickname = "member nickname update",
    MessageDelete = "message delete",
    MessageEdit = "message edit",
    MessagePin = "message pin",
    MessageBulkDelete = "message bulk delete",
    MessageRemoveReactions = "message reactions removed",
    RoleCreate = "role create",
    RoleUpdate = "role update",
    RoleDelete = "role delete",
    RoleGive = "role assign",
    RoleTake = "role unassign",
    ChannelCreate = "channel create",
    ChannelUpdate = "channel update",
    ChannelDelete = "channel delete",
    VoiceJoin = "voice join",
    VoiceMove = "voice move",
    VoiceLeave = "voice leave",
};

/**
 * Returns all values of the ServerLogEventType enum.
 */
export const ServerLogEventTypeValues = Object.values(ServerLogEventType);

export default ServerLogEventType;