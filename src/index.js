import { BloqbitClient, MessageHandler, ServerHandler, UserHandler } from './classes.mjs';

import fs from 'node:fs';
import dotenv from 'dotenv';
import path from 'path';
import url from 'url';
import fetch from './modules/fetch.mjs';

import { Events, ActivityType, PresenceUpdateStatus, WebhookClient } from 'discord.js';
import { Routes } from 'discord-api-types/v9';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

export default class Bot {
    constructor() {
        return this;
    };

    /**
     * 
     * @param {BloqbitClient} botModel Bot data model.
     * @param {boolean} testMode If the login is only being tested.
     * 
     * @returns {Promise<BloqbitClient>}
     */
    activate = async (botModel, testMode) => {
        botModel.client.on(Events.ClientReady, async (client) => {
            client.user?.setPresence({
                "activities": [
                    {
                        "name": `Beta Testing!`,
                        "state": `Active across ${client.guilds.cache.size} servers!`,
                        "type": ActivityType.Streaming,
                        "url": `https://www.youtube.com/@CubicCommunity/`,
                    }
                ],
                "afk": false,
                "status": PresenceUpdateStatus.DoNotDisturb,
            });

            const importModule = async (filePath) => {
                try {
                    const module = await import(filePath);
                    // Use the module here
                    console.log(module);
                } catch (error) {
                    console.error('Error importing module:', error);
                }
            };

            try {
                const foldersPath = path.join(__dirname, 'cmds');
                const commandFolders = fs.readdirSync(foldersPath);

                for (const folder of commandFolders) {
                    const commandsPath = path.join(foldersPath, folder);
                    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.mjs'));

                    for (const file of commandFiles) {
                        const filePath = path.join(commandsPath, file);
                        const command = (await import(url.pathToFileURL(filePath).href)).default;

                        if ('data' in command && 'execute' in command) {
                            botModel.commands.push(command.data.toJSON());
                            botModel.cmds.set(command.data.name, command);
                        } else {
                            console.error(`The command at ${filePath} is missing a required "data" or "execute" property.`);
                            console.debug(command);
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
                        return console.error(error);
                    };
                })();
            } catch (error) {
                console.error(error);
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
                                    return console.error(error);
                                };
                            });
                        } else {
                            client?.on(event.name, async (...args) => {
                                try {
                                    return await event.execute(botModel, ...args);
                                } catch (error) {
                                    return console.error(error);
                                };
                            });
                        };

                        console.debug(`Loaded event listener for ${event.name}.`);
                    } catch (error) {
                        return console.error(error);
                    };
                };

                const clientGuilds = await botModel.client.guilds.fetch();

                for (const inGuild of clientGuilds) {
                    const inCache = fetch.fetchGuild(inGuild[1].id);

                    if (inCache) {
                        console.log(inCache.server);
                    } else {
                        const thisGuild = await fetch.reviseGuild(botModel.db, inGuild[1].id);

                        console.log(thisGuild?.server);
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

            try {
                console.debug("Starting handlers...");

                new MessageHandler(client);
                new ServerHandler(client);
                new UserHandler(client);

                console.debug("Handlers successfully started");
            } catch (err) {
                console.error(err);
            };

            console.info("Done");

            if (testMode) {
                console.warn("Test mode active.");
                console.debug("All bot start-up operations successful. No fatal errors detected. Logging off...");

                await client.destroy();
                process.exit(0);
            };
        });

        await botModel.client?.login(botModel.token);
        return botModel;
    };
};