import { SaveDataClient, Config, log } from "#bloqbit/include.ts";

import mariadb from "mariadb";

let dbPool: mariadb.Pool | undefined;

/**
 * Gets a MariaDB connection from the pool, creating the pool if it doesn't exist.
 * 
 * @param dbConfig Database configuration object
 */
const database = async (dbConfig: SaveDataClient): Promise<mariadb.PoolConnection | undefined> => {
    if (dbPool) {
        log.debug(`[I] Reusing existing MariaDB connection pool`);
    } else {
        log.debug(`[I] Creating new MariaDB connection pool`);

        dbPool = mariadb.createPool({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.database,
            connectionLimit: 5,
        });
    };

    log.info(`[O] Connecting to MariaDB database at ${dbConfig.host}`);

    try {
        return await dbPool.getConnection();
    } catch (err) {
        log.error(`[X] MariaDB connection failed`);
        log.trace(err);

        return;
    };
};

// Safe JSON parse helper
function safeParseJSON<T>(input: string | null | undefined, fallback: T): T {
    if (!input) return fallback;

    try {
        return JSON.parse(input);
    } catch {
        return fallback;
    };
};

const fetch = async (server: string, db: SaveDataClient): Promise<Config | void> => {
    if (server && db) {
        try {
            const conn = await database(db);

            if (conn) {
                // Fetch config base
                const configRows = await conn.query(`SELECT id, server FROM config WHERE server = ? LIMIT 1`, [server]);

                if (configRows.length === 0) {
                    await conn.release();
                    log.error(`[X] Settings for server ${server} not found`);

                    const blank = new Config({ "server": server });

                    return await update(blank, db);
                };

                const configId = configRows[0].id;

                // Fetch automod
                const automodRows = await conn.query(`SELECT id, enabled FROM automod WHERE config_id = ? LIMIT 1`, [configId]);
                const automodId = automodRows[0]?.id;

                // Fetch filters
                const filterRows: any[] = await conn.query(`SELECT * FROM filter WHERE automod_id = ?`, [automodId]);

                // Fetch ghostping
                const ghostpingRows = await conn.query(`SELECT * FROM ghostping WHERE config_id = ? LIMIT 1`, [configId]);

                // Fetch autopublish
                const autopublishRows = await conn.query(`SELECT * FROM autopublish WHERE config_id = ? LIMIT 1`, [configId]);

                // Fetch logs
                const logsRows = await conn.query(`SELECT * FROM logs WHERE config_id = ? LIMIT 1`, [configId]);

                // Fetch roles
                const rolesRows = await conn.query(`SELECT * FROM roles WHERE config_id = ? LIMIT 1`, [configId]);

                // Fetch welcome
                const welcomeRows = await conn.query(`SELECT * FROM welcome WHERE config_id = ? LIMIT 1`, [configId]);

                // Fetch leveling
                const levelingRows = await conn.query(`SELECT * FROM leveling WHERE config_id = ? LIMIT 1`, [configId]);

                // Fetch economy
                const economyRows = await conn.query(`SELECT * FROM economy WHERE config_id = ? LIMIT 1`, [configId]);

                await conn.release();

                // Parse JSON columns for filters
                for (const filter of filterRows) {
                    filter.roles = safeParseJSON(filter.roles, []);
                    filter.channels = safeParseJSON(filter.channels, []);
                    filter.keywords = safeParseJSON(filter.keywords, []);
                };

                // Construct config object
                const configObj: any = {
                    server: configRows[0].server,
                    automod: {
                        enabled: !!automodRows[0]?.enabled,
                        swearFilter: filterRows.find((f) => f.type === "swear") || {},
                        linkFilter: filterRows.find((f) => f.type === "link") || {},
                        inviteFilter: filterRows.find((f) => f.type === "invite") || {},
                        dupetextFilter: filterRows.find((f) => f.type === "dupetext") || {},
                        massmentionFilter: filterRows.find((f) => f.type === "massmention") || {},
                        nicknameFilter: filterRows.find((f) => f.type === "nickname") || {},
                        antispam: filterRows.find((f) => f.type === "antispam") || {},
                        antialt: filterRows.find((f) => f.type === "antialt") || {},
                        antichain: filterRows.find((f) => f.type === "antichain") || {},
                        antiping: filterRows.find((f) => f.type === "antiping") || {},
                    },
                    autopublish: autopublishRows[0]
                        ? {
                            enabled: !!autopublishRows[0].enabled,
                            channels: safeParseJSON(autopublishRows[0].channels, []),
                            bots: !!autopublishRows[0].bots,
                        }
                        : {},
                    ghostping: ghostpingRows[0]
                        ? {
                            enabled: !!ghostpingRows[0].enabled,
                            noMods: !!ghostpingRows[0].noMods,
                            settings: safeParseJSON(ghostpingRows[0].settings, {}),
                        }
                        : {},
                    logs: logsRows[0]
                        ? {
                            enabled: !!logsRows[0].enabled,
                            webhookEnabled: !!logsRows[0].webhookEnabled,
                            channel: logsRows[0].channel || "",
                            webhook: logsRows[0].webhook || "",
                            inbox: logsRows[0].inbox || "",
                            actions: safeParseJSON(logsRows[0].actions, {}),
                        }
                        : {},
                    roles: rolesRows[0]
                        ? {
                            settings: safeParseJSON(rolesRows[0].settings, {}),
                            immune: safeParseJSON(rolesRows[0].immune, []),
                            noPing: safeParseJSON(rolesRows[0].noPing, []),
                            streaming: rolesRows[0].streaming || "",
                            mute: rolesRows[0].mute || "",
                        }
                        : {},
                    welcome: welcomeRows[0]
                        ? {
                            enabled: !!welcomeRows[0].enabled,
                            webhookEnabled: !!welcomeRows[0].webhookEnabled,
                            channel: welcomeRows[0].channel || "",
                            webhook: welcomeRows[0].webhook || "",
                            message: { content: welcomeRows[0].message || "" },
                        }
                        : {},
                    leveling: levelingRows[0]
                        ? {
                            enabled: !!levelingRows[0].enabled,
                            xp: {
                                min: levelingRows[0].xp_min ?? 5,
                                max: levelingRows[0].xp_max ?? 25,
                                roles: safeParseJSON(levelingRows[0].xp_roles, []),
                                channels: safeParseJSON(levelingRows[0].xp_channels, []),
                                filterMode: levelingRows[0].xp_filterMode ?? 0,
                            },
                            levelMax: levelingRows[0].levelMax ?? 100,
                            levelRewarding: !!levelingRows[0].levelRewarding,
                        }
                        : {},
                    economy: economyRows[0]
                        ? {
                            enabled: !!economyRows[0].enabled,
                            currency: {
                                name: economyRows[0].currency_name || "",
                                namePlural: economyRows[0].currency_namePlural || "",
                                symbol: economyRows[0].currency_symbol || "",
                                image: economyRows[0].currency_image || "",
                                useImg: !!economyRows[0].currency_useImg,
                            },
                            gambling: {
                                enabled: !!economyRows[0].gambling_enabled,
                                min: economyRows[0].gambling_min ?? 5,
                                max: economyRows[0].gambling_max ?? 100,
                            },
                            drops: {
                                enabled: !!economyRows[0].drops_enabled,
                                channels: safeParseJSON(economyRows[0].drops_channels, []),
                                filterMode: economyRows[0].drops_filterMode ?? 0,
                            },
                        }
                        : {},
                };

                log.debug(configObj);
                log.info(`[O] Settings for server ${server} found and cached`);

                return new Config(configObj);
            } else {
                log.error(`[X] Database connection failed`);
                return;
            };
        } catch (err) {
            log.trace(err);
            return;
        };
    } else {
        log.error(`[X] Query ID or database model not provided`);
        return;
    };
};

