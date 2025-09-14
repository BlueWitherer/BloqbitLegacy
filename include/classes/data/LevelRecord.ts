import Record from "./Record.js";

export default class LevelRecord extends Record {
    public level: number;
    public xp: number;

    constructor({ server = "", user = "", level = 1, xp = 0 }: Partial<LevelRecord>) {
        super({ server, user });

        this.level = level;
        this.xp = xp;

        return this;
    };
};