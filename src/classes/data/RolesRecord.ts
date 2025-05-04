export default class RolesRecord {
    public server: string;
    public user: string;
    public roles: Array<string>;

    constructor({ server = "", user = "", roles = [""] }: Partial<RolesRecord>) {
        this.server = server;
        this.user = user;
        this.roles = roles;

        return this;
    };
};