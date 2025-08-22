import { SaveDataClient, Config, LevelRecord, InfractionRecord, MuteRecord, NicknameRecord, RolesRecord, log } from "#bloqbit/include.ts";

// import { Connection } from 'mariadb';
import { MongoClient, Db, Filter, Document } from 'mongodb';

import NodeCache from 'node-cache';

// let dbClient: Connection | undefined;
let mongoClient: MongoClient | undefined;

const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

const getDbClient = async (mongoUri: string): Promise<Db | undefined> => {
    if (mongoUri) {
        if (mongoClient) {
            log.debug(`[I] Using existing MongoDB connection`);
        } else {
            log.debug(`[I] Creating new MongoDB connection`);

            mongoClient = new MongoClient(mongoUri);
            await mongoClient.connect();
        };

        return mongoClient.db("Bloqbit");
    } else {
        log.error(`[X] MongoDB URI not provided`);
        return;
    };
};

const flushToDb = async (db: SaveDataClient): Promise<void> => {
    try {
        const dirtyKeys = cache.keys().filter((k) => k.endsWith(":dirty"));

        for (const dKey of dirtyKeys) {
            const key = dKey.replace(":dirty", "");

            if (key.startsWith("server:")) {
                const cachedData = cache.get(key);

                if (cachedData) {
                    const system = new Config(cachedData);
                    const database = await getDbClient(db.mongo_uri);

                    if (database) {
                        const collection = database.collection("servers");

                        log.debug(`[I] Flushing dirty cache for server ID ${system.server} to database...`);
                        await collection.updateOne(
                            { server: system.server },
                            { $set: system },
                            { upsert: true },
                        );

                        cache.del(dKey);
                        log.info(`[O] Dirty cache for server ID ${system.server} flushed to database`);
                    } else {
                        log.error(`[X] Database connection failed`);
                    };
                } else {
                    log.error(`[X] No cached data found for ${key}`);
                };
            } else {
                log.error(`[X] Invalid cache key ${key}`);
            };
        };
    } catch (err) {
        log.trace(err);
    };
};

const handleFetchData = async (
    coll: string,
    server: string,
    user: string,
    db: SaveDataClient,
    filter: Filter<Document>
): Promise<Partial<InfractionRecord | LevelRecord | MuteRecord | NicknameRecord | RolesRecord> | void> => {
    try {
        const database = await getDbClient(db.mongo_uri);

        if (database) {
            const collection = database.collection(coll);

            log.debug(`[I] Querying database for warning data of server ID ${server}...`);
            const found = await collection.findOne(filter);

            if (found) {
                const { _id, ...dat } = found;

                log.debug(`[II] Fetched query of ID ${_id}`);

                log.info(`[O] Data from collection '${coll}' for server ${server} found`);
                return dat;
            } else {
                log.error(`[X] Data from collection '${coll}' for server ${server} not found`);
                return {};
            };
        } else {
            log.error(`[X] Database connection failed`);
            return;
        };
    } catch (err) {
        log.trace(err);
        return;
    };
};

const handleUpdateData = async (
    coll: string,
    record: InfractionRecord | LevelRecord | MuteRecord | NicknameRecord | RolesRecord,
    db: SaveDataClient,
    filter: Filter<Document>
): Promise<Partial<InfractionRecord | LevelRecord | MuteRecord | NicknameRecord | RolesRecord> | void> => {
    if (record && db) {
        try {
            const database = await getDbClient(db.mongo_uri);

            if (database) {
                const collection = database.collection(coll);

                log.debug(`[I] Updating warning database for server ID ${record.server}...`);
                const result = await collection.updateOne(
                    filter,
                    { $set: record },
                    { upsert: true },
                );

                if (result.upsertedCount >= 1) {
                    log.info(`[O] New data from collection '${coll}' for server ${record.server} inserted into database`);
                } else {
                    log.info(`[O] Data for from collection '${coll}' server ${record.server} updated`);
                };

                return record;
            } else {
                log.error(`[X] Database connection failed`);
                return;
            };
        } catch (err) {
            log.trace(err);
            return;
        };
    } else {
        log.error(`[X] Query object or database model not provided`);
        return;
    };
};

/**
 * Database helper methods
 */
