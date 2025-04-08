import SysAssets from '../../assets.json' with { type: 'json' };
import { SaveDataClient, Config } from '../../classes.mjs';
import { ApplicationIntegrationType, ChatInputCommandInteraction, InteractionContextType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v10';

export default {
    premium: true,
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Clear amount of messages in channel.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .setNSFW(false)
        .addNumberOption((n) => n
            .setName("amount")
            .setDescription("Number of messages to clear.")
            .setMinValue(2)
            .setMaxValue(100)
            .setRequired(true))
        .addUserOption((u) => u
            .setName("user")
            .setDescription("User whose messages to clear.")
            .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction The interaction for the slash command.
     * @param {typeof SysAssets} assets The configuration of the client's visual assets.
     * @param {Config} system The settings model for the bot's configuration.
     * @param {SaveDataClient} db The database information.
     * 
     * @returns {Promise<void>}
     */
    execute: async (interaction, assets, system, db) => {
        const amount = interaction.options?.getNumber("amount") || 0;
        const user = interaction.options?.getUser("user");

        const botMember = interaction.guild?.members.cache.get(interaction.client.user?.id);

        if (!user && botMember?.permissions.has("ManageMessages")) {
            const msgs = await interaction.channel?.messages.fetch({
                "limit": amount,
            });

            msgs?.forEach(async (m) => {
                await m.delete();
            });

            await interaction.reply({
                "content": "",
                "embeds": [
                    {
                        "author": {
                            "name": interaction.user?.username,
                            "icon_url": interaction.user?.displayAvatarURL({ "forceStatic": false, }),
                        },
                        "title": `${assets.icons.check} Messages Cleared`,
                        "color": assets.colors.primary,
                        "fields": [
                            {
                                "name": "Amount",
                                "value": `${amount}`,
                                "inline": true,
                            },
                            {
                                "name": "Moderator",
                                "value": `<@!${interaction.user?.id}>`,
                                "inline": true,
                            },
                        ],
                    },
                ],
            });

            setTimeout(async () => {
                await interaction.deleteReply();
            }, 2500);

            return;
        } else if (user) {
            const msgs = [];

            (await interaction.channel?.messages?.fetch({ limit: 200 }))?.filter((m) => m.author?.id === user.id).forEach((mg) => {
                if (msgs.length >= amount) {
                    msgs;
                };
            });

            await interaction.reply({
                "content": "",
                "embeds": [
                    {
                        "author": {
                            "name": interaction.user?.username,
                            "icon_url": interaction.user?.displayAvatarURL({ "forceStatic": false, }),
                        },
                        "title": `${assets.icons.check} Messages Cleared`,
                        "color": assets.colors.primary,
                        "fields": [
                            {
                                "name": "Amount",
                                "value": `${amount}`,
                                "inline": true,
                            },
                            {
                                "name": "Moderator",
                                "value": `<@!${interaction.user?.id}>`,
                                "inline": true,
                            },
                            {
                                "name": "User",
                                "value": `<@!${user.id}>`,
                                "inline": true,
                            },
                        ],
                    },
                ],
            });

            setTimeout(async () => {
                await interaction.deleteReply();
            }, 3000);

            return;
        };
    },
};