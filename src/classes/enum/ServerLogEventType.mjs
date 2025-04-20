/**
 * @enum {string} Type of server action to be logged.
 */
// @ts-ignore
class ServerLogEventType {
    static AutoModerator = "automod";
    static Moderator = "mod";
    static ServerInvites = "serverInv";
    static MemberJoin = "memJoin";
    static MemberLeave = "memLeave";
    static MemberTimeout = "memTimeout";
    static MemberBan = "memBan";
    static MemberNickname = "memNickname";
    static MessageDelete = "msgDel";
    static MessageEdit = "msgUpd";
    static MessagePin = "msgPin";
    static MessageBulkDelete = "msgBulkDel";
    static MessageRemoveReactions = "remAllReact";
    static RoleCreate = "rolesAdd";
    static RoleDelete = "rolesRem";
    static RoleGive = "rolesAssign";
    static RoleTake = "rolesUnassign";
    static ChannelCreate = "channelAdd";
    static ChannelUpdate = "channelUpd";
    static ChannelDelete = "channelRem";

    static values() {
        return [
            this.AutoModerator,
            this.Moderator,
            this.ServerInvites,
            this.MemberJoin,
            this.MemberLeave,
            this.MemberTimeout,
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
        ];
    };
};

export default ServerLogEventType;