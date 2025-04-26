/**
 * Enum representing the type of server action to be logged.
 */
class ServerLogEventType {
    /** AutoModerator action */
    public static AutoModerator: string = "autoMod";

    /** Moderator action */
    public static Moderator: string = "moderator";

    /** Server invites action */
    public static ServerInvites: string = "invites";

    /** Member join action */
    public static MemberJoin: string = "join";

    /** Member leave action */
    public static MemberLeave: string = "leave";

    /** Member timeout action */
    public static MemberTimeout: string = "timeout";

    /** Member ban action */
    public static MemberBan: string = "ban";

    /** Member kick action */
    public static MemberKick: string = "kick";

    /** Member nickname change action */
    public static MemberNickname: string = "nickname";

    /** Message delete action */
    public static MessageDelete: string = "msgDel";

    /** Message edit action */
    public static MessageEdit: string = "msgUpd";

    /** Message pin action */
    public static MessagePin: string = "msgPin";

    /** Message bulk delete action */
    public static MessageBulkDelete: string = "msgBulkDel";

    /** Message remove reactions action */
    public static MessageRemoveReactions: string = "remAllReact";

    /** Role create action */
    public static RoleCreate: string = "rolesAdd";

    /** Role update action */
    public static RoleUpdate: string = "rolesUpd";

    /** Role delete action */
    public static RoleDelete: string = "rolesRem";

    /** Role give action */
    public static RoleGive: string = "rolesAssign";

    /** Role take action */
    public static RoleTake: string = "rolesUnassign";

    /** Channel create action */
    public static ChannelCreate: string = "channelAdd";

    /** Channel update action */
    public static ChannelUpdate: string = "channelUpd";

    /** Channel delete action */
    public static ChannelDelete: string = "channelRem";

    /** Voice join action */
    public static VoiceJoin: string = "vcJoin";

    /** Voice move action */
    public static VoiceMove: string = "vcMove";

    /** Voice leave action */
    public static VoiceLeave: string = "vcLeave";

    /**
     * Returns all values of the ServerLogEventType enum.
     */
    public static values(): string[] {
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
    }
}

export default ServerLogEventType;