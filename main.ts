import { BloqbitClient, log } from "#bloqbit/include.ts";

process.on("SIGUSR1", () => {
    log.print("Received SIGUSR1 - Debugger may be activated.");
});

process.on("SIGUSR2", () => {
    log.print("Received SIGUSR2 - Debugger may be activated.");
});

process.on("SIGABRT", () => {
    log.error("Process aborted unexpectedly!");
});

process.on('uncaughtException', (err) => {
    log.error('Unhandled Exception:', err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    if (reason instanceof Error) {
        log.trace('Unhandled Rejection:', reason.stack || 'No stack trace available', "\n", promise);
    } else {
        log.error('Unhandled Rejection:', reason, "\n", promise);
    };
});

log.print('Starting system...');

if (global.gc) { // garbage collection
    global.gc(true); // enable minor gc

    log.debug('Garbage collection triggered manually');
} else {
    log.warn('Garbage collection is not exposed. Use --expose-gc to enable it.');
};

import path from 'path';
import http from 'http';
import dotenv from 'dotenv';

import { ShardingManager, User } from 'discord.js';

dotenv.config();

/**
 * Start Bloqbit
 */
const start = async () => {
    let allShards: number = 0;

    process.on("debug", (debugInfo) => {
        log.print("Debug Info:", debugInfo);
    });

    process.on('warning', (warning) => {
        log.warn('Node Warning:', warning.name, warning.message, warning.stack);
    });

    process.on("beforeExit", (code) => {
        log.print(`Process is exiting with code ${code}...`);
    });

    process.on("exit", (code) => {
        log.print(`Process exited with code ${code}`);
    });

    const SERVER_IP = (process.env.APP_HOST || process.env.REDIS_HOST || process.env.IP || process.env.SERVER_IP) || "0.0.0.0";
    const SERVER_PORT = parseInt((process.env.APP_PORT || process.env.REDIS_PORT || process.env.PORT || process.env.SERVER_PORT) || '3000');

    const server = http.createServer((req, res) => {
        log.debug(`Request details:\n      URL: ${req.url}\n      Method: ${req.method}\n      Headers:`, req.rawHeaders.map((h, i) => {
            return i % 2 === 0 ? `\n            ${h}: ${req.rawHeaders[i + 1]}` : null;
        }).filter((h) => h !== null));

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Server is running\n');
    });

    if (parseInt(process.env.USE_SHARDS || '0', 10) >= 1) {
        try {
            const manager = new ShardingManager(path.resolve("./src/index.ts"), {
                "execArgv": ["--loader", "ts-node/esm"],
                "token": process.env.MAIN_TOKEN,
                "totalShards": "auto",
                "respawn": false,
                "shardArgs": [
                    JSON.stringify({
                        MAIN_TOKEN: process.env.MAIN_TOKEN,
                        MAIN_LOG_WH: process.env.MAIN_LOG_WH,
                        DB_HOST: process.env.DB_HOST,
                        DB_PORT: process.env.DB_PORT,
                        DB_USERNAME: process.env.DB_USERNAME,
                        DB_PASSWORD: process.env.DB_PASSWORD,
                        DB_DATABASE: process.env.DB_DATABASE,
                        MAIN_SECRET: process.env.MAIN_SECRET,
                    }),
                ],
            });

            manager.on("shardCreate", async (shard) => {
                shard.once("ready", async () => {
                    allShards++;
                    log.info(`Bot client of shard ${allShards}/${manager.shardList?.length} starting...`);

                    if (allShards === manager.shardList?.length) {
                        log.print(`All bot client shards started`);

                        shard.process?.once("message", async (msg: { type: string, user: User, shard: number }) => {
                            if (typeof msg === "object") if (msg.type === "shard") {
                                if (allShards === manager.shardList?.length) log.done(`Bloqbit is online - system is running on ${allShards} shard${allShards > 1 ? 's' : ''}, operating on client @${msg.user?.username} (${msg.user?.id})`);
                            } else {
                                log.error(`Entrypoint event listener received invalid event type`);
                            };
                        });
                    } else {
                        log.debug(`Shards have yet to start...`);
                    };
                });
            });

            await manager.spawn({
                "amount": "auto",
                "delay": 5000,
                "timeout": 30000,
            });

            let shuttingDown: boolean = false;

            /**
             * Shut the program down
             */
            const shutDown = async (): Promise<void> => {
                shuttingDown = true;
                log.print("Initiating shutdown process...");

                try {
                    const shutdownsReceived = new Set<number>();

                    manager.shards?.forEach((sh) => {
                        sh.removeAllListeners('message');

                        sh.on('message', (msg) => {
                            switch (msg) {
                                case 'shutdownComplete':
                                    try {
                                        shutdownsReceived.add(sh.id);

                                        if (shutdownsReceived.size === manager.totalShards) {
                                            log.print(`All shards have completed shutdown`);

                                            server.close(() => {
                                                log.print("Server has been stopped");
                                                process.exit(0);
                                            });
                                        } else {
                                            log.print(`Shard ${sh.id + 1} (${shutdownsReceived.size} / ${manager.totalShards}) has completed shutdown`);
                                        };
                                    } catch (err) {
                                        log.trace(err);
                                    };
                                    break;

                                case 'shutdownError':
                                    try {
                                        log.error('A shard reported an error during shutdown');
                                    } catch (err) {
                                        log.trace(err);
                                    };
                                    break;

                                default:
                                    log.error(`Received unknown message from shard ${sh.id}:`, msg);
                                    break;
                            };
                        });
                    });

                    await manager.broadcastEval(() => {
                        if (process.send) process.send('flushClose');
                    });
                } catch (err) {
                    log.trace(err);
                    process.exit(1);
                };

                setTimeout(() => {
                    log.warn('Shutdown timeout reached, forcing exit...');
                    process.exit(1);
                }, 60000); // 60 sec
            };

            process.on('SIGINT', async () => {
                shuttingDown ? null : log.warn('Received SIGINT. Shutting down gracefully...');
                return shuttingDown ? null : await shutDown();
            });

            process.on('SIGTERM', async () => {
                shuttingDown ? null : log.warn('Received SIGTERM. Shutting down gracefully...');
                return shuttingDown ? null : await shutDown();
            });

            server.listen(SERVER_PORT, () => {
                log.print(`Server running on IP address ${SERVER_IP} with port ${SERVER_PORT}`);
            });
        } catch (err) {
            log.trace(err);
            process.exit(1);
        };
    } else {
        log.warn('Sharding is disabled, starting single process (not recommended for production)...');

        try {
            const IndexModule = await import("./src/index");
            const Bot = IndexModule.default;

            const b = new Bot({
                "botModel": new BloqbitClient(
                    IndexModule.checkEnv(process.env.MAIN_TOKEN, "MAIN_TOKEN"),
                    IndexModule.checkEnv(process.env.MAIN_LOG_WH, "MAIN_LOG_WH"),
                    {
                        "host": IndexModule.checkEnv(process.env.DB_HOST, "DB_HOST"),
                        "port": IndexModule.checkEnv(process.env.DB_PORT, "DB_PORT") ? parseInt(IndexModule.checkEnv(process.env.DB_PORT, "DB_PORT"), 10) : 3306,
                        "user": IndexModule.checkEnv(process.env.DB_USERNAME, "DB_USERNAME"),
                        "password": IndexModule.checkEnv(process.env.DB_PASSWORD, "DB_PASSWORD"),
                        "database": IndexModule.checkEnv(process.env.DB_DATABASE, "DB_DATABASE"),
                    },
                    process.env.MAIN_SECRET,
                ),
            }, false);

            log.info(`Bot client ${b.botModel.client.user?.username} starting with 1 shard...`);
        } catch (err) {
            log.trace(err);
            process.exit(1);
        };
    };
};

// Run the program
(async () => {
    try {
        await start();
    } catch (err) {
        log.trace(err);
        return;
    } finally {
        return;
    };
})();