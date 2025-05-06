export interface WarningData {
    reason: string;
    unix: number;
    mod: string;
};

export default class InfractionRecord {
    public server: string;
    public user: string;
    public data: WarningData[];

    constructor({ server = "", user = "", data = [] }: Partial<InfractionRecord>) {
        this.server = server;
        this.user = user;
        this.data = data;

        return this;
    };
};