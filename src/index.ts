import { BloqbitClient, Command, BotEvent, log, ContextButton } from "#bloqbit/include.ts";

import * as fs from 'node:fs';
import * as path from 'path';
import * as url from 'url';

import { Events, PresenceUpdateStatus, WebhookClient } from 'discord.js';
import { RESTPostAPIChatInputApplicationCommandsJSONBody, RESTPostAPIContextMenuApplicationCommandsJSONBody, Routes } from 'discord-api-types/v10';

import fetch from "#bloqbit/modules/fetch.mjs";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class Bot {
    public botModel: BloqbitClient;
    private testMode: boolean;

    constructor({ botModel = new BloqbitClient("", "", { "host": "", "port": 3000, "user": "admin", "password": "admin", "database": "bloqbit" }) }: Partial<Bot>, testMode: boolean = false) {
        this.botModel = botModel;
        this.testMode = testMode;

        this.init();
        return this;
    };

    public init = async (): Promise<BloqbitClient | void> => {
        try {
            return await this.activate(this.testMode);
        } catch (err) {
            console.trace(err);
            return;
        };
    };

    private activate = async (testMode: boolean = false): Promise<BloqbitClient> => {
        if (testMode) log.print("Test mode active.");

        const bot = this.botModel;

        const devWH = new WebhookClient({ "url": bot.dev_wh, });

        bot.client?.on(Events.Debug, async (message): Promise<void> => {
            try {
                log.debug(message);
            } catch (err) {
                console.trace(err);
            };
        });

        bot.client?.on(Events.Warn, async (message): Promise<void> => {
            const date = Math.floor(Date.now() / 1000);

            try {
                log.warn(message);

                await devWH.send({
                    "avatarURL": bot.client?.user?.displayAvatarURL({ "forceStatic": true, "size": 512, }),
                    "embeds": [
                        {
                            "author": {
                                "name": `Warning`,
                            },
                            "description": `\`\`\`${message}\`\`\``,
                            "color": bot.assets.colors.tertiary,
                            "fields": [
                                {
                                    "name": "Time of Warning",
                                    "value": `<t:${date}:F> • <t:${date}:R>`,
                                    "inline": false,
                                },
                            ],
                            "footer": {
                                "text": bot.client?.user?.username || "Unknown User",
                                "icon_url": bot.client?.user?.displayAvatarURL({ "forceStatic": false, "size": 128 }),
                            },
                        },
                    ],
                });
            } catch (err) {
                console.trace(err);
            };
        });

        bot.client?.on(Events.Error, async (error): Promise<void> => {
            const date = Math.floor(Date.now() / 1000);

            try {
                log.error(error.stack);

                await devWH.send({
                    "avatarURL": bot.client?.user?.displayAvatarURL({ "forceStatic": true, "size": 512, }),
                    "embeds": [
                        {
                            "author": {
                                "name": `Error`,
                            },
                            "description": `\`\`\`${error.message}\`\`\``,
                            "color": bot.assets.colors.secondary,
                            "fields": [
                                {
                                    "name": "Time of Error",
                                    "value": `<t:${date}:F> • <t:${date}:R>`,
                                    "inline": false,
                                },
                            ],
                            "footer": {
                                "text": bot.client?.user?.username ?? '',
                                "icon_url": bot.client?.user?.displayAvatarURL({ "forceStatic": false, "size": 128 }),
                            },
                        },
                    ],
                });
            } catch (err) {
                console.trace(err);
            };
        });

        bot.client?.once(Events.ClientReady, async (client): Promise<void> => {
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
                            console.trace(err);
                            if (testMode) process.exit(1);
                        };
                    };
                } catch (err) {
                    console.trace(err);
                    process.exit(1);
                };
            };

            try {
                const cmdFoldersPath = path.join(__dirname, 'cmds');
                const commandFolders = fs.readdirSync(cmdFoldersPath);

                for (const folder of commandFolders) {
                    const commandsPath = path.join(cmdFoldersPath, folder);

                    await loadFiles(commandsPath, async (command: Command) => {
                        bot.commands.push(command.data?.toJSON());
                        bot.cmds.set(command.data?.name, command);

                        log.debug(`Loaded ${folder} command /${command.data.name}`);
                    });
                };

                const btnFoldersPath = path.join(__dirname, 'btns');
                const buttonFolders = fs.readdirSync(btnFoldersPath);

                for (const folder of buttonFolders) {
                    const buttonsPath = path.join(btnFoldersPath, folder);

                    await loadFiles(buttonsPath, async (button: ContextButton) => {
                        bot.buttons.push(button.data?.toJSON());
                        bot.btns.set(button.data?.name, button);

                        log.debug(`Loaded ${folder} context button ${button.data.name}`);
                    });
                };

                try {
                    const interactions: Array<RESTPostAPIChatInputApplicationCommandsJSONBody | RESTPostAPIContextMenuApplicationCommandsJSONBody> = [];

                    bot.commands.forEach((cmd) => interactions.push(cmd));
                    bot.buttons.forEach((btn) => interactions.push(btn));

                    log.print(`Refreshing ${interactions.length} application interactions...`);

                    const data = await bot.rest.put(
                        Routes.applicationCommands(client?.user?.id),
                        { body: interactions }
                    ) as import('discord-api-types/v10').APIApplicationCommand[];

                    log.info(`Successfully reloaded ${data.length}/${interactions.length} application interactions`);
                } catch (err) {
                    console.trace(err);
                    if (testMode) process.exit(1);
                };
            } catch (err) {
                console.trace(err);
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
                                console.trace(err);
                            };
                        });
                    } else {
                        client.on(event.name.toString(), async (...args) => {
                            try {
                                await event.execute(bot, ...args);
                            } catch (err) {
                                console.trace(err);
                            };
                        });
                    };

                    log.debug(`Loaded event listener for ${event.name}`);
                });

                log.info(`Successfully reloaded event listeners`);
            } catch (err) {
                console.trace(err);
                process.exit(1);
            };

            try {
                const loadSubEvents = async (botEvent: BotEvent, folder: string) => {
                    client.on(botEvent.event.toString(), async (...args) => {
                        try {
                            await botEvent.execute(bot, ...args);
                        } catch (err) {
                            console.trace(err);
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

                log.info(`Successfully reloaded guild event listeners`);
            } catch (err) {
                console.trace(err);
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

                    await devWH.send({
                        "avatarURL": client.user?.displayAvatarURL({ "forceStatic": true, "size": 512 }),
                        "embeds": [
                            {
                                "author": {
                                    "name": `Service Status`,
                                },
                                "description": `${bot.assets.icons.check} **${client.user?.displayName}** is now __online__ on shard ${clientShard}`,
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
                console.trace(err);
                process.exit(1);
            };
        });

        try {
            await bot.client?.login(bot.token);
        } catch (err) {
            console.trace(err);
            process.exit(1);
        };

        return bot;
    };
};

export const checkEnv: (env: string | undefined, name: string) => string = (env: string | undefined, name: string) => {
    try {
        if (env) {
            return env;
        } else {
            throw new Error(`Missing environment variable '${name}'`, { "cause": "env" });
        };
    } catch (err) {
        console.trace(err);
        process.exit(1);
    };
};

try {
    const dat = JSON.parse(process.argv[2]);
    const bloqbit = new BloqbitClient(
        checkEnv(dat.MAIN_TOKEN, "MAIN_TOKEN"),
        checkEnv(dat.MAIN_LOG_WH, "MAIN_LOG_WH"),
        {
            "host": checkEnv(dat.DB_HOST, "DB_HOST"),
            "port": parseInt(checkEnv(dat.DB_PORT, "DB_PORT"), 10),
            "user": checkEnv(dat.DB_USERNAME, "DB_USERNAME"),
            "password": checkEnv(dat.DB_PASSWORD, "DB_PASSWORD"),
            "database": checkEnv(dat.DB_DATABASE, "DB_DATABASE"),
        },
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
            case "flushClose":
                try {
                    if (bb.botModel.client && typeof bb.botModel.client.destroy === 'function') await bb.botModel.client.destroy();

                    if (process.send) process.send('shutdownComplete');
                    log.debug(`Shard of ID ${bb.botModel.client?.shard?.ids[0]} shutdown complete`);
                } catch (err) {
                    console.trace(err);
                    if (process.send) process.send('shutdownError');
                };
                break;

            default:
                log.error(`Shard of ID ${bb.botModel.client?.shard?.ids[0]} received unknown message:`, msg);
                break;
        };
    });
} catch (err) {
    console.trace(err);
    process.exit(1);
};