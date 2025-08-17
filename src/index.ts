import { BloqbitClient, Command, BotEvent, log } from "#bloqbit/include";

import * as fs from 'node:fs';
import * as path from 'path';
import * as url from 'url';

import { Events, PresenceUpdateStatus, WebhookClient } from 'discord.js';
import { Routes } from 'discord-api-types/v10';

import cache from "#bloqbit/cache";
import fetch from "#bloqbit/modules/fetch";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class Bot {
    public botModel: BloqbitClient;
    private testMode: boolean;

    constructor({ botModel = new BloqbitClient("", "", "", "") }: Partial<Bot>, testMode: boolean = false) {
        this.botModel = botModel;
        this.testMode = testMode;

        this.init();
        return this;
    };

    public init = async (): Promise<BloqbitClient | void> => {
        try {
            return await this.activate(this.testMode);
        } catch (err) {
            log.trace(err);
            return;
        };
    };

    private activate = async (testMode: boolean = false): Promise<BloqbitClient> => {
        if (testMode) log.print("Test mode active.");

        const bot = this.botModel;

        bot.client?.once(Events.ClientReady, async (client) => {
            const clientShard = client.shard?.ids[0] || 0;
            fetch.setPresence(client, `Starting...`, `Bot is starting up, please wait...`, PresenceUpdateStatus.DoNotDisturb);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const loadFiles = async (directory: string, callback: (module: any) => Promise<void>) => {
                try {
                    const files = fs.readdirSync(directory).filter((file) => file.endsWith('.mjs'));

                    for (const file of files) {
                        const filePath = path.join(directory, file);

                        try {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const module: any = (await import(url.pathToFileURL(filePath).href)).default;
                            await callback(module);
                        } catch (err) {
                            log.trace(err);
                            if (testMode) process.exit(1);
                        };
                    };
                } catch (err) {
                    log.trace(err);
                    process.exit(1);
                };
            };

            try {
                const foldersPath = path.join(__dirname, 'cmds');
                const commandFolders = fs.readdirSync(foldersPath);

                for (const folder of commandFolders) {
                    const commandsPath = path.join(foldersPath, folder);

                    await loadFiles(commandsPath, async (command: Command) => {
                        // @ts-ignore
                        bot.commands.push(command.data?.toJSON());
                        bot.cmds.set(command.data?.name, command);

                        log.debug(`Loaded command /${command.data.name}`);
                    });
                };

                try {
                    log.print(`Refreshing ${bot.commands.length} application (/) commands...`);

                    const data = await bot.rest.put(
                        Routes.applicationCommands(client?.user?.id),
                        { body: bot.commands }
                    );

                    // @ts-ignore
                    log.info(`Successfully reloaded ${data.length} application (/) commands`);
                } catch (err) {
                    log.trace(err);
                    if (testMode) process.exit(1);
                };
            } catch (err) {
                log.trace(err);
                process.exit(1);
            };

            try {
                const eventsPath = path.join(__dirname, 'events');

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await loadFiles(eventsPath, async (event: { name: Events, once: boolean, execute: (bot: BloqbitClient, ...args: any[]) => Promise<void> }) => {
                    if (event.once) {
                        client.once(event.name.toString(), async (...args) => {
                            try {
                                await event.execute(bot, ...args);
                            } catch (err) {
                                log.trace(err);
                            };
                        });
                    } else {
                        client.on(event.name.toString(), async (...args) => {
                            try {
                                await event.execute(bot, ...args);
                            } catch (err) {
                                log.trace(err);
                            };
                        });
                    };

                    log.debug(`Loaded event listener for ${event.name}`);
                });
            } catch (err) {
                log.trace(err);
                process.exit(1);
            };

            try {
                const loadSubEvents = async (botEvent: BotEvent, folder: string) => {
                    client.on(botEvent.event.toString(), async (...args) => {
                        try {
                            await botEvent.execute(bot, ...args);
                        } catch (err) {
                            log.trace(err);
                        };
                    });

                    log.debug(`Loaded guild ${folder} event for ${botEvent.event.toString()}`);
                };

                const loadSubFolder = async (sub: string) => {
                    const folder = path.join(__dirname, `events/${sub}`);

                    await loadFiles(folder, async (e: BotEvent) => {
                        await loadSubEvents(e, sub);
                    });
                };

                await loadSubFolder('logging');
                await loadSubFolder('moderation');
            } catch (err) {
                log.trace(err);
                process.exit(1);
            };

            fetch.setPresence(client, `Finishing up...`, `Bot is starting up, please wait...`, PresenceUpdateStatus.Idle);

            try {
                if (testMode) {
                    log.info(`All start-up operations successful, shutting down...`);

                    await client.destroy();
                    process.exit(0);
                } else {
                    const srvs = await client.guilds?.fetch();
                    fetch.setPresence(client, `Alpha Testing!`, `Active across ${srvs.size} servers on shard ${clientShard}!`, PresenceUpdateStatus.Online);

                    const devWH = new WebhookClient({ "url": bot.dev_wh, });

                    await devWH.send({
                        "avatarURL": client.user?.displayAvatarURL({ "forceStatic": true, "size": 512 }),
                        "content": "",
                        "embeds": [
                            {
                                "author": {
                                    "name": `Service Status`,
                                },
                                "description": `${bot.assets.default.icons.check} **${client.user?.displayName}** is now __online__ on shard ${clientShard}`,
                                "color": bot.assets.colors.primary,
                                "footer": {
                                    "text": client.user?.username,
                                    "icon_url": client.user?.displayAvatarURL({ "forceStatic": false, "size": 512 }),
                                },
                            },
                        ],
                    });

                    if (process.send) {
                        const event = process.send({ type: "shard", user: client.user, shard: clientShard });
                        if (event) log.info(`Bot client instance on shard of ID ${clientShard} started`);
                    } else {
                        log.error(`Unable to communicate ready state with entrypoint`);
                    };
                };
            } catch (err) {
                log.trace(err);
                process.exit(1);
            };
        });

        try {
            await bot.client?.login(bot.token);
        } catch (err) {
            log.trace(err);
            if (testMode) process.exit(1);
        };

        return bot;
    };
};

