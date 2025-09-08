/**
 * @class Base database record class
 */
export default class Record {
    public server: string;
    public user: string;

    constructor({ server = "", user = "" }: Partial<Record>) {
        this.server = server;
        this.user = user;

        return this;
    };
};