const update = async (system: Config, db: SaveDataClient): Promise<Config | void> => {
    if (system && db) {
        try {
            const conn = await database(db);

            if (conn) {
                // Upsert config row
                const configResult = await conn.query(
                    `INSERT INTO config (server) VALUES (?) ON DUPLICATE KEY UPDATE server = VALUES(server)`,
                    [system.server],
                );

                // MariaDB returns insertId=0 for REPLACE if row existed, so fetch id if needed
                let configId = configResult.insertId;

                if (!configId) {
                    const configRows = await conn.query(`SELECT id FROM config WHERE server = ? LIMIT 1`, [system.server]);
                    configId = configRows[0]?.id;
                };

                // Upsert automod row
                const automodResult = await conn.query(
                    `INSERT INTO automod (config_id, enabled) VALUES (?, ?) ON DUPLICATE KEY UPDATE 
                    enabled = VALUES(enabled)`,
                    [configId, !!system.automod.enabled],
                );

                let automodId = automodResult.insertId;

                if (!automodId) {
                    const automodRows = await conn.query(`SELECT id FROM automod WHERE config_id = ? LIMIT 1`, [configId]);
                    automodId = automodRows[0]?.id;
                };

                // Upsert filters
                const filterTypes = [
                    { type: "swear", filter: system.automod.swearFilter },
                    { type: "link", filter: system.automod.linkFilter },
                    { type: "invite", filter: system.automod.inviteFilter },
                    { type: "dupetext", filter: system.automod.dupetextFilter },
                    { type: "massmention", filter: system.automod.massmentionFilter },
                    { type: "nickname", filter: system.automod.nicknameFilter },
                    { type: "antispam", filter: system.automod.antispam },
                    { type: "antialt", filter: system.automod.antialt },
                    { type: "antichain", filter: system.automod.antichain },
                    { type: "antiping", filter: system.automod.antiping },
                ];

                for (const { type, filter } of filterTypes) {
                    await conn.query(
                        `INSERT INTO filter (automod_id, type, enabled, roles, channels, filterMode, permFilterMode, punishment, keywords, logs)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE
                            enabled = VALUES(enabled),
                            roles = VALUES(roles),
                            channels = VALUES(channels),
                            filterMode = VALUES(filterMode),
                            permFilterMode = VALUES(permFilterMode),
                            punishment = VALUES(punishment),
                            keywords = VALUES(keywords),
                            logs = VALUES(logs)`,
                        [
                            automodId,
                            type,
                            !!filter.enabled,
                            JSON.stringify(filter.roles),
                            JSON.stringify(filter.channels),
                            filter.filterMode ?? 0,
                            filter.permFilterMode ?? 0,
                            filter.punishment ?? 0,
                            JSON.stringify(filter.keywords),
                            filter.logs ?? "",
                        ],
                    );
                };

                // Upsert autopublish
                await conn.query(
                    `INSERT INTO autopublish (config_id, enabled, channels, bots)
                        VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE
                        enabled = VALUES(enabled),
                        channels = VALUES(channels),
                        bots = VALUES(bots)`,
                    [
                        configId,
                        !!system.autopublish.enabled,
                        JSON.stringify(system.autopublish.channels),
                        !!system.autopublish.bots,
                    ],
                );

                // Upsert ghostping
                await conn.query(
                    `INSERT INTO ghostping (config_id, enabled, noMods, settings)
                        VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE
                        enabled = VALUES(enabled),
                        noMods = VALUES(noMods),
                        settings = VALUES(settings)`,
                    [
                        configId,
                        !!system.ghostping.enabled,
                        !!system.ghostping.noMods,
                        JSON.stringify(system.ghostping.settings),
                    ],
                );

                // Upsert logs
                await conn.query(
                    `INSERT INTO logs (config_id, enabled, webhookEnabled, channel, webhook, inbox, actions)
                        VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE
                        enabled = VALUES(enabled),
                        webhookEnabled = VALUES(webhookEnabled),
                        channel = VALUES(channel),
                        webhook = VALUES(webhook),
                        inbox = VALUES(inbox),
                        actions = VALUES(actions)`,
                    [
                        configId,
                        !!system.logs.enabled,
                        !!system.logs.webhookEnabled,
                        system.logs.channel ?? "",
                        system.logs.webhook ?? "",
                        system.logs.inbox ?? "",
                        JSON.stringify(system.logs.actions),
                    ],
                );

                // Upsert roles
                await conn.query(
                    `INSERT INTO roles (config_id, settings, immune, noPing, streaming, mute)
                        VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE
                        settings = VALUES(settings),
                        immune = VALUES(immune),
                        noPing = VALUES(noPing),
                        streaming = VALUES(streaming),
                        mute = VALUES(mute)`,
                    [
                        configId,
                        JSON.stringify(system.roles.settings),
                        JSON.stringify(system.roles.immune),
                        JSON.stringify(system.roles.noPing),
                        system.roles.streaming ?? "",
                        system.roles.mute ?? "",
                    ],
                );

                // Upsert welcome
                await conn.query(
                    `INSERT INTO welcome (config_id, enabled, webhookEnabled, channel, webhook, message)
                        VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE
                        enabled = VALUES(enabled),
                        webhookEnabled = VALUES(webhookEnabled),
                        channel = VALUES(channel),
                        webhook = VALUES(webhook),
                        message = VALUES(message)`,
                    [
                        configId,
                        !!system.welcome.enabled,
                        !!system.welcome.webhookEnabled,
                        system.welcome.channel ?? "",
                        system.welcome.webhook ?? "",
                        system.welcome.message?.content ?? "",
                    ],
                );

                // Upsert leveling
                await conn.query(
                    `INSERT INTO leveling (config_id, enabled, xp_min, xp_max, xp_roles, xp_channels, xp_filterMode, levelMax, levelRewarding)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE
                        enabled = VALUES(enabled),
                        xp_min = VALUES(xp_min),
                        xp_max = VALUES(xp_max),
                        xp_roles = VALUES(xp_roles),
                        xp_channels = VALUES(xp_channels),
                        xp_filterMode = VALUES(xp_filterMode),
                        levelMax = VALUES(levelMax),
                        levelRewarding = VALUES(levelRewarding)`,
                    [
                        configId,
                        !!system.leveling.enabled,
                        system.leveling.xp?.min ?? 5,
                        system.leveling.xp?.max ?? 25,
                        JSON.stringify(system.leveling.xp?.roles ?? []),
                        JSON.stringify(system.leveling.xp?.channels ?? []),
                        system.leveling.xp?.filterMode ?? 0,
                        system.leveling.levelMax ?? 100,
                        !!system.leveling.levelRewarding,
                    ],
                );

                // Upsert economy
                await conn.query(
                    `INSERT INTO economy (
                            config_id,
                            enabled,
                            currency_name,
                            currency_namePlural,
                            currency_symbol,
                            currency_image,
                            currency_useImg,
                            gambling_enabled,
                            gambling_min,
                            gambling_max,
                            drops_enabled,
                            drops_channels,
                            drops_filterMode
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE
                         enabled = VALUES(enabled),
                         currency_name = VALUES(currency_name),
                         currency_namePlural = VALUES(currency_namePlural),
                         currency_symbol = VALUES(currency_symbol),
                         currency_image = VALUES(currency_image),
                         currency_useImg = VALUES(currency_useImg),
                         gambling_enabled = VALUES(gambling_enabled),
                         gambling_min = VALUES(gambling_min),
                         gambling_max = VALUES(gambling_max),
                         drops_enabled = VALUES(drops_enabled),
                         drops_channels = VALUES(drops_channels),
                         drops_filterMode = VALUES(drops_filterMode)`,
                    [
                        configId,
                        !!system.economy.enabled,
                        system.economy.currency?.name ?? "",
                        system.economy.currency?.namePlural ?? "",
                        system.economy.currency?.symbol ?? "",
                        system.economy.currency?.image ?? "",
                        !!system.economy.currency?.useImg,
                        !!system.economy.gambling?.enabled,
                        system.economy.gambling?.min ?? 5,
                        system.economy.gambling?.max ?? 100,
                        !!system.economy.drops?.enabled,
                        JSON.stringify(system.economy.drops?.channels ?? []),
                        system.economy.drops?.filterMode ?? 0,
                    ],
                );

                log.debug(system);
                log.info(`[O] Settings for server ${system.server} updated`);

                await conn.release();

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
};

export default {
    fetch,
    update,
    database,
};