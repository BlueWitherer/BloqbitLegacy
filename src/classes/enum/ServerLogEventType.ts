/**
 * Enum representing the type of server action to be logged.
 */
enum ServerLogEventType {
    AutoModerator = "autoMod",
    Moderator = "moderator",
    ServerInvites = "invites",
    MemberJoin = "join",
    MemberLeave = "leave",
    MemberTimeout = "timeout",
    MemberBan = "ban",
    MemberKick = "kick",
    MemberNickname = "nickname",
    MessageDelete = "msgDel",
    MessageEdit = "msgUpd",
    MessagePin = "msgPin",
    MessageBulkDelete = "msgBulkDel",
    MessageRemoveReactions = "remAllReact",
    RoleCreate = "rolesAdd",
    RoleUpdate = "rolesUpd",
    RoleDelete = "rolesRem",
    RoleGive = "rolesAssign",
    RoleTake = "rolesUnassign",
    ChannelCreate = "channelAdd",
    ChannelUpdate = "channelUpd",
    ChannelDelete = "channelRem",
    VoiceJoin = "vcJoin",
    VoiceMove = "vcMove",
    VoiceLeave = "vcLeave",
};

/**
 * Returns all values of the ServerLogEventType enum.
 */
export const ServerLogEventTypeValues = Object.values(ServerLogEventType);

export default ServerLogEventType;