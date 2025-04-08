import MongoDB from 'mongodb';
import { SaveDataClient, Config } from './classes.mjs';

/**
 * @type {Array<Config>} Array of cache server settings
 */
const cache = [];

export default {
    /**
     * 
     * @returns {Array<Config>} Array of cache server settings
     */
    get: () => {
        return cache;
    },

    /**
     * 
     * @param {string} server Server ID for query
     * 
     * @returns {Config} Queried settings object
     */
    fetch: (server) => {
        if (server) {
            if (cache.length) {
                return cache.find((s) => s.server === server);
            } else {
                console.error(`[X] Cached settings object not available.`);
                return;
            };
        } else {
            console.error(`[X] Query ID not provided.`);
            return;
        };
    },

    /**
     * 
     * @param {Config} system Object for query
     * @param {SaveDataClient} db Bot database model
     * 
     * @returns {Promise<Config>} New settings object
     */
    update: async (system, db) => {
        if (system && db) {
            try {
                console.debug(`[I] Looking if object for server ${system.server} already exists...`);

                const foundObj = cache.findIndex((so) => {
                    console.debug(`[...] Comparing cached object ${so.server} with query object ${system.server}...`);
                    return system.server === so.server;
                });

                if (foundObj >= 0) {
                    console.warn(`[II] Config object for server ${system.server} exists at index ${foundObj}, replacing...`);

                    cache[foundObj] = system;
                    console.debug(`[O] Data for server ${cache[foundObj].server} updated.`);
                } else {
                    console.info(`[II] Config object for ${system.server} not found, creating new object...`);

                    const newSize = cache.push(system);
                    console.debug(`[O] Data for server ${system.server} updated. Cache size ${newSize}.`);
                };

                const dbClient = new MongoDB.MongoClient(db.mongo_uri);

                const database = dbClient.db("Bloqbit");
                const collection = database.collection("servers");

                await collection.updateOne({ server: system.server }, { $set: system });

                return system;
            } catch (err) {
                console.error(err);
                return;
            };
        } else {
            console.error(`[X] Query object not provided.`);
            return;
        };
    },
};