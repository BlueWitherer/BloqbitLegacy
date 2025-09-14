import Record from "./Record.js";

export default class EconomyRecord extends Record {
    public balance: number;
    public bank: number;

    constructor({ server = "", user = "", balance = 0, bank = 0 }: Partial<EconomyRecord>) {
        super({ server, user });

        this.balance = balance;
        this.bank = bank;

        return this;
    };
};