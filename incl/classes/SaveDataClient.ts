export interface DatabaseConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
};

/**
 * Represents the bot database settings model.
 */
export default class SaveDataClient {
    public host: string = "localhost";
    public port: number = 3306;
    public user: string = "root";
    public password: string = "";
    public database: string = "bloqbit";

    /**
     * Creates a new instance of SaveDataClient.
     * @param uri URI of the MongoDB database.
     */
    constructor(uri: DatabaseConfig) {
        this.host = uri.host;
        this.port = uri.port;
        this.user = uri.user;
        this.password = uri.password;
        this.database = uri.database;

        return this;
    };
};