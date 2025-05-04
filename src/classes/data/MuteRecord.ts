export default class MuteRecord {
    public server: string;
    public user: string;
    public unix: number;
    public reason: string;
    public mod: string;
    public until: number;

    constructor({ server = "", user = "", unix = 0, reason = "", mod = "", until = 0 }: Partial<MuteRecord>) {
        this.server = server;
        this.user = user;
        this.unix = unix;
        this.reason = reason;
        this.mod = mod;
        this.until = until;

        return this;
    };
};