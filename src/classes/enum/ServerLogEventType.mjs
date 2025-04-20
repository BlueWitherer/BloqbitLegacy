/**
 * @enum {string} Type of server action to be logged.
 */
// @ts-ignore
class ServerLogEventType {
    static AutoModerator = "autoMod";
    static Moderator = "moderator";
    static ServerInvites = "invites";
    static MemberJoin = "join";
    static MemberLeave = "leave";
    static MemberTimeout = "timeout";
    static MemberBan = "ban";
    static MemberKick = "kick";
    static MemberNickname = "nickname";
    static MessageDelete = "msgDel";
    static MessageEdit = "msgUpd";
    static MessagePin = "msgPin";
    static MessageBulkDelete = "msgBulkDel";
    static MessageRemoveReactions = "remAllReact";
    static RoleCreate = "rolesAdd";
    static RoleUpdate = "rolesUpd";
    static RoleDelete = "rolesRem";
    static RoleGive = "rolesAssign";
    static RoleTake = "rolesUnassign";
    static ChannelCreate = "channelAdd";
    static ChannelUpdate = "channelUpd";
    static ChannelDelete = "channelRem";
    static VoiceJoin = "vcJoin";
    static VoiceMove = "vcMove";
    static VoiceLeave = "vcLeave";

    static values() {
        return [
            this.AutoModerator,
            this.Moderator,
            this.ServerInvites,
            this.MemberJoin,
            this.MemberLeave,
            this.MemberTimeout,
            this.MemberBan,
            this.MemberKick,
            this.MemberNickname,
            this.MessageDelete,
            this.MessageEdit,
            this.MessagePin,
            this.MessageBulkDelete,
            this.MessageRemoveReactions,
            this.RoleCreate,
            this.RoleDelete,
            this.RoleGive,
            this.RoleTake,
            this.ChannelCreate,
            this.ChannelUpdate,
            this.ChannelDelete,
            this.VoiceJoin,
            this.VoiceMove,
            this.VoiceLeave,
        ];
    };
};

export default ServerLogEventType;