import Record from "./Record.js";

/**
 * @class Base database record class
 */
export default class RecordWithReason extends Record {
    public reason: string;
    public unix: number;

    constructor({ server = "", user = "", reason = "", unix = 0 }: Partial<RecordWithReason>) {
        super({ server, user });

        this.reason = reason;
        this.unix = unix;

        return this;
    };
};