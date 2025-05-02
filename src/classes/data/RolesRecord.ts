export default class RolesRecord {
    public userId: string;
    public serverId: string;
    public roles: Array<string>;

    constructor({ userId = "", serverId = "", roles = [""] }: Partial<RolesRecord>) {
        this.userId = userId;
        this.serverId = serverId;
        this.roles = roles;

        return this;
    };
};