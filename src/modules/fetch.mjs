import cacheModule from '../cache.mjs';

import { SaveDataClient, Config, BloqbitClient } from '../classes.js';

import { ChannelType, Client, GatewayIntentBits, Guild, InteractionType, Message, TextChannel, WebhookClient } from 'discord.js';

import SysAssets from '../assets.json' with { type: 'json' };

export default {
    /**
     * Returns URL of the first image found in a message
     * 
     * @param {Message} msg Message to search for image in
     * 
     * @returns {string | void} Image URL
     */
    ifImage: (msg) => {
        if (msg.attachments?.size > 0) {
            const f = msg.attachments?.first();
            if (f) return f.url;
        } else {
            return;
        };
    },

    /**
     * Returns proxy URL of the first image found in a message
     * 
     * @param {Message} msg Message to search for image in
     * 
     * @returns {string | void} Proxy image URL
     */
    ifProxyImage: (msg) => {
        if (msg.attachments?.size > 0) {
            const f = msg.attachments?.first();
            if (f) return f.proxyURL;
        } else {
            return;
        };
    },

    /**
     * Handles errors with interactions
     * 
     * @param {string} err Error message
     * @param {import('discord.js').Interaction} interaction Command interaction
     * @param {typeof SysAssets} assets Assets object
     * 
     * @returns {Promise<void>} Error log
     */
    interactionError: async (err, interaction, assets) => {
        if (err && interaction) {
            try {
                if (interaction.type === InteractionType.ApplicationCommand) {
                    await interaction.reply({
                        "content": `> ${assets.icons.xmark} **${interaction.user?.username}** - An error occurred`,
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
     * @param {SaveDataClient} db Class of the bot's database
     * 
     * @returns {Promise<Config | void>} Fetched server settings object
     */
    fetchGuild: async (server, db) => {
        if (server) {
            try {
                const res = await cacheModule.fetch(server, db);
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
     * @param {import('discord.js').Interaction} interaction Command interaction
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
                                "description": `Due to an internal error, this server has not yet been registered in our database. You can fix this by using \`/reload\``,
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
     * @param {import('discord.js').Interaction} interaction Command interaction
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
                                "description": `This is a sponsors-only command, the server owner must be a sponsor of Bloqbit for anyone to use this`,
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
     * @param {import('discord.js').Interaction} interaction Command interaction 
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
                            "content": "",
                            "embeds": [
                                {
                                    "title": `${assets.icons.xmark} Command Error`,
                                    "description": `Due to an internal error, this command could not be fetched, or has not been properly executed. We apologize`,
                                    "color": assets.colors.secondary,
                                },
                            ],
                        });

                        return;
                    } else {
                        await interaction.reply({
                            "content": "",
                            "embeds": [
                                {
                                    "title": `${assets.icons.xmark} Command Error`,
                                    "description": `Due to an internal error, this command could not be fetched, or has not been properly executed. We apologize`,
                                    "color": assets.colors.secondary,
                                },
                            ],
                        });

                        return;
                    };
                } else {
                    return;
                };
            } catch (err) {
                return console.error(err);
            };
        } else {
            return;
        };
    },

    /**
     * Send a log to the server's configured logs channel
     * 
     * @param {BloqbitClient} bot 
     * @param {Config} system 
     * @param {import('discord.js').APIEmbed} emb 
     * @param {Guild} guild 
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
         * @param {TextChannel} chnl
         * 
         * @returns {Promise<WebhookClient | void>}
         */
        const checkLogsWebhook = async (bot, system, db, chnl) => {
            /**
            * @type {WebhookClient}
            */
            let webClient;

            if (system.logs.webhook) {
                webClient = new WebhookClient({ "url": system.logs.webhook });

                console.debug(`Found logs webhook for channel #${chnl.name} (${chnl.id})`);
            } else {
                console.debug(`Logs webhook for channel #${chnl.name} (${chnl.id}) not found, creating...`);

                const newWeb = await chnl.createWebhook({
                    "name": "Bloqbit",
                    "avatar": bot.client?.user?.displayAvatarURL({
                        "size": 1024,
                        "extension": "jpg",
                        "forceStatic": true,
                    }),
                    "reason": `Webhooks enabled for logs, webhook not found. Creating...`,
                });

                system.logs.webhook = newWeb.url;
                await cacheModule.update(system, db);

                webClient = new WebhookClient({ "url": system.logs.webhook });

                console.debug(`Created logs webhook for channel #${chnl.name} (${chnl.id}) and updated save data`);
            };

            return webClient;
        };

        if (chnl) {
            if (chnl.type === ChannelType.GuildText) {
                if (system.logs.webhookEnabled) {
                    const webClient = await checkLogsWebhook(bot, system, bot.db, chnl);

                    if (webClient) {
                        await webClient.send({
                            "content": "",
                            "embeds": [emb],
                        });
                    } else {
                        console.error(`Failed to create logs webhook for guild '${guild?.name}' (${guild?.id})`);
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
        } else {
            console.error(`Logs channel not found for guild ${guild.name} (${guild.id})`);
        };
    },
};