import { Command } from '../../classes.js';
import { ApplicationIntegrationType, InteractionContextType, PermissionsBitField } from 'discord.js';
import { EmbedBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import fetch from '../../modules/fetch.js';

export default new Command(
    new SlashCommandBuilder()
        .setName("soft-ban")
        .setDescription("Softban a user.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .setNSFW(false)
        .addUserOption(option => option.setName("user").setDescription("User to softban.").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("Reason for softban.").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async (interaction, assets, system, db) => {
        const Reason = interaction.options?.getString("reason", false) ?? 'Unspecified';
        const User = interaction.options?.getUser("user", true);
        const Member = interaction.options?.getMember("user");

        if (Member?.permissions instanceof PermissionsBitField && Member.permissions.has(PermissionFlagsBits.BanMembers)) {
            await interaction.reply({
                "content": "",
                "embeds": [
                    {
                        "description": `${assets.icons.xmark} You cannot softban another moderator`,
                        "color": assets.colors.secondary,
                    },
                ],
                "flags": [
                    "Ephemeral",
                ],
            });
            return;
        }

        try {
            const banned = await interaction.guild?.members?.ban(User.id, {
                deleteMessageSeconds: 7 * 86400,
                reason: `${interaction.user?.username} Softban - ${Reason}`,
            });

            if (banned) await interaction.guild?.members?.unban(User.id, `${interaction.user?.username} Softban - ${Reason}`);

            await interaction.reply({
                "content": "",
                "embeds": [
                    {
                        "author": {
                            "name": `${interaction.user?.username}`,
                            "icon_url": `${interaction.user?.displayAvatarURL({ "forceStatic": false, size: 64 })}`,
                        },
                        "title": `${assets.icons.noentry} User Softbanned`,
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
                                "value": `${Reason}`,
                                "inline": false,
                            },
                        ],
                    },
                ],
            });

            try {
                await User.send({
                    "content": "",
                    "embeds": [
                        {
                            "author": {
                                "name": `${User.username}`,
                                "icon_url": `${User.displayAvatarURL({ "forceStatic": false, size: 64 })}`,
                            },
                            "title": `${assets.icons.noentry} Soft-banned`,
                            "description": `You were __soft-banned__ from **${interaction.guild?.name}**`,
                            "color": assets.colors.primary,
                            "fields": [
                                {
                                    "name": `Reason`,
                                    "value": `${Reason}`,
                                    "inline": false,
                                },
                                {
                                    "name": `Reviewed`,
                                    "value": `<t:${Math.floor(Date.now() / 1000)}:F>`,
                                    "inline": false,
                                },
                                {
                                    "name": `Appeal`,
                                    "value": `Rejoin whenever you feel most comfortable`,
                                    "inline": true,
                                },
                            ],
                        },
                    ],
                });
            } catch (err) {
                console.warn(`Failed to send softban DM to user ${User.username} (${User.id}): ${err}`);
            };
        } catch (err) {
            console.trace(err);

            await interaction.reply({
                "content": `> ${assets.icons.xmark} **${interaction.user?.username}** - An error occurred`,
                "flags": [
                    "Ephemeral",
                ],
            });

            return;
        } finally {
            if (system.logs.enabled && system.logs.actions.moderator) {
                const date = Math.floor(Date.now() / 1000);

                const emb = new EmbedBuilder({
                    "author": {
                        "name": interaction.user?.username,
                        "icon_url": interaction.user?.displayAvatarURL({ "forceStatic": false, size: 128 }),
                    },
                    "title": `${assets.icons.exclamation} Moderator`,
                    "description": `**${interaction.user?.username}** has taken a moderation action on \`${User.username}\``,
                    "color": assets.colors.tertiary,
                    "fields": [
                        {
                            "name": "Type",
                            "value": `Softban`,
                            "inline": true,
                        },
                        {
                            "name": "Reason",
                            "value": `${Reason}`,
                            "inline": true,
                        },
                        {
                            "name": "Time",
                            "value": `<t:${date}:F> • <t:${date}:R>`,
                            "inline": false,
                        },
                    ],
                }).data;

                if (interaction.guild) await fetch.sendLog(interaction.client, system, db, emb, interaction.guild);
            } else {
                console.warn(`Logs for moderator actions not enabled in guild ${interaction.guild?.id}`);
            };
        };
    },
);