const checkEnv: (env: string, name: string) => string = (env: string, name: string) => {
    try {
        if (env) {
            return env;
        } else {
            throw new Error(`Missing environment variable '${name}'`, { "cause": "env" });
        };
    } catch (err) {
        log.trace(err);
        process.exit(1);
    };
};

try {
    const dat = JSON.parse(process.argv[2]);
    const bloqbit = new BloqbitClient(
        checkEnv(dat.MAIN_TOKEN, "MAIN_TOKEN"),
        checkEnv(dat.MAIN_LOG_WH, "MAIN_LOG_WH"),
        checkEnv(dat.MONGO_URI, "MONGO_URI"),
        dat.MAIN_SECRET || undefined,
    );

    const bb = new Bot({ botModel: bloqbit });

    process.on("message", async (msg: unknown) => {
        let eventType: string | undefined;

        if (typeof msg === "string") {
            eventType = msg;
        } else if (typeof msg === "object" && msg !== null && "type" in msg) {
            eventType = (msg as { type: string }).type;
        };

        switch (eventType) {
            case "flushDb":
                try {
                    await cache.flushToDb(bb.botModel.db);
                    log.debug(`Cache from shard of ID ${bb.botModel.client?.shard?.ids[0]} flushed to database`);
                } catch (err) {
                    log.trace(err);
                };
                break;

            case "flushClose":
                try {
                    if (typeof cache?.flushToDb === 'function') await cache.flushToDb(bb.botModel.db);
                    if (bb.botModel.client && typeof bb.botModel.client.destroy === 'function') await bb.botModel.client.destroy();

                    if (process.send) process.send('shutdownComplete');
                    log.debug(`Shard of ID ${bb.botModel.client?.shard?.ids[0]} shutdown complete`);
                } catch (err) {
                    log.trace(err);
                    if (process.send) process.send('shutdownError');
                };
                break;

            default:
                log.error(`Shard of ID ${bb.botModel.client?.shard?.ids[0]} received unknown message:`, msg);
                break;
        };
    });
} catch (err) {
    log.trace(err);
    process.exit(1);
};