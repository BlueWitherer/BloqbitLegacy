/**
 * Enum representing the type of server action to be logged.
 */
enum ServerLogEventType {
    AutoModerator = "bloqbit_automoderator",
    Moderator = "moderator_actions",
    ServerUpdate = "server_update",
    ServerInvites = "server_invites",
    MemberJoin = "member_join",
    MemberLeave = "member_leave",
    MemberTimeout = "member_timeout",
    MemberBan = "member_ban",
    MemberKick = "member_kick",
    MemberNickname = "member_nickname update",
    MessageDelete = "message_delete",
    MessageEdit = "message_edit",
    MessagePin = "message_pin",
    MessageBulkDelete = "message_bulkdelete",
    MessageRemoveReactions = "message_reactions_removed",
    RoleCreate = "role_create",
    RoleUpdate = "role_update",
    RoleDelete = "role_delete",
    RoleGive = "role_give",
    RoleTake = "role_take",
    ChannelCreate = "channel_create",
    ChannelUpdate = "channel_update",
    ChannelDelete = "channel_delete",
    VoiceJoin = "voice_join",
    VoiceMove = "voice_move",
    VoiceLeave = "voice_leave",
};

/**
 * Returns all values of the ServerLogEventType enum.
 */
export const ServerLogEventTypeValues = Object.values(ServerLogEventType);

export default ServerLogEventType;