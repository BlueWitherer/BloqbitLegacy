export default class MuteRecord {
    public server: string;
    public user: string;
    public reason: string;
    public unix: number;
    public mod: string;
    public until: number;

    constructor({ server = "", user = "", reason = "", unix = 0, mod = "", until = 0 }: Partial<MuteRecord>) {
        this.server = server;
        this.user = user;
        this.reason = reason;
        this.unix = unix;
        this.mod = mod;
        this.until = until;

        return this;
    };
};