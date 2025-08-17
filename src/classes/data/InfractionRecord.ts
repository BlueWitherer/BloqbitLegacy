import Record from "./Record";

export default class InfractionRecord {
    public server: string;
    public user: string;
    public data: Record[];

    constructor({ server = "", user = "", data = [] }: Partial<InfractionRecord>) {
        this.server = server;
        this.user = user;
        this.data = data;

        return this;
    };
};