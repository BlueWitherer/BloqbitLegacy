import { LevelRecord, SaveDataClient } from "#bloqbit/include";

import cache from "../cache.mjs";

export interface LevelCard {
    level: number;
    xp: number;
    untilUp: number;
};

const untilUp = (lvl: number): number => {
    const xpToUp = 100 * (lvl + 1) * (lvl + 2) / 2; // XP required to level up
    const xp = 100 * (lvl) * (lvl + 1) / 2; // XP required to reach current level

    return xpToUp - xp;
};

export default {
    /**
     * Returns a level card object.
     */
    levelCard: (level: number, xp: number): LevelCard => {
        try {
            return { level: level, xp: xp, untilUp: untilUp(level), };
        } catch (err) {
            console.trace(err);

            return {
                level: 0,
                xp: 0,
                untilUp: untilUp(1),
            };
        };
    },

    /**
     * Fetches data from the database for the user's level in this server
     */
    fetchData: async (server: string, user: string, db: SaveDataClient): Promise<LevelRecord | void> => {
        return await cache.xp.fetch(server, user, db);
    },

    /**
     * Updates data in the database of the user's level in this server
     */
    updateData: async (record: LevelRecord, db: SaveDataClient): Promise<LevelRecord | void> => {
        return await cache.xp.update(record, db);
    },

    untilUp,
};