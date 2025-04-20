import cacheModule from '../cache.mjs';

import { SaveDataClient, Config, BloqbitClient } from '../classes.mjs';

import Discord from 'discord.js';
import Mongo from 'mongodb';

import resolve from './resolve.mjs';
import SysAssets from '../assets.json' with { type: 'json' };

export default {
    /**
     * Returns URL of the first image found in a message
     * 
     * @param {Discord.Message} msg Discord.Message to search for image in
     * 
     * @returns {string | null} Image URL
     */
    ifImage: (msg) => {
        if (msg.attachments?.size > 0) {
            return msg.attachments?.first().url;
        } else {
            return null;
        };
    },

    /**
     * Returns proxy URL of the first image found in a message
     * 
     * @param {Discord.Message} msg Discord.Message to search for image in
     * 
     * @returns {string | null} Proxy image URL
     */
    ifProxyImage: (msg) => {
        if (msg.attachments?.size > 0) {
            return msg.attachments?.first().proxyURL;
        } else {
            return null;
        };
    },

    /**
     * Handles errors with interactions
     * 
     * @param {string} err Error message
     * @param {Discord.Interaction} interaction Command interaction
     * @param {typeof SysAssets} assets Assets object
     * 
     * @returns {Promise<void>} Error log
     */
    interactionError: async (err, interaction, assets) => {
        if (err && interaction) {
            try {
                if (interaction.type === Discord.InteractionType.ApplicationCommand) {
                    await interaction.reply({
                        "content": `> ${assets.icons.xmark} **${interaction.user?.username}** - An error occurred.`,
                        "flags": [
                    "Ephemeral",
                ],
                    });

                    console.error(err);
                    return;
                };
            } catch (err) {
                console.error(err);
                return;
            };
        } else {
            return;
        };
    },

    /**
     * Gets the configuration object of the server
     * 
     * @param {string} server ID of the server
     * 
     * @returns {Config | void} Fetched server settings object
     */
    fetchGuild: (server) => {
        if (server) {
            try {
                const res = cacheModule.fetch(server);
                return res;
            } catch (err) {
                console.error(err);
                return;
            };
        } else {
            return;
        };
    },

    /**
     * Handles errors with interactions if the server isn't registered already
     * 
     * @param {Discord.Interaction} interaction Command interaction
     * @param {typeof SysAssets} assets Assets object
     * 
     * @returns {Promise<void>} SaveDataClient operation
     */
    databaseErrorResponse: async (interaction, assets) => {
        if (interaction && assets) {
            try {
                if (interaction.isChatInputCommand()) {
                    await interaction.reply({
                        "content": "",
                        "embeds": [
                            {
                                "title": `${assets.icons.xmark} Server not registered`,
                                "description": `Due to an internal error, this server has not yet been registered in our database. You can fix this by using \`/reload\`.`,
                                "color": assets.colors.secondary,
                            },
                        ],
                        "flags": [
                    "Ephemeral",
                ],
                    });

                    return;
                } else {
                    return;
                };
            } catch (err) {
                console.error(err);
                return;
            };
        } else {
            return;
        };
    },

    /**
     * Error if a server owner isn't a subscriber
     * 
     * @param {Discord.Interaction} interaction Command interaction
     * @param {typeof SysAssets} assets Assets object
     * 
     * @returns {Promise<void>} SaveDataClient operation
     */
    noPremiumResponse: async (interaction, assets) => {
        if (interaction && assets) {
            try {
                if (interaction.isChatInputCommand()) {
                    await interaction.reply({
                        "content": "",
                        "embeds": [
                            {
                                "title": `${assets.icons.xmark} Server not Sponsored`,
                                "description": `This is a sponsors-only command, the server owner must be a sponsor of Bloqbit for anyone to use this.`,
                                "color": assets.colors.secondary,
                            },
                        ],
                        "flags": [
                    "Ephemeral",
                ],
                    });

                    return;
                } else {
                    return;
                };
            } catch (err) {
                console.error(err);
                return;
            };
        } else {
            return;
        };
    },

    /**
     * Generic command error response
     * 
     * @param {Discord.Interaction} interaction Command interaction 
     * @param {typeof SysAssets} assets Assets object
     * 
     * @returns {Promise<void>} Command response
     */
    commandErrorResponse: async (interaction, assets) => {
        if (interaction && assets) {
            try {
                if (interaction.isChatInputCommand()) {
                    if (interaction.replied) {
                        await interaction.followUp({
                            "content": null,
                            "embeds": [
                                {
                                    "title": `${assets.icons.xmark} Command Error`,
                                    "description": `Due to an internal error, this command could not be fetched, or has not been properly executed. We apologize.`,
                                    "color": assets.colors.secondary,
                                },
                            ],
                        });

                        return;
                    } else {
                        await interaction.reply({
                            "content": null,
                            "embeds": [
                                {
                                    "title": `${assets.icons.xmark} Command Error`,
                                    "description": `Due to an internal error, this command could not be fetched, or has not been properly executed. We apologize.`,
                                    "color": assets.colors.secondary,
                                },
                            ],
                        });

                        return;
                    };
                } else {
                    return null;
                };
            } catch (err) {
                return console.error(err);
            };
        } else {
            return null;
        };
    },

    /**
     * Registers a server to the system's database and/or cache
     * 
     * @param {SaveDataClient} db Class of the bot's database
     * @param {string} server ID of the server
     * 
     * @returns {Promise<Config | void>} SaveDataClient operation
     */
    reviseGuild: async (db, server) => {
        if (server) {
            try {
                console.log(`Step 1 Initializing entry scan for ${server}`);

                /**
                 * 
                 * @param {string} server 
                 * 
                 * @returns {Config | null}
                 */
                const check = (server) => {
                    let result = null;

                    const guild = cacheModule.fetch(server);

                    if (guild) {
                        result = guild;
                    };

                    return result;
                };

                let thisGuild = check(server);

                console.log(`Step 2 Check if server exists in cache.`);
                if (thisGuild) {
                    console.log(`Step 3 Server exists in cache, data object preserved.`);
                    console.debug(`Server ${thisGuild.server} found!`);
                } else {
                    try {
                        console.log(`Step 3 Server doesn't exist in cache, creating new save data object.`);
                        console.debug(`Connecting to database...`);

                        const dbClient = new Mongo.MongoClient(db.mongo_uri);

                        const database = dbClient.db("Bloqbit");
                        const collection = database.collection("servers");

                        const foundServer = await collection.findOne({ server: server });

                        console.debug(`Checking if save data for server ${server} exists...`);

                        console.log(`Step 4 Check if server exists in database.`);
                        if (foundServer) {
                            console.log(`Step 5 Server exists in database, copying save data.`);
                            console.debug(`Data for server ${server} exists, duplicating save...`);

                            thisGuild = resolve.deepCopySettings(foundServer);

                            console.debug(`Data successfully saved.`);
                        } else {
                            console.log(`Step 5 Server doesn't exist in database, creating new save.`);
                            console.debug(`Data for server ${server} does not exist, assigning new default settings...`);

                            const defaultSettings = new Config({}).toObject();
                            defaultSettings.server = server;

                            thisGuild = defaultSettings;
                            await collection.insertOne(thisGuild);

                            console.debug(`Data successfully saved.`);
                        };
                    } catch (err) {
                        console.error(err);
                    };

                    console.log(`Step 6 Updating cache.`);

                    const final = cacheModule.update(thisGuild, db);
                    return final;
                };
            } catch (err) {
                console.error(err);
                return new Config();
            };
        } else {
            return new Config();
        };
    },

    /**
     * Send a log to the server's configured logs channel
     * 
     * @param {BloqbitClient} bot 
     * @param {Config} system 
     * @param {Discord.APIEmbed} emb 
     * @param {Discord.Guild} guild 
     * 
     * @returns {Promise<void>}
     */
    sendLog: async (bot, system, emb, guild) => {
        const chnl = await guild.channels?.fetch(system.logs.channel);

        /**
         * Get the webhook for the logs channel, or create one if there isn't one
         * 
         * @param {BloqbitClient} bot
         * @param {Config} system 
         * @param {SaveDataClient} db 
         * @param {Discord.TextChannel} chnl
         * 
         * @returns {Promise<Discord.WebhookClient | void>}
         */
        const checkLogsWebhook = async (bot, system, db, chnl) => {
            /**
            * @type {Discord.WebhookClient}
            */
            let webClient;

            if (system.logs.webhook) {
                webClient = new Discord.WebhookClient({ "url": system.logs.webhook });

                console.debug(`Found logs webhook for channel #${chnl.name} (${chnl.id})`);
            } else {
                console.debug(`Logs webhook for channel #${chnl.name} (${chnl.id}) not found, creating...`);

                const newWeb = await chnl.createWebhook({
                    "name": "Bloqbit",
                    "avatar": bot.client.user?.displayAvatarURL({
                        "size": 1024,
                        "extension": "jpg",
                        "forceStatic": true,
                    }),
                    "reason": `Webhooks enabled for logs, webhook not found. Creating...`,
                });

                system.logs.webhook = newWeb.url;
                await cacheModule.update(system, db);

                webClient = new Discord.WebhookClient({ "url": system.logs.webhook });

                console.debug(`Created logs webhook for channel #${chnl.name} (${chnl.id}) and updated save data`);
            };

            return webClient;
        };

        if (chnl.type === Discord.ChannelType.GuildText) {
            if (system.logs.webhookEnabled) {
                const webClient = await checkLogsWebhook(bot, system, bot.db, chnl);

                if (webClient) {
                    await webClient.send({
                        "content": "",
                        "embeds": [emb],
                    });
                } else {
                    console.error(`Failed to create logs webhook for guild '${guild?.name}' (${guild?.id})`)
                };
            } else {
                await chnl.send({
                    "content": "",
                    "embeds": [emb],
                });
            };
        } else {
            console.error(`Logs channel #${chnl.name} (${chnl.id}) of guild ${guild.name} (${guild.id}) is not correct type`);
        };
    },
};