import SysAssets from '../../assets.json' with { type: 'json' };
import { SaveDataClient, Config } from '../../classes.mjs';
import { ApplicationIntegrationType, ChatInputCommandInteraction, InteractionContextType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v10';

export default {
    premium: true,
    data: new SlashCommandBuilder()
        .setName("force-ban")
        .setDescription("Ban a user outside of the server using their ID.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .setNSFW(false)
        .addStringOption((o) => o
            .setName("user")
            .setDescription("ID of user to ban.")
            .setRequired(true))
        .addStringOption((o) => o
            .setName("reason")
            .setDescription("Reason for ban.")
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
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
        const banreason = interaction.options?.getString("reason") || "";
        const User = interaction.options?.getString("user") || "";
        const Member = interaction.guild?.members?.cache.get(User);

        if (Member?.permissions.has([PermissionFlagsBits.BanMembers])) {
            await interaction.reply({
                "content": "",
                "embeds": [
                    {
                        "description": `${assets.icons.xmark} You cannot ban another moderator.`,
                        "color": assets.colors.primary,
                    },
                ],
                "ephemeral": true,
            });
        };

        let bannedUser = null;

        try {
            bannedUser = await interaction.guild?.members?.ban(User, {
                deleteMessageSeconds: 7 * 86400,
                reason: `${interaction.user?.username} Ban - ${banreason}`
            });
        } catch (err) {
            await interaction.reply({
                "content": `> ${assets.icons.xmark} **${interaction.user?.username}** - Invalid ID.`,
                "ephemeral": true,
            });

            console.error(err);

            return;
        } finally {
            if (bannedUser) {
                await interaction.reply({
                    "content": "",
                    "embeds": [
                        {
                            "author": {
                                "name": `${interaction.user?.username}`,
                                "icon_url": `${interaction.user?.displayAvatarURL({ "forceStatic": false, size: 1024 })}`
                            },
                            "title": `${assets.icons.noentry} User Banned`,
                            "color": assets.colors.primary,
                            "fields": [
                                {
                                    "name": "User",
                                    "value": `**${bannedUser?.username}**`,
                                    "inline": true,
                                },
                                {
                                    "name": "Moderator",
                                    "value": `**${interaction.user?.username}**`,
                                    "inline": true,
                                },
                                {
                                    "name": "Reason",
                                    "value": `${banreason}`,
                                    "inline": false,
                                },
                            ],
                        },
                    ],
                });
            };

            return;
        };
    },
};