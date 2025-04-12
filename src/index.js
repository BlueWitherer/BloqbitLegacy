import { BloqbitClient, Command, LogEvent, MessageHandler, ServerHandler, UserHandler } from './classes.mjs';

import fs from 'node:fs';
import path from 'path';
import url from 'url';
import fetch from './modules/fetch.mjs';

import { Events, ActivityType, PresenceUpdateStatus, WebhookClient } from 'discord.js';
import { Routes } from 'discord-api-types/v9';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class Bot {
    constructor() {
        return this;
    };

    /**
     * Starts up Bloqbit
     * 
     * @param {BloqbitClient} botModel Bot data model.
     * @param {boolean} testMode If the login is only being tested.
     * 
     * @returns {Promise<BloqbitClient>}
     */
    activate = async (botModel, testMode) => {
        botModel.client?.on(Events.ClientReady, async (client) => {
            client.user?.setPresence({
                "activities": [
                    {
                        "name": `Starting...`,
                        "state": `Active across ${client.guilds.cache.size} servers!`,
                        "type": ActivityType.Streaming,
                        "url": `https://www.youtube.com/@CubicCommunity/`,
                    }
                ],
                "afk": false,
                "status": PresenceUpdateStatus.DoNotDisturb,
            });

            try {
                const foldersPath = path.join(__dirname, 'cmds');
                const commandFolders = fs.readdirSync(foldersPath);

                for (const folder of commandFolders) {
                    const commandsPath = path.join(foldersPath, folder);
                    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.mjs'));

                    for (const file of commandFiles) {
                        try {
                            const filePath = path.join(commandsPath, file);

                            /**
                             * @type {Command}
                             */
                            const command = (await import(url.pathToFileURL(filePath).href)).default;

                            // @ts-ignore
                            botModel.commands.push(command.data.toJSON());
                            botModel.cmds.set(command.data.name, command);

                            console.debug(`Loaded command /${command.data.name}`);
                        } catch (err) {
                            console.error(err);
                            if (testMode) process.exit(1);
                        };
                    };
                };

                (async () => {
                    try {
                        console.log(`Started refreshing ${botModel.commands.length} application (/) commands.`);

                        const data = await botModel.rest.put(
                            Routes.applicationCommands(client?.user?.id),
                            { body: botModel.commands, },
                        );

                        // @ts-ignore
                        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
                    } catch (error) {
                        console.error(error);
                        if (testMode) process.exit(1);
                    };
                })();
            } catch (error) {
                console.error(error);
                process.exit(1);
            };

            try {
                const logsPath = path.join(__dirname, 'events/logging');
                const logEventFiles = fs.readdirSync(logsPath).filter(file => file.endsWith('.mjs'));

                for (const file of logEventFiles) {
                    try {
                        const filePath = path.join(logsPath, file);

                        /**
                         * @type {LogEvent}
                         */
                        const logEvent = (await import(url.pathToFileURL(filePath).href)).default;

                        client.on(logEvent.event.toString(), (...args) => {
                            logEvent.execute(botModel, botModel.db, ...args);
                        });

                        console.log(`Log event loaded: ${logEvent.event.toString()}`);
                    } catch (err) {
                        console.error(err);
                    };
                };
            } catch (err) {
                console.error(err);
                process.exit(1);
            };

            try {
                const eventsPath = path.join(__dirname, 'events');
                const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.mjs'));

                for (const file of eventFiles) {
                    try {
                        const filePath = path.join(eventsPath, file);
                        const event = (await import(url.pathToFileURL(filePath).href)).default;

                        if (event.once) {
                            client?.once(event.name, async (...args) => {
                                try {
                                    return await event.execute(botModel, ...args);
                                } catch (error) {
                                    console.error(error);
                                    if (testMode) process.exit(1);
                                };
                            });
                        } else {
                            client?.on(event.name, async (...args) => {
                                try {
                                    return await event.execute(botModel, ...args);
                                } catch (error) {
                                    console.error(error);
                                    if (testMode) process.exit(1);
                                };
                            });
                        };

                        console.debug(`Loaded event listener for ${event.name}.`);
                    } catch (error) {
                        console.error(error);
                        if (testMode) process.exit(1);
                    };
                };

                if (testMode) {
                    console.info("Skipping database step...");
                } else {
                    const clientGuilds = await botModel.client.guilds.fetch();

                    for (const inGuild of clientGuilds) {
                        try {
                            const inCache = fetch.fetchGuild(inGuild[1].id);

                            if (inCache) {
                                console.log(inCache.server);
                            } else {
                                const thisGuild = await fetch.reviseGuild(botModel.db, inGuild[1].id);

                                // @ts-ignore
                                console.log(thisGuild.server);
                            };
                        } catch (err) {
                            console.error(err);
                        };
                    };
                };

                console.debug("Starting handlers...");
                new MessageHandler(client);

                const devWH = new WebhookClient({ "url": botModel.dev_wh, });

                await devWH.send({
                    "avatarURL": client.user?.displayAvatarURL({ "forceStatic": true, "size": 512 }),
                    "content": "",
                    "embeds": [
                        {
                            "author": {
                                "name": `Service Status`,
                            },
                            "description": `${botModel.assets.default.icons.check} **${client.user?.displayName}** is now __online__.`,
                            "color": botModel.assets.colors.primary,
                            "footer": {
                                "text": client.user?.username,
                                "icon_url": client.user?.displayAvatarURL({ "forceStatic": false, "size": 512 }),
                            },
                        },
                    ],
                });

                botModel.online = true;
                console.log(`Bot user ${client.user?.username} is online.`);
            } catch (err) {
                console.error(err);
                process.exit(1);
            };

            client.user?.setPresence({
                "activities": [
                    {
                        "name": `Finishing up...`,
                        "state": `Active across ${client.guilds.cache.size} servers!`,
                        "type": ActivityType.Streaming,
                        "url": `https://www.youtube.com/@CubicCommunity/`,
                    }
                ],
                "afk": false,
                "status": PresenceUpdateStatus.Idle,
            });

            try {
                console.debug("Starting handlers...");

                new MessageHandler(client);
                new ServerHandler(client);
                new UserHandler(client);

                console.debug("Handlers successfully started");
            } catch (err) {
                console.error(err);
            };

            if (testMode) {
                console.warn("Test mode active.");
                console.debug("All bot start-up operations successful. No fatal errors detected. Logging off...");

                await client.destroy();
                process.exit(0);
            } else {
                client.user?.setPresence({
                    "activities": [
                        {
                            "name": `Alpha Testing!`,
                            "state": `Active across ${client.guilds.cache.size} servers!`,
                            "type": ActivityType.Streaming,
                            "url": `https://www.youtube.com/@CubicCommunity/`,
                        }
                    ],
                    "afk": false,
                    "status": PresenceUpdateStatus.Online,
                });

                console.info(`Client ${client.user?.displayName} online`);
            };
        });

        botModel.clientGil?.on("ready", () => {
            if (testMode) {
                botModel.clientGil?.disconnect();
                process.exit(0);
            } else {
                botModel.clientGil?.setStatus({
                    content: "Hello, Guilded!",
                    emoteId: 47,
                    expiresAt: null,
                });

                console.info(`Guilded client ${botModel.clientGil?.user?.name} online`);
            };
        });

        try {
            await botModel.client?.login(botModel.token);
            botModel.clientGil?.login();
        } catch (err) {
            console.error(err);
        };

        return botModel;
    };
};