import { MongoClient } from 'mongodb';
import { SaveDataClient, Config } from './classes.js';

// MongoDB client instance
/**
 * @type {MongoClient}
 */
let dbClient;

/**
 * @param {string} mongoUri MongoDB URI
 * 
 * @returns {Promise<import('mongodb').Db | void>} MongoDB database instance
 */
const getDatabaseClient = async (mongoUri) => {
    if (mongoUri) {
        if (!dbClient) {
            dbClient = new MongoClient(mongoUri);
            await dbClient.connect();
        };

        return dbClient.db("Bloqbit");
    } else {
        console.error(`[X] MongoDB URI not provided`);
        return;
    };
};

export default {
    /**
     * Fetch settings for a server from database.
     * 
     * @param {string} server Server ID for query
     * @param {SaveDataClient} db Bot database model
     * 
     * @returns {Promise<Config | void>} Queried settings object
     */
    fetch: async (server, db) => {
        if (server && db) {
            try {
                const database = await getDatabaseClient(db.mongo_uri);

                if (database) {
                    const collection = database.collection("servers");

                    console.debug(`[I] Querying database for server ID ${server}...`);
                    const found = await collection.findOne({ server: server });

                    if (found) {
                        const { _id, ...conf } = found;

                        const res = new Config(conf);

                        console.info(`[O] Settings for server ${server} found`);
                        return res;
                    } else {
                        console.error(`[X] Settings for server ${server} not found`);
                        return new Config({});
                    };
                } else {
                    console.error(`[X] Database connection failed`);
                    return;
                };
            } catch (err) {
                console.error(err);
                return;
            };
        } else {
            console.error(`[X] Query ID or database model not provided`);
            return;
        };
    },

    /**
     * Update settings for a server.
     * 
     * @param {Config} system Object for query
     * @param {SaveDataClient} db Bot database model
     * 
     * @returns {Promise<Config | void>} Updated settings object
     */
    update: async (system, db) => {
        if (system && db) {
            try {
                const database = await getDatabaseClient(db.mongo_uri);

                if (database) {
                    const collection = database.collection("servers");

                    console.debug(`[I] Updating database for server ID ${system.server}...`);
                    const result = await collection.updateOne(
                        { server: system.server },
                        { $set: system },
                        { upsert: true },
                    );

                    if (result.upsertedCount > 0) {
                        console.info(`[O] New settings for server ${system.server} inserted into database`);
                    } else {
                        console.info(`[O] Settings for server ${system.server} updated`);
                    };

                    return system;
                } else {
                    console.error(`[X] Database connection failed`);
                    return;
                };
            } catch (err) {
                console.error(err);
                return;
            };
        } else {
            console.error(`[X] Query object or database model not provided`);
            return;
        };
    },
};