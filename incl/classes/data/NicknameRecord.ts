import Record from "./Record.js";

/**
 * Blocked user display name record class
 */
export default class NicknameRecord extends Record {
    public nickname: string;
    public mod: string;

    constructor({ server = "", user = "", reason = "", unix = 0, nickname = "", mod = "", }: Partial<NicknameRecord>) {
        super({ server, user, reason, unix });

        this.nickname = nickname;
        this.mod = mod;

        return this;
    };
};