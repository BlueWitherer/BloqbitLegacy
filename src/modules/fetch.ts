import { SaveDataClient, Config } from '../classes.js';

import cacheModule from '../cache.mjs';

import {
    ChannelType,
    Guild,
    Interaction,
    Message,
    TextChannel,
    WebhookClient,
    APIEmbed,
    Client,
} from 'discord.js';

import SysAssets from '../assets.json' with { type: 'json' };

export default {
    /**
     * Returns the URL of the first image found in a message.
     */
    ifImage: (msg: Message): string | undefined => {
        const attachment = msg.attachments?.first();
        return attachment?.url;
    },

    /**
     * Returns the proxy URL of the first image found in a message.
     */
    ifProxyImage: (msg: Message): string | undefined => {
        const attachment = msg.attachments?.first();
        return attachment?.proxyURL;
    },

    /**
     * Fetches the configuration object of the server.
     */
    fetchGuild: async (server: string, db: SaveDataClient): Promise<Config | void> => {
        if (server && db) {
            try {
                return await cacheModule.fetch(server, db);
            } catch (err) {
                console.trace(err);
                return;
            };
        } else {
            console.error(`Server or database not found`);
            return;
        };
    },

    /**
     * Handles errors when the server isn't registered in the database.
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
                console.trace(err);
            };

            return;
        } else {
            console.error(`Command error response not sent, interaction type is not a command`);
        };

        return;
    },

    /**
     * Sends a response when a server owner isn't a subscriber.
     */
    noPremiumResponse: async (interaction: Interaction, assets: typeof SysAssets): Promise<void> => {
        if (interaction.isChatInputCommand()) {
            try {
                await interaction.reply({
                    embeds: [
                        {
                            title: `${assets.icons.xmark} Server not Sponsored`,
                            description: `This is a sponsors-only command. The server owner must be a sponsor of Bloqbit for anyone to use this.`,
                            color: assets.colors.secondary,
                        },
                    ],
                    ephemeral: true,
                });
            } catch (err) {
                console.trace(err);
            };
        } else {
            console.error(`Command error response not sent, interaction type is not a command`);
        };

        return;
    },

    /**
     * Sends a generic command error response.
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
                console.trace(err);
            };
        } else {
            console.error(`Command error response not sent, interaction type is not a command`);
        };

        return;
    },

    /**
     * Sends a log to the server's configured logs channel.
     */
    sendLog: async (client: Client, system: Config, db: SaveDataClient, emb: APIEmbed, guild: Guild): Promise<void> => {
        const channel = await guild.channels?.fetch(system.logs.channel);

        const checkLogsWebhook = async (
            client: Client,
            system: Config,
            db: SaveDataClient,
            channel: TextChannel
        ): Promise<WebhookClient | undefined> => {
            let webhookClient: WebhookClient;

            if (system.logs.webhook) {
                webhookClient = new WebhookClient({ url: system.logs.webhook });
                console.debug(`Found logs webhook for channel #${channel.name} (${channel.id})`);
            } else {
                console.debug(`Logs webhook for channel #${channel.name} (${channel.id}) not found, creating...`);

                const newWebhook = await channel.createWebhook({
                    name: "Bloqbit",
                    avatar: client.user?.displayAvatarURL({
                        size: 1024,
                        extension: "jpg",
                        forceStatic: true,
                    }),
                    reason: `Webhooks enabled for logs, webhook not found. Creating...`,
                });

                system.logs.webhook = newWebhook.url;
                await cacheModule.update(system, db);

                webhookClient = new WebhookClient({ url: system.logs.webhook });
                console.debug(`Created logs webhook for channel #${channel.name} (${channel.id}) and updated save data`);
            };

            return webhookClient;
        };

        if (channel?.type === ChannelType.GuildText) {
            if (system.logs.webhookEnabled) {
                const webhookClient = await checkLogsWebhook(client, system, db, channel as TextChannel);

                if (webhookClient) {
                    await webhookClient.send({ embeds: [emb] });
                } else {
                    console.error(`Failed to create logs webhook for guild '${guild.name}' (${guild.id})`);
                }
            } else {
                await channel.send({ embeds: [emb] });
            };
        } else {
            console.error(`Logs channel not found or incorrect type for guild ${guild.name} (${guild.id})`);
        };

        return;
    },
};