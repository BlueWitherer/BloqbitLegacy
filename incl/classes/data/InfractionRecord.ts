import Record from "./Record.js";

export default class InfractionRecord extends Record {
    public data: Record[];

    constructor({ server = "", user = "", data = [] }: Partial<InfractionRecord>) {
        super({ server, user });

        this.data = data;

        return this;
    };
};