export default class NicknameRecord {
    public userId: string;
    public serverId: string;
    public nickname: string;
    public reason: string;
    public modId: string;
    public unix: number;

    constructor({ userId = "", serverId = "", nickname = "", reason = "", modId = "", unix = 0 }: Partial<NicknameRecord>) {
        this.userId = userId;
        this.serverId = serverId;
        this.nickname = nickname;
        this.reason = reason;
        this.modId = modId;
        this.unix = unix;

        return this;
    };
};