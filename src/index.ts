import { BloqbitClient, Command, BotEvent } from './classes.js';

import * as fs from 'node:fs';
import * as path from 'path';
import * as url from 'url';

import { Events, PresenceUpdateStatus, WebhookClient } from 'discord.js';
import { Routes } from 'discord-api-types/v9';

import fetch from './modules/fetch.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class Bot {
    public botModel: BloqbitClient;

    constructor({ botModel = new BloqbitClient("", "", "", "") }: Partial<Bot>) {
        this.botModel = botModel;

        return this;
    };

    activate = async (testMode: boolean): Promise<BloqbitClient> => {
        if (testMode) console.log("Test mode active.");

        const bot = this.botModel;

        bot.client?.on(Events.ClientReady, async (client) => {
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
                const foldersPath = path.join(__dirname, 'cmds');
                const commandFolders = fs.readdirSync(foldersPath);

                for (const folder of commandFolders) {
                    const commandsPath = path.join(foldersPath, folder);

                    await loadFiles(commandsPath, async (command: Command) => {
                        // @ts-ignore
                        bot.commands.push(command.data?.toJSON());
                        bot.cmds.set(command.data?.name, command);

                        console.debug(`Loaded command /${command.data.name}`);
                    });
                };

                console.log(`Refreshing ${bot.commands.length} application (/) commands...`);

                try {
                    console.log(`Refreshing ${bot.commands.length} application (/) commands...`);

                    const data = await bot.rest.put(
                        Routes.applicationCommands(client?.user?.id),
                        { body: bot.commands }
                    );

                    // @ts-ignore
                    console.info(`Successfully reloaded ${data.length} application (/) commands`);
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

                    console.debug(`Loaded event listener for ${event.name}`);
                });
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

                    console.debug(`Loaded guild ${folder} event for ${botEvent.event.toString()}`);
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
                console.trace(err);
                process.exit(1);
            };

            fetch.setPresence(client, `Finishing up...`, `Bot is starting up, please wait...`, PresenceUpdateStatus.Idle);

            try {
                if (testMode) {
                    console.info(`All start-up operations successful, shutting down...`);

                    await client.destroy();
                    process.exit(0);
                } else {
                    const srvs = await client.guilds?.fetch();
                    fetch.setPresence(client, `Alpha Testing!`, `Active across ${srvs.size} servers!`, PresenceUpdateStatus.Online);

                    const devWH = new WebhookClient({ "url": bot.dev_wh, });

                    await devWH.send({
                        "avatarURL": client.user?.displayAvatarURL({ "forceStatic": true, "size": 512 }),
                        "content": "",
                        "embeds": [
                            {
                                "author": {
                                    "name": `Service Status`,
                                },
                                "description": `${bot.assets.default.icons.check} **${client.user?.displayName}** is now __online__`,
                                "color": bot.assets.colors.primary,
                                "footer": {
                                    "text": client.user?.username,
                                    "icon_url": client.user?.displayAvatarURL({ "forceStatic": false, "size": 512 }),
                                },
                            },
                        ],
                    });

                    console.log(`Bloqbit is online - running as bot user @${client.user?.username} (${client.user?.id})`);
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
            if (testMode) process.exit(1);
        };

        return bot;
    };
};