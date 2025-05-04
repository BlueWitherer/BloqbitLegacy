import { SaveDataClient, Config, LevelRecord, InfractionRecord, MuteRecord, NicknameRecord, RolesRecord } from './classes.js';

import NodeCache from 'node-cache';
import { MongoClient, Db } from 'mongodb';

/**
 * MongoDB client instance
 * @type {MongoClient}
 */
let dbClient;

/**
 * Local memory cache
 * @type {NodeCache}
 */
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

/**
 * Get MongoDB client instance
 * 
 * @param {string} mongoUri MongoDB URI
 * 
 * @returns {Promise<Db | void>} MongoDB client instance
 */
const getDbClient = async (mongoUri) => {
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
const flushToDb = async (db) => {
    try {
        const dirtyKeys = cache.keys().filter(key => key.endsWith(":dirty"));

        for (const dKey of dirtyKeys) {
            const key = dKey.replace(":dirty", "");

            if (key.startsWith("server:")) {
                const cachedData = cache.get(key);

                if (cachedData) {
                    const system = cachedData;
                    const database = await getDbClient(db.mongo_uri);

                    if (database) {
                        const collection = database.collection("servers");

                        console.debug(`[I] Flushing dirty cache for server ID ${system.server} to database...`);
                        await collection.updateOne(
                            { server: system.server },
                            { $set: system },
                            { upsert: true },
                        );

                        cache.del(dKey);
                        console.info(`[O] Dirty cache for server ID ${system.server} flushed to database`);
                    } else {
                        console.error(`[X] Database connection failed`);
                    };
                } else {
                    console.error(`[X] No cached data found for ${key}`);
                };
            } else {
                console.error(`[X] Invalid cache key ${key}`);
            };
        };
    } catch (err) {
        console.trace(err);
    };
};

/**
 * 
 * @param {string} coll 
 * @param {string} server 
 * @param {string} user 
 * @param {SaveDataClient} db
 * @param {import('mongodb').Filter<import('mongodb').Document>} filter 
 */
const handleFetchData = async (coll, server, user, db, filter) => {
    try {
        const database = await getDbClient(db.mongo_uri);

        if (database) {
            const collection = database.collection(coll);

            console.debug(`[I] Querying database for warning data of server ID ${server}...`);
            const found = await collection.findOne(filter);

            if (found) {
                const { _id, ...dat } = found;

                console.info(`[O] Data from collection '${coll}' for server ${server} found`);
                return dat;
            } else {
                console.error(`[X] Data from collection '${coll}' for server ${server} not found`);
                return {};
            };
        } else {
            console.error(`[X] Database connection failed`);
            return;
        };
    } catch (err) {
        console.trace(err);
        return;
    };
};

/**
 * 
 * @param {string} coll 
 * @param {InfractionRecord | LevelRecord | MuteRecord | NicknameRecord | RolesRecord} record 
 * @param {SaveDataClient} db 
 * @param {import('mongodb').Filter<import('mongodb').Document>} filter 
 */
const handleUpdateData = async (coll, record, db, filter) => {
    if (record && db) {
        try {
            const database = await getDbClient(db.mongo_uri);

            if (database) {
                const collection = database.collection(coll);

                console.debug(`[I] Updating warning database for server ID ${record.server}...`);
                const result = await collection.updateOne(
                    filter,
                    { $set: record },
                    { upsert: true },
                );

                if (result.upsertedCount >= 1) {
                    console.info(`[O] New data from collection '${coll}' for server ${record.server} inserted into database`);
                } else {
                    console.info(`[O] Data for from collection '${coll}' server ${record.server} updated`);
                };

                return record;
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
                const cachedData = cache.get(`server:${server}`);

                if (cachedData) {
                    console.debug(`[I] Cache hit for server ID ${server}`);
                    return new Config(cachedData);
                } else {
                    const database = await getDbClient(db.mongo_uri);

                    if (database) {
                        const collection = database.collection("servers");

                        console.debug(`[I] Querying database for server ID ${server}...`);
                        const found = await collection.findOne({ server });

                        if (found) {
                            const { _id, ...conf } = found;
                            const res = new Config(conf);

                            cache.set(`server:${server}`, conf);
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
                const database = await getDbClient(db.mongo_uri);
                if (database) {
                    const collection = database.collection("servers");

                    console.debug(`[I] Updating database for server ID ${system.server}...`);
                    const result = await collection.updateOne(
                        { server: system.server },
                        { $set: system },
                        { upsert: true },
                    );

                    if (result.upsertedCount >= 1) {
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
                console.trace(err);
                return;
            };
        } else {
            console.error(`[X] Query object or database model not provided`);
            return;
        };
    },

    getDbClient,
    flushToDb,

    warns: {
        /**
         * Fetch warning data for a server from cache or database.
         * 
         * @param {string} server Server ID for query
         * @param {string} user User ID for query
         * @param {SaveDataClient} db Bot database model
         * 
         * @returns {Promise<InfractionRecord | void>} Queried data object
         */
        fetch: async (server, user, db) => {
            const data = await handleFetchData("warns", server, user, db, { server: server, user: user });
            if (data) return new InfractionRecord({ server: data.server || "", user: data.user || "", data: data.data || [] });
        },

        /**
         * Update warning data for a server and invalidate cache.
         * 
         * @param {InfractionRecord} record Object for query
         * @param {SaveDataClient} db Bot database model
         * 
         * @returns {Promise<InfractionRecord | void>} Updated data object
         */
        update: async (record, db) => {
            const data = await handleUpdateData("warns", record, db, { server: record.server, user: record.server });
            if (data) return record;
        },
    },

    xp: {
        /**
         * Fetch XP data for a server from cache or database.
         * 
         * @param {string} server Server ID for query
         * @param {string} user User ID for query
         * @param {SaveDataClient} db Bot database model
         * 
         * @returns {Promise<LevelRecord | void>} Queried data object
         */
        fetch: async (server, user, db) => {
            const data = await handleFetchData("xp", server, user, db, { server: server, user: user });
            if (data) return new LevelRecord({ server: data.server || "", user: data.user || "", level: data.level || 1, xp: data.xp || 0 });
        },

        /**
         * Update XP data for a server and invalidate cache.
         * 
         * @param {LevelRecord} record Object for query
         * @param {SaveDataClient} db Bot database model
         * 
         * @returns {Promise<LevelRecord | void>} Updated data object
         */
        update: async (record, db) => {
            const data = await handleUpdateData("xp", record, db, { server: record.server, user: record.user });
            if (data) return record;
        },
    },

    mutes: {
        /**
         * Fetch mute data for a server from cache or database.
         * 
         * @param {string} server Server ID for query
         * @param {string} user User ID for query
         * @param {SaveDataClient} db Bot database model
         * 
         * @returns {Promise<MuteRecord | void>} Queried data object
         */
        fetch: async (server, user, db) => {
            const data = await handleFetchData("xp", server, user, db, { server: server, user: user });
            if (data) return new MuteRecord({ server: data.server || "", user: data.user || "", unix: data.unix || 0, reason: data.reason || "", mod: data.mod || "", until: data.until || 0 });
        },

        /**
         * Update mute data for a server and invalidate cache.
         * 
         * @param {MuteRecord} record Object for query
         * @param {SaveDataClient} db Bot database model
         * 
         * @returns {Promise<MuteRecord | void>} Updated data object
         */
        update: async (record, db) => {
            const data = await handleUpdateData("xp", record, db, { server: record.server, user: record.user });
            if (data) return record;
        },
    },

    nicknames: {
        /**
         * Fetch nickname data for a server from cache or database.
         * 
         * @param {string} server Server ID for query
         * @param {string} user User ID for query
         * @param {SaveDataClient} db Bot database model
         * 
         * @returns {Promise<NicknameRecord | void>} Queried data object
         */
        fetch: async (server, user, db) => {
            const data = await handleFetchData("xp", server, user, db, { server: server, user: user });
            if (data) return new NicknameRecord({ server: data.server || "", user: data.user || "", nickname: data.nickname || "", reason: data.reason || "", mod: data.mod || "", unix: data.unix || 0, });
        },

        /**
         * Update nickname data for a server and invalidate cache.
         * 
         * @param {NicknameRecord} record Object for query
         * @param {SaveDataClient} db Bot database model
         * 
         * @returns {Promise<NicknameRecord | void>} Updated data object
         */
        update: async (record, db) => {
            const data = await handleUpdateData("xp", record, db, { server: record.server, user: record.user });
            if (data) return record;
        },
    },

    roles: {
        /**
         * Fetch nickname data for a server from cache or database.
         * 
         * @param {string} server Server ID for query
         * @param {string} user User ID for query
         * @param {SaveDataClient} db Bot database model
         * 
         * @returns {Promise<RolesRecord | void>} Queried data object
         */
        fetch: async (server, user, db) => {
            const data = await handleFetchData("xp", server, user, db, { server: server, user: user });
            if (data) return new RolesRecord({ server: data.server || "", user: data.user || "", roles: data.roles || [""] });
        },

        /**
         * Update nickname data for a server and invalidate cache.
         * 
         * @param {RolesRecord} record Object for query
         * @param {SaveDataClient} db Bot database model
         * 
         * @returns {Promise<RolesRecord | void>} Updated data object
         */
        update: async (record, db) => {
            const data = await handleUpdateData("xp", record, db, { server: record.server, user: record.user });
            if (data) return record;
        },
    },
};