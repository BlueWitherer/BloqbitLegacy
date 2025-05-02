export default class InfractionRecord {
    public userId: string;
    public serverId: string;
    public unix: number;
    public reason: string;
    public modId: string;

    constructor({ userId = "", serverId = "", unix = 0, reason = "", modId = "" }: Partial<InfractionRecord>) {
        this.userId = userId;
        this.serverId = serverId;
        this.unix = unix;
        this.reason = reason;
        this.modId = modId;

        return this;
    };
};