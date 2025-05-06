export default class EconomyRecord {
    server: string;
    user: string;
    balance: number;
    bank: number;

    constructor({ server = "", user = "", balance = 0, bank = 0 }: Partial<EconomyRecord>) {
        this.server = server;
        this.user = user;
        this.balance = balance;
        this.bank = bank;

        return this;
    };
};