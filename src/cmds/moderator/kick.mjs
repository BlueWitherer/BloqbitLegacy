import { ApplicationIntegrationType, InteractionContextType, PermissionsBitField } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { Command } from '../../classes.js';

export default new Command(
    new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick a user.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .setNSFW(false)
        .addUserOption((o) => o
            .setName("user")
            .setDescription("User to kick.")
            .setRequired(true))
        .addStringOption((o) => o
            .setName("reason")
            .setDescription("Reason for kick.")
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    async (interaction, assets, system, db) => {
        const kickreason = interaction.options?.getString("reason");
        const User = interaction.options?.getUser("user");
        const Member = interaction.options?.getMember("user");

        if (Member && Member.permissions instanceof PermissionsBitField && Member.permissions.has(PermissionFlagsBits.KickMembers)) {
            await interaction.reply({
                "content": "",
                "embeds": [
                    {
                        "description": `${assets.icons.xmark} You cannot kick another moderator`,
                        "color": assets.colors.primary,
                    },
                ],
                "flags": [
                    "Ephemeral",
                ],
            });
        };

        if (User) await interaction.guild?.members?.kick(User.id, `${interaction.user?.username} Kick - ${kickreason}`).catch(async (err) => {
            await interaction.reply({
                "content": `> ${assets.icons.xmark} **${interaction.user?.username}** - An error occurred`,
                "flags": [
                    "Ephemeral",
                ],
            });
            console.error(err);
        }).then(async () => {
            if (User) await interaction.reply({
                "content": "",
                "embeds": [
                    {
                        "author": {
                            "name": `${interaction.user?.username}`,
                            "icon_url": `${interaction.user?.displayAvatarURL({ "forceStatic": false, size: 64 })}`
                        },
                        "title": `${assets.icons.noentry} User Kicked`,
                        "color": assets.colors.primary,
                        "fields": [
                            {
                                "name": "User",
                                "value": `**${User.username}**`,
                                "inline": true,
                            },
                            {
                                "name": "Moderator",
                                "value": `**${interaction.user?.username}**`,
                                "inline": true,
                            },
                            {
                                "name": "Reason",
                                "value": `${kickreason}`,
                                "inline": false,
                            },
                        ],
                    },
                ],
            });
        }).then(async () => {
            if (User) await User.send({
                "content": "",
                "embeds": [
                    {
                        "author": {
                            "name": `${User.username}`,
                            "icon_url": `${User.displayAvatarURL({ "forceStatic": false, size: 64 })}`
                        },
                        "title": `${assets.icons.noentry} Kicked`,
                        "description": `You were __kicked__ from **${interaction.guild?.name}**`,
                        "color": assets.colors.primary,
                        "fields": [
                            {
                                "name": `Reason`,
                                "value": `${kickreason}`,
                                "inline": false,
                            },
                            {
                                "name": `Reviewed`,
                                "value": `<t:${new Date().getDate() / 1000}:F>`,
                                "inline": false,
                            },
                        ],
                    },
                ],
            }).catch((err) => {
                console.error(err);
                return;
            });
        });
    },
);