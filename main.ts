import "./console.mjs";

process.on("SIGUSR1", () => {
    console.log("Received SIGUSR1 - Debugger may be activated.");
});

process.on("SIGUSR2", () => {
    console.log("Received SIGUSR2 - Debugger may be activated.");
});

process.on("SIGABRT", () => {
    console.error("Process aborted unexpectedly!");
});

process.on('uncaughtException', (err) => {
    console.error('Unhandled Exception:', err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    if (reason instanceof Error) {
        console.trace('Unhandled Rejection:', reason.stack || 'No stack trace available', "\n", promise);
    } else {
        console.error('Unhandled Rejection:', reason, "\n", promise);
    };
});

console.log('Starting system...');

if (global.gc) {
    global.gc();

    console.debug('Garbage collection triggered manually');
} else {
    console.warn('Garbage collection is not exposed. Use --expose-gc to enable it.');
};

import path from 'path';
import http from 'http';
import dotenv from 'dotenv';

import { ShardingManager, User } from 'discord.js';

dotenv.config();

const start = async () => {
    let allShards: number = 0;

    process.on("debug", (debugInfo) => {
        console.log("Debug Info:", debugInfo);
    });

    process.on('warning', (warning) => {
        console.warn('Node Warning:', warning.name, warning.message, warning.stack);
    });

    process.on("beforeExit", (code) => {
        console.log(`Process is exiting with code ${code}...`);
    });

    process.on("exit", (code) => {
        console.log(`Process exited with code ${code}`);
    });

    const SERVER_IP = (process.env.APP_HOST || process.env.REDIS_HOST || process.env.IP || process.env.SERVER_IP) || "0.0.0.0";
    const SERVER_PORT = parseInt((process.env.APP_PORT || process.env.REDIS_PORT || process.env.PORT || process.env.SERVER_PORT) || '3000');

    const server = http.createServer((req, res) => {
        console.debug(`Request details:\n      URL: ${req.url}\n      Method: ${req.method}\n      Headers:`, req.rawHeaders.map((h, i) => {
            return i % 2 === 0 ? `\n            ${h}: ${req.rawHeaders[i + 1]}` : null;
        }).filter((h) => h !== null));

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Server is running\n');
    });

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
                    MONGO_URI: process.env.MONGO_URI,
                    MAIN_SECRET: process.env.MAIN_SECRET,
                }),
            ],
        });

        manager.on("shardCreate", async (shard) => {
            shard.once("ready", async () => {
                allShards++;
                console.info(`Bot client of shard ${allShards}/${manager.shardList?.length} starting...`);

                if (allShards === manager.shardList?.length) {
                    console.log(`All bot client shards started`);

                    shard.process?.once("message", async (msg: { type: string, user: User, shard: number }) => {
                        if (typeof msg === "object") if (msg.type === "shard") {
                            if (allShards === manager.shardList?.length) console.log(`Bloqbit is online - system is running on ${allShards} shard${allShards > 1 ? 's' : ''}, operating on client @${msg.user?.username} (${msg.user?.id})`);
                        } else {
                            console.error(`Entrypoint event listener received invalid event type`);
                        };
                    });
                } else {
                    console.debug(`Shards have yet to start...`);
                };
            });
        });

        await manager.spawn({
            "amount": "auto",
            "delay": 5000,
            "timeout": 30000,
        });

        let shuttingDown: boolean = false;

        const shutDown = async (): Promise<void> => {
            shuttingDown = true;
            console.log("Initiating shutdown process...");

            try {
                let shutdownsReceived: number = 0;
                manager.shards?.forEach((sh) => {
                    sh.on('message', (msg) => {
                        if (msg === 'shutdownComplete') {
                            shutdownsReceived++;

                            if (shutdownsReceived === manager.totalShards) {
                                console.log(`All shards have completed shutdown. Total: ${shutdownsReceived}/${manager.totalShards}`);

                                server.close(() => {
                                    console.log("Server has been stopped");
                                    process.exit(0);
                                });
                            } else {
                                console.log(`Shard ${sh.id} has completed shutdown. Total: ${shutdownsReceived}/${manager.totalShards}`);
                            };
                        } else if (msg === 'shutdownError') {
                            console.error('A shard reported an error during shutdown');
                        } else {
                            console.warn(`Received unknown message from shard ${sh.id}:`, msg);
                        };
                    });
                });

                await manager.broadcastEval(async (client) => {
                    console.log(`Flushing data cached on shard of ID ${client.shard?.ids[0]} to database...`);
                    if (process.send) process.send('flushClose');
                });
            } catch (err) {
                console.trace(err);
                process.exit(1);
            };

            setTimeout(() => {
                console.warn('Shutdown timeout reached, forcing exit...');
                process.exit(1);
            }, 60000); // 60 sec
        };

        setInterval(async () => {
            try {
                if (process.send) process.send('flushDb');
            } catch (err) {
                console.trace(err);
            } finally {
                console.debug('Sent event to flush data to database');
            };
        }, 3600000); // 60 min

        process.on('SIGINT', async () => {
            shuttingDown ? null : console.warn('Received SIGINT. Shutting down gracefully...');
            return shuttingDown ? null : await shutDown();
        });

        process.on('SIGTERM', async () => {
            shuttingDown ? null : console.warn('Received SIGTERM. Shutting down gracefully...');
            return shuttingDown ? null : await shutDown();
        });

        server.listen(SERVER_PORT, () => {
            console.log(`Server running on IP address ${SERVER_IP} with port ${SERVER_PORT}`);
        });
    } catch (err) {
        console.trace(err);
        process.exit(1);
    };
};

(async () => {
    try {
        await start();
    } catch (err) {
        console.trace(err);
        return;
    } finally {
        return;
    };
})();