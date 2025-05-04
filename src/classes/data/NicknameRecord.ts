export default class NicknameRecord {
    public server: string;
    public user: string;
    public nickname: string;
    public reason: string;
    public mod: string;
    public unix: number;

    constructor({ server = "", user = "", nickname = "", reason = "", mod = "", unix = 0 }: Partial<NicknameRecord>) {
        this.server = server;
        this.user = user;
        this.nickname = nickname;
        this.reason = reason;
        this.mod = mod;
        this.unix = unix;

        return this;
    };
};