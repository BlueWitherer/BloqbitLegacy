export default class NicknameRecord {
    public server: string;
    public user: string;
    public reason: string;
    public nickname: string;
    public unix: number;
    public mod: string;

    constructor({ server = "", user = "", reason = "", nickname = "", unix = 0, mod = "", }: Partial<NicknameRecord>) {
        this.server = server;
        this.user = user;
        this.reason = reason;
        this.nickname = nickname;
        this.unix = unix;
        this.mod = mod;

        return this;
    };
};