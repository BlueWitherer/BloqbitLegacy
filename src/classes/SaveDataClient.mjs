/**
 * @class Bot database settings model.
 */
export default class SaveDataClient {
    /**
     * URI of the MongoDB database
     * @type {string}
     */
    mongo_uri;

    /**
     * 
     * @param {string} uri URI of the MongoDB database
     */
    constructor(uri) {
        this.mongo_uri = uri;

        return this;
    };
};