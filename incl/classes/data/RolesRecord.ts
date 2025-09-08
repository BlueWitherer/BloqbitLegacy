import Record from "./Record.js";

export default class RolesRecord extends Record {
    public roles: string[];

    constructor({ server = "", user = "", roles = [] }: Partial<RolesRecord>) {
        super({ server, user });

        this.roles = roles;

        return this;
    };
};