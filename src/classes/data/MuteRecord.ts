export default class MuteRecord {
    public userId: string;
    public serverId: string;
    public unix: number;
    public reason: string;
    public modId: string;
    public until: number;

    constructor({ userId = "", serverId = "", unix = 0, reason = "", modId = "", until = 0 }: Partial<MuteRecord>) {
        this.userId = userId;
        this.serverId = serverId;
        this.unix = unix;
        this.reason = reason;
        this.modId = modId;
        this.until = until;

        return this;
    };
};