export default {
    /**
     * Fetch settings for a server from cache or database.
     * 
     * @param server Server ID for query
     * @param db Bot database model
     */
    fetch: async (server: string, db: SaveDataClient): Promise<Config | void> => {
        if (server && db) {
            try {
                const cachedData = cache.get(`server:${server}`);

                if (cachedData) {
                    log.debug(`[I] Cache hit for server ID ${server}`);
                    return new Config(cachedData);
                } else {
                    const database = await getDbClient(db.mongo_uri);

                    if (database) {
                        const collection = database.collection("servers");

                        log.debug(`[I] Querying database for server ID ${server}...`);
                        const found = await collection.findOne({ server });

                        if (found) {
                            const { _id, ...conf } = found;
                            const res = new Config(conf);

                            log.debug(`[II] Fetched query of ID ${_id}`);

                            cache.set(`server:${server}`, res);
                            log.info(`[O] Settings for server ${server} found and cached`);
                            return res;
                        } else {
                            log.error(`[X] Settings for server ${server} not found`);
                            return new Config({});
                        };
                    } else {
                        log.error(`[X] Database connection failed`);
                        return;
                    };
                };
            } catch (err) {
                log.trace(err);
                return;
            };
        } else {
            log.error(`[X] Query ID or database model not provided`);
            return;
        };
    },

    /**
     * Update settings for a server and invalidate cache.
     * 
     * @param system Object for query
     * @param db Bot database model
     */
    update: async (system: Config, db: SaveDataClient): Promise<Config | void> => {
        if (system && db) {
            try {
                const database = await getDbClient(db.mongo_uri);

                if (database) {
                    const collection = database.collection("servers");

                    log.debug(`[I] Updating database for server ID ${system.server}...`);
                    const result = await collection.updateOne(
                        { server: system.server },
                        { $set: system },
                        { upsert: true },
                    );

                    if (cache.get(`server:${system.server}`)) cache.set(`server:${system.server}`, system);

                    if (result.upsertedCount >= 1) {
                        log.info(`[O] New settings for server ${system.server} inserted into database`);
                    } else {
                        log.info(`[O] Settings for server ${system.server} updated`);
                    };

                    return system;
                } else {
                    log.error(`[X] Database connection failed`);
                    return;
                };
            } catch (err) {
                log.trace(err);
                return;
            };
        } else {
            log.error(`[X] Query object or database model not provided`);
            return;
        };
    },

    getDbClient,
    flushToDb,

    warns: {
        /**
         * Fetch warning data for a server from cache or database.
         * 
         * @param server Server ID for query
         * @param user User ID for query
         * @param db Bot database model
         */
        fetch: async (server: string, user: string, db: SaveDataClient): Promise<InfractionRecord | void> => {
            const data = await handleFetchData("warns", server, user, db, { server: server, user: user });
            if (data && ('data' in data)) return new InfractionRecord({ server: data.server || "", user: data.user || "", data: data.data || [] });
        },

        /**
         * Update warning data for a server and invalidate cache.
         * 
         * @param record Object for query
         * @param db Bot database model
         */
        update: async (record: InfractionRecord, db: SaveDataClient): Promise<InfractionRecord | void> => {
            const data = await handleUpdateData("warns", record, db, { server: record.server, user: record.server });
            if (data) return record;
        },
    },

    xp: {
        /**
         * Fetch XP data for a server from cache or database.
         * 
         * @param server Server ID for query
         * @param user User ID for query
         * @param db Bot database model
         */
        fetch: async (server: string, user: string, db: SaveDataClient): Promise<LevelRecord | void> => {
            const data = await handleFetchData("xp", server, user, db, { server: server, user: user });
            if (data && ('level' in data && 'xp' in data)) return new LevelRecord({ server: data.server || "", user: data.user || "", level: data.level || 1, xp: data.xp || 0 });
        },

        /**
         * Update XP data for a server and invalidate cache.
         * 
         * @param record Object for query
         * @param db Bot database model
         */
        update: async (record: LevelRecord, db: SaveDataClient): Promise<LevelRecord | void> => {
            const data = await handleUpdateData("xp", record, db, { server: record.server, user: record.user });
            if (data) return record;
        },
    },

    mutes: {
        /**
         * Fetch mute data for a server from cache or database.
         * 
         * @param server Server ID for query
         * @param user User ID for query
         * @param db Bot database model
         */
        fetch: async (server: string, user: string, db: SaveDataClient): Promise<MuteRecord | void> => {
            const data = await handleFetchData("xp", server, user, db, { server: server, user: user });
            if (data && ('unix' in data && 'until' in data)) return new MuteRecord({ server: data.server || "", user: data.user || "", unix: data.unix || 0, reason: data.reason || "", mod: data.mod || "", until: data.until || 0 });
        },

        /**
         * Update mute data for a server and invalidate cache.
         * 
         * @param record Object for query
         * @param db Bot database model
         */
        update: async (record: MuteRecord, db: SaveDataClient): Promise<MuteRecord | void> => {
            const data = await handleUpdateData("xp", record, db, { server: record.server, user: record.user });
            if (data) return record;
        },
    },

    nicknames: {
        /**
         * Fetch nickname data for a server from cache or database.
         * 
         * @param server Server ID for query
         * @param user User ID for query
         * @param db Bot database model
         */
        fetch: async (server: string, user: string, db: SaveDataClient): Promise<NicknameRecord | void> => {
            const data = await handleFetchData("xp", server, user, db, { server: server, user: user });
            if (data && ('nickname' in data)) return new NicknameRecord({ server: data.server || "", user: data.user || "", nickname: data.nickname || "", reason: data.reason || "", mod: data.mod || "", unix: data.unix || 0, });
        },

        /**
         * Update nickname data for a server and invalidate cache.
         * 
         * @param record Object for query
         * @param db Bot database model
         */
        update: async (record: NicknameRecord, db: SaveDataClient): Promise<NicknameRecord | void> => {
            const data = await handleUpdateData("xp", record, db, { server: record.server, user: record.user });
            if (data) return record;
        },
    },

    roles: {
        /**
         * Fetch nickname data for a server from cache or database.
         * 
         * @param server Server ID for query
         * @param user User ID for query
         * @param db Bot database model
         */
        fetch: async (server: string, user: string, db: SaveDataClient): Promise<RolesRecord | void> => {
            const data = await handleFetchData("xp", server, user, db, { server: server, user: user });
            if (data && ('roles' in data)) return new RolesRecord({ server: data.server || "", user: data.user || "", roles: data.roles || [""] });
        },

        /**
         * Update nickname data for a server and invalidate cache.
         * 
         * @param record Object for query
         * @param db Bot database model
         */
        update: async (record: RolesRecord, db: SaveDataClient): Promise<RolesRecord | void> => {
            const data = await handleUpdateData("xp", record, db, { server: record.server, user: record.user });
            if (data) return record;
        },
    },
};