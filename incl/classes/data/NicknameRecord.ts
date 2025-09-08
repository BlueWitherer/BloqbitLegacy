import RecordWithReason from "./RecordWithReason.js";

/**
 * Blocked user display name record class
 */
export default class NicknameRecord extends RecordWithReason {
    public nickname: string;
    public mod: string;

    constructor({ server = "", user = "", reason = "", unix = 0, nickname = "", mod = "", }: Partial<NicknameRecord>) {
        super({ server, user, reason, unix });

        this.nickname = nickname;
        this.mod = mod;

        return this;
    };
};