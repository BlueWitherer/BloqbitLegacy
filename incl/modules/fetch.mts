import { SaveDataClient, Config, log } from "#bloqbit/include.ts";

import cacheModule from "#bloqbit/database.mjs";

import {
    ChannelType,
    Guild,
    Interaction,
    Message,
    WebhookClient,
    APIEmbed,
    Client,
    ActivityType,
    PresenceStatusData,
    ClientPresence,
    GuildBasedChannel,
} from 'discord.js';

import SysAssets from "#assets" with { type: 'json' };

export default {
    /**
     * Get the uptime formatted as a string.
     * 
     * @param client The Discord client.
     */
    uptime: (client: Client): string => {
        const totalSeconds = Math.floor((client.uptime?.valueOf() || 0) / 1000);

        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
    },

    /**
     * Returns the URL of the first image found in a message.
     */
    ifImage: (msg: Message): string | void => {
        const attachment = msg.attachments?.first();
        return attachment?.url;
    },

    /**
     * Returns the proxy URL of the first image found in a message
     */
    ifProxyImage: (msg: Message): string | void => {
        const attachment = msg.attachments?.first();
        return attachment?.proxyURL;
    },

    /**
     * Fetches the configuration object of the server
     */
    fetchGuild: async (server: string, db: SaveDataClient): Promise<Config | void> => {
        if (server && db) {
            try {
                return await cacheModule.fetch(server, db);
            } catch (err) {
                log.trace(err);
                return;
            };
        } else {
            log.error(`Server or database not found`);
            return;
        };
    },

    /**
     * Handles errors when the server isn't registered in the database
     */
    databaseErrorResponse: async (interaction: Interaction, assets: typeof SysAssets): Promise<void> => {
        if (interaction.isChatInputCommand()) {
            try {
                await interaction.reply({
                    embeds: [
                        {
                            title: `${assets.icons.xmark} Server not registered`,
                            description: `Due to an internal error, this server has not yet been registered in our database. You can fix this by using \`/reload\`.`,
                            color: assets.colors.secondary,
                        },
                    ],
                    ephemeral: true,
                });
            } catch (err) {
                log.trace(err);
            };

            return;
        } else {
            log.error(`Command error response not sent, interaction type is not a command`);
        };

        return;
    },

    /**
     * Sends a generic command error response
     */
    commandErrorResponse: async (interaction: Interaction, assets: typeof SysAssets): Promise<void> => {
        if (interaction.isChatInputCommand()) {
            try {
                const embed = {
                    title: `${assets.icons.xmark} Command Error`,
                    description: `Due to an internal error, this command could not be fetched or executed. We apologize.`,
                    color: assets.colors.secondary,
                };

                if (interaction.replied) {
                    await interaction.followUp({ embeds: [embed] });
                } else {
                    await interaction.reply({ embeds: [embed] });
                };
            } catch (err) {
                log.trace(err);
            };
        } else {
            log.error(`Command error response not sent, interaction type is not a command`);
        };

        return;
    },

    /**
     * Sets the bot's presence status
     */
    setPresence: (client: Client, name: string, state: string, status: PresenceStatusData): ClientPresence | void => {
        try {
            return client.user?.setPresence({
                "activities": [
                    {
                        "name": name,
                        "state": state,
                        "type": ActivityType.Streaming,
                        "url": `https://www.youtube.com/@CubicCommunity/`,
                    }
                ],
                "afk": false,
                "status": status,
            });
        } catch (err) {
            log.trace(err);
            return;
        };
    },

    /**
     * Sends a log to the server's configured logs channel
     */
    sendLog: async (client: Client, system: Config, db: SaveDataClient, emb: APIEmbed, guild: Guild, channelId: string | null = null): Promise<void> => {
        const channel = await guild.channels?.fetch(channelId || system.logs.channel) || await guild.channels?.fetch(system.logs.channel);

        const checkLogsWebhook = async (
            client: Client,
            system: Config,
            db: SaveDataClient,
            channel: GuildBasedChannel
        ): Promise<WebhookClient | void> => {
            let webhookClient: WebhookClient;

            if (channel.type === ChannelType.GuildText) {
                if (system.logs.webhook) {
                    webhookClient = new WebhookClient({ url: system.logs.webhook });
                    log.debug(`Found logs webhook for channel #${channel.name} (${channel.id})`);
                } else {
                    log.debug(`Logs webhook for channel #${channel.name} (${channel.id}) not found, creating...`);

                    const newWebhook = await channel.createWebhook({
                        name: "Bloqbit",
                        avatar: client.user?.displayAvatarURL({
                            size: 1024,
                            extension: "jpg",
                            forceStatic: true,
                        }),
                        reason: `Logs webhook not found, creating...`,
                    });

                    system.logs.webhook = newWebhook.url;
                    await cacheModule.update(system, db);

                    webhookClient = new WebhookClient({ url: system.logs.webhook });
                    log.debug(`Created logs webhook for channel #${channel.name} (${channel.id}) and updated save data`);
                };

                return webhookClient;
            } else {
                log.error(`Logs channel of ID ${channelId || system.logs.channel} is not a text channel, cannot create webhook`);
                return;
            };
        };

        if (channel) {
            if (channel.type === ChannelType.GuildText) {
                if (system.logs.webhookEnabled) {
                    const webhookClient = await checkLogsWebhook(client, system, db, channel);

                    if (webhookClient) {
                        await webhookClient.send({ embeds: [emb], avatarURL: client.user?.displayAvatarURL({ size: 1024, extension: "jpg", forceStatic: true }), username: client.user?.displayName });
                    } else {
                        log.error(`Failed to create logs webhook for channel of ID ${channelId || system.logs.channel} in guild '${guild.name}' (${guild.id})`);
                    };
                } else {
                    await channel.send({ embeds: [emb] });
                };
            } else {
                log.error(`Logs channel of ID ${channelId || system.logs.channel} not found or incorrect type for guild ${guild.name} (${guild.id})`);
            };
        } else {
            log.error(`Logs channel of ID ${channelId || system.logs.channel} not found for guild ${guild.name} (${guild.id})`);
        };

        return;
    },

    /**
     * Removes deleted and duplicated channels from array
     */
    scanChannels: (server: Guild | null, channels: string[]): string[] => {
        const scanned: string[] = [];

        if (server) {
            try {
                log.debug(`Scanning ${channels.length} channels for deletions and duplications...`);

                const seen = new Set<string>();

                for (let i = 0; i < channels.length; i++) {
                    log.debug(`Checking channel of ID ${channels[i]}...`);

                    if (seen.has(channels[i])) {
                        log.warn(`Channel of ID ${channels[i]} was already scanned, skipping duplicate...`);
                    } else if (server.channels?.cache?.get(channels[i])) {
                        log.debug(`Channel of ID ${channels[i]} exists`);

                        scanned.push(channels[i]);
                        seen.add(channels[i]);
                    } else {
                        log.warn(`Channel of ID ${channels[i]} does not exist, skipping from list...`);
                    };
                };

                log.info(`Channel scan complete, ${scanned.length}/${channels.length} channels remain`);
            } catch (err) {
                log.trace(err);
            };
        } else {
            log.error(`Server not provided, skipping channel scans...`);
        };

        return scanned;
    },

    /**
     * Removes deleted and duplicated roles from array
     */
    scanRoles: (server: Guild | null, roles: string[]): string[] => {
        const scanned: string[] = [];

        if (server) {
            try {
                log.debug(`Scanning ${roles.length} roles for deletions and duplications...`);

                const seen = new Set<string>();

                for (let i = 0; i < roles.length; i++) {
                    if (seen.has(roles[i])) {
                        log.warn(`Role of ID ${roles[i]} was already scanned, skipping duplicate...`);
                    } else if (server.roles?.cache?.get(roles[i])) {
                        log.debug(`Role of ID ${roles[i]} exists`);

                        scanned.push(roles[i]);
                        seen.add(roles[i]);
                    } else {
                        log.warn(`Role of ID ${roles[i]} does not exist, skipping from list...`);
                    };
                };
            } catch (err) {
                log.trace(err);
            };
        } else {
            log.error(`Server not provided, skipping role scans...`);
        };

        return scanned;
    },
};