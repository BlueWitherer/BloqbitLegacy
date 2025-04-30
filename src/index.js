import { BloqbitClient, Command, LogEvent, MessageHandler, ServerHandler, UserHandler } from './classes.js';

import * as fs from 'node:fs';
import * as path from 'path';
import * as url from 'url';

import { Events, PresenceUpdateStatus, WebhookClient, SlashCommandBuilder } from 'discord.js';
import { Routes } from 'discord-api-types/v9';

import fetch from './modules/fetch.js';

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
        if (testMode) console.log("Test mode active.");

        // @ts-ignore
        botModel.client?.on(Events.ClientReady, async (client) => {
            fetch.setPresence(client, `Starting...`, `Bot is starting up, please wait...`, PresenceUpdateStatus.DoNotDisturb);

            /**
             * Loads files from a directory and applies a callback to each module.
             * 
             * @param {string} directory The directory to load files from.
             * @param {(module: any) => Promise<void>} callback The callback to execute for each loaded module.
             * 
             * @returns {Promise<void>}
             */
            const loadFiles = async (directory, callback) => {
                try {
                    const files = fs.readdirSync(directory).filter((file) => file.endsWith('.mjs'));

                    for (const file of files) {
                        const filePath = path.join(directory, file);

                        try {
                            /**
                             * @type {any}
                             */
                            const module = (await import(url.pathToFileURL(filePath).href)).default;
                            await callback(module);
                        } catch (err) {
                            console.error(`Failed to load file ${file}:`, err);
                            if (testMode) process.exit(1);
                        }
                    }
                } catch (err) {
                    console.error(`Error loading files from ${directory}:`, err);
                    process.exit(1);
                }
            };

            try {
                const foldersPath = path.join(__dirname, 'cmds');
                const commandFolders = fs.readdirSync(foldersPath);

                for (const folder of commandFolders) {
                    const commandsPath = path.join(foldersPath, folder);

                    await loadFiles(commandsPath, async (/** @type {Command} */ command) => {
                        // @ts-ignore
                        botModel.commands.push(command.data?.toJSON());
                        botModel.cmds.set(command.data?.name, command);

                        console.debug(`Loaded command /${command.data.name}`);
                    });
                };

                console.log(`Refreshing ${botModel.commands.length} application (/) commands...`);

                try {
                    const data = await botModel.rest.put(
                        Routes.applicationCommands(client?.user?.id),
                        { body: botModel.commands }
                    );

                    // @ts-ignore
                    console.info(`Successfully reloaded ${data.length} application (/) commands`);
                } catch (err) {
                    console.error("Failed to refresh application commands:", err);
                    if (testMode) process.exit(1);
                };
            } catch (err) {
                console.error("Error loading commands:", err);
                process.exit(1);
            };

            try {
                const logsPath = path.join(__dirname, 'events/logging');

                await loadFiles(logsPath, async (/** @type {LogEvent} */ logEvent) => {
                    client.on(logEvent.event.toString(), async (...args) => {
                        await logEvent.execute(botModel, ...args);
                    });

                    console.debug(`Loaded guild log event for ${logEvent.event.toString()}`);
                });
            } catch (err) {
                console.error("Error loading log events:", err);
                process.exit(1);
            };

            try {
                const eventsPath = path.join(__dirname, 'events');

                await loadFiles(eventsPath, async (event) => {
                    if (event.once) {
                        client.once(event.name, async (...args) => {
                            try {
                                await event.execute(botModel, ...args);
                            } catch (err) {
                                console.error(`Error executing event ${event.name}:`, err);
                                if (testMode) process.exit(1);
                            };
                        });
                    } else {
                        client.on(event.name, async (...args) => {
                            try {
                                await event.execute(botModel, ...args);
                            } catch (err) {
                                console.error(`Error executing event ${event.name}:`, err);
                                if (testMode) process.exit(1);
                            };
                        });
                    };

                    console.debug(`Loaded event listener for ${event.name}`);
                });
            } catch (err) {
                console.error("Error loading events:", err);
                process.exit(1);
            };

            fetch.setPresence(client, `Finishing up...`, `Bot is starting up, please wait...`, PresenceUpdateStatus.Idle);

            try {
                console.debug("Starting handlers...");

                new MessageHandler(client, botModel.db);
                new ServerHandler(client, botModel.db);
                new UserHandler(client, botModel.db);

                console.debug("Handlers successfully started");
            } catch (err) {
                console.trace(err);
                if (testMode) process.exit(1);
            };

            if (testMode) {
                console.info(`All start-up operations successful, shutting down...`);

                await client.destroy();
                process.exit(0);
            } else {
                const srvs = await client.guilds?.fetch();
                fetch.setPresence(client, `Alpha Testing!`, `Active across ${srvs.size} servers!`, PresenceUpdateStatus.Online);

                const devWH = new WebhookClient({ "url": botModel.dev_wh, });

                await devWH.send({
                    "avatarURL": client.user?.displayAvatarURL({ "forceStatic": true, "size": 512 }),
                    "content": "",
                    "embeds": [
                        {
                            "author": {
                                "name": `Service Status`,
                            },
                            "description": `${botModel.assets.default.icons.check} **${client.user?.displayName}** is now __online__`,
                            "color": botModel.assets.colors.primary,
                            "footer": {
                                "text": client.user?.username,
                                "icon_url": client.user?.displayAvatarURL({ "forceStatic": false, "size": 512 }),
                            },
                        },
                    ],
                });

                console.log(`Bloqbit running as bot user @${client.user?.username} (${client.user?.id}) is online`);
            };
        });

        try {
            await botModel.client?.login(botModel.token);
        } catch (err) {
            console.trace(err);
            if (testMode) process.exit(1);
        };

        return botModel;
    };
};