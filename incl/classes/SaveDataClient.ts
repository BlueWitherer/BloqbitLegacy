/**
 * Represents the bot database settings model.
 */
export default class SaveDataClient {
    /**
     * URI of the MongoDB database.
     */
    public mongo_uri: string;

    /**
     * Creates a new instance of SaveDataClient.
     * @param uri URI of the MongoDB database.
     */
    constructor(uri: string) {
        this.mongo_uri = uri;
    };
};