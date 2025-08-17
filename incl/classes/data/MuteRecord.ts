import Record from "./Record.js";

export default class MuteRecord extends Record {
    public mod: string;
    public until: number;

    constructor({ server = "", user = "", reason = "", unix = 0, mod = "", until = 0 }: Partial<MuteRecord>) {
        super({ server, user, reason, unix });

        this.mod = mod;
        this.until = until;

        return this;
    };
};