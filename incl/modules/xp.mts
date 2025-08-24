import { log } from "#bloqbit/include.ts";

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
            log.trace(err);

            return {
                level: 0,
                xp: 0,
                untilUp: untilUp(1),
            };
        };
    },

    untilUp,
};