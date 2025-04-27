import { Command } from '../../classes.js';
import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v10';

export default new Command(
    new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban a user.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .setNSFW(false)
        .addUserOption((o) => o
            .setName("user")
            .setDescription("User to ban.")
            .setRequired(true))
        .addStringOption((o) => o
            .setName("reason")
            .setDescription("Reason for ban.")
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async (interaction, assets, system, db) => {
        const banreason = interaction.options?.getString("reason");

        const User = interaction.options?.getUser("user");
        const Member = interaction.options?.getMember("user");

        if (Member && typeof Member.permissions !== 'string' && Member.permissions?.has(PermissionFlagsBits.BanMembers)) {
            await interaction.reply({
                "content": "",
                "embeds": [
                    {
                        "description": `${assets.icons.xmark} You cannot ban another moderator`,
                        "color": assets.colors.primary,
                    },
                ],
                "flags": [
                    "Ephemeral",
                ],
            });
        };

        try {
            await interaction.guild?.members?.ban(User?.id ?? '', {
                deleteMessageSeconds: 7 * 86400,
                reason: `${interaction.user?.username} Ban - ${banreason}`
            }).then(async () => {
                await interaction.reply({
                    "content": "",
                    "embeds": [
                        {
                            "author": {
                                "name": `${interaction.user?.username}`,
                                "icon_url": `${interaction.user?.displayAvatarURL({ "forceStatic": false, size: 64 })}`
                            },
                            "title": `${assets.icons.noentry} User Banned`,
                            "color": assets.colors.primary,
                            "fields": [
                                {
                                    "name": "User",
                                    "value": `**${User?.username}**`,
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
            }).then(async () => {
                await User?.send({
                    "content": "",
                    "embeds": [
                        {
                            "author": {
                                "name": `${User.username}`,
                                "icon_url": `${User.displayAvatarURL({ "forceStatic": false, size: 64 })}`
                            },
                            "title": `${assets.icons.noentry} Banned`,
                            "description": `You were __banned__ from **${interaction.guild?.name}**`,
                            "color": assets.colors.primary,
                            "fields": [
                                {
                                    "name": `Reason`,
                                    "value": `${banreason}`,
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
                });
            });
        } catch (err) {
            await interaction.reply({
                "content": `> ${assets.icons.xmark} **${interaction.user?.username}** - Invalid user`,
                "flags": [
                    "Ephemeral",
                ],
            });

            console.error(err);

            return;
        } finally {
            if (system.logs.enabled && system.logs.actions.moderator) {
                const logChannel = await interaction.guild?.channels?.fetch(system.logs.channel);
                const date = Math.floor(Date.now() / 1000);

                if (logChannel?.isTextBased()) {
                    await logChannel.send({
                        "content": "",
                        "embeds": [
                            {
                                "author": {
                                    "name": interaction.user?.username,
                                    "icon_url": interaction.user?.displayAvatarURL({ "forceStatic": false, "size": 128 }),
                                },
                                "description": `**${interaction.user?.username}** has taken a moderation action on \`${User?.username}\``,
                                "color": assets.colors.tertiary,
                                "fields": [
                                    {
                                        "name": "Type",
                                        "value": `Ban`,
                                        "inline": true,
                                    },
                                    {
                                        "name": "Reason",
                                        "value": `${banreason}`,
                                        "inline": true,
                                    },
                                    {
                                        "name": "Action Time",
                                        "value": `<t:${date}:F> • <t:${date}:R>`,
                                        "inline": false,
                                    },
                                ],
                            },
                        ],
                    });
                };
            };

            return;
        };
    });