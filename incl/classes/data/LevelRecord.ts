export default class LevelRecord {
    public server: string;
    public user: string;
    public level: number;
    public xp: number;

    constructor({ server = "", user = "", level = 1, xp = 0 }: Partial<LevelRecord>) {
        this.server = server;
        this.user = user;
        this.level = level;
        this.xp = xp;

        return this;
    };
};