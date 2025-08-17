/**
 * @class Base database record class
 */
export default class Record {
    public server: string;
    public user: string;
    public reason: string;
    public unix: number;

    constructor({ server = "", user = "", reason = "", unix = 0 }: Partial<Record>) {
        this.server = server;
        this.user = user;
        this.reason = reason;
        this.unix = unix;

        return this;
    };
};