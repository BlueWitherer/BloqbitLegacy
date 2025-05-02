import { SaveDataClient, Config } from './classes.js';

import Redis from 'ioredis';
import { MongoClient, Db } from 'mongodb';

/**
 * MongoDB client instance
 * @type {MongoClient}
 */
let dbClient;

/**
 * Redis client instance
 * @type {Redis}
 */
const redisClient = new Redis();

/**
 * Get MongoDB client instance
 * 
 * @param {string} mongoUri MongoDB URI
 * 
 * @returns {Promise<Db | void>} MongoDB client instance
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

/**
 * Flush dirty cache data to the database.
 * 
 * @param {SaveDataClient} db Bot database model
 * 
 * @returns {Promise<void>}
 */
const flushDirtyCacheToDatabase = async (db) => {
    try {
        const dirtyKeys = await redisClient.keys('server:*:dirty');

        for (const dirtyKey of dirtyKeys) {
            const serverKey = dirtyKey.replace(':dirty', '');
            const cachedData = await redisClient.get(serverKey);

            if (cachedData) {
                const system = JSON.parse(cachedData);
                const database = await getDatabaseClient(db.mongo_uri);

                if (database) {
                    const collection = database.collection("servers");

                    console.debug(`[I] Flushing dirty cache for server of ID ${system.server} to database...`);
                    await collection.updateOne(
                        { server: system.server },
                        { $set: system },
                        { upsert: true },
                    );

                    await redisClient.del(dirtyKey);
                    console.info(`[O] Dirty cache for server of ID ${system.server} flushed to database`);
                } else {
                    console.error(`[X] Database connection failed`);
                };
            } else {
                console.error(`[X] No cached data found for ${serverKey}`);
            };
        };
    } catch (err) {
        console.trace(err);
    };
};

export default {
    /**
     * Fetch settings for a server from cache or database.
     * 
     * @param {string} server Server ID for query
     * @param {SaveDataClient} db Bot database model
     * 
     * @returns {Promise<Config | void>} Queried settings object
     */
    fetch: async (server, db) => {
        if (server && db) {
            try {
                const cachedData = await redisClient.get(`server:${server}`);

                if (cachedData) {
                    console.debug(`[I] Cache hit for server ID ${server}`);
                    return new Config(JSON.parse(cachedData));
                } else {
                    const database = await getDatabaseClient(db.mongo_uri);

                    if (database) {
                        const collection = database.collection("servers");

                        console.debug(`[I] Querying database for server ID ${server}...`);
                        const found = await collection.findOne({ server: server });

                        if (found) {
                            const { _id, ...conf } = found;
                            const res = new Config(conf);

                            await redisClient.set(`server:${server}`, JSON.stringify(conf), 'EX', 3600);

                            console.info(`[O] Settings for server ${server} found and cached`);
                            return res;
                        } else {
                            console.error(`[X] Settings for server ${server} not found`);
                            return new Config({});
                        };
                    } else {
                        console.error(`[X] Database connection failed`);
                        return;
                    };
                };
            } catch (err) {
                console.trace(err);
                return;
            };
        } else {
            console.error(`[X] Query ID or database model not provided`);
            return;
        };
    },

    /**
     * Update settings for a server and invalidate cache.
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

                    await redisClient.set(`server:${system.server}`, JSON.stringify(system), 'EX', 3600);
                    await redisClient.set(`server:${system.server}:dirty`, 'true', 'EX', 3600);
                    console.debug(`[II] Cache updated and marked as dirty for server ID ${system.server}`);

                    return system;
                } else {
                    console.error(`[X] Database connection failed`);
                    return;
                };
            } catch (err) {
                console.trace(err);
                return;
            };
        } else {
            console.error(`[X] Query object or database model not provided`);
            return;
        };
    },

    getDatabaseClient,
    flushDirtyCacheToDatabase,
};