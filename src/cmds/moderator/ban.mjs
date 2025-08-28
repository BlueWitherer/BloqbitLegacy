import { Command, log } from "#bloqbit/include.ts";
import { ApplicationIntegrationType, EmbedBuilder, GuildMember, InteractionContextType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import fetch from "#bloqbit/modules/fetch.mjs";

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
        const User = interaction.options?.getUser("user", true);
        const Member = interaction.options?.getMember("user");
        const Reason = interaction.options?.getString("reason", false) ?? 'Unspecified';

        if (Member && typeof Member.permissions !== 'string' && Member.permissions?.has(PermissionFlagsBits.BanMembers)) {
            await interaction.reply({
                "embeds": [
                    {
                        "description": `${assets.icons.xmark} You cannot ban another moderator`,
                        "color": assets.colors.secondary,
                    },
                ],
                "flags": [
                    "Ephemeral",
                ],
            });

            return;
        };

        try {
            const banResult = await interaction.guild?.members?.ban(User.id ?? '', {
                "deleteMessageSeconds": 7 * 86400,
                "reason": `${interaction.user?.username} | Ban - ${Reason}`,
            });

            await interaction.reply({
                "embeds": [
                    {
                        "author": {
                            "name": `${interaction.user?.username}`,
                            "icon_url": `${interaction.user?.displayAvatarURL({ "forceStatic": false, size: 64 })}`,
                        },
                        "title": `${assets.icons.noentry} User Banned`,
                        "color": assets.colors.primary,
                        "fields": [
                            {
                                "name": "User",
                                "value": `**${banResult instanceof GuildMember ? banResult.user?.username : User.username}**`,
                                "inline": true,
                            },
                            {
                                "name": "Moderator",
                                "value": `**${interaction.user?.username}**`,
                                "inline": true,
                            },
                            {
                                "name": "reason",
                                "value": `${Reason}`,
                                "inline": false,
                            },
                        ],
                    },
                ],
            });

            try {
                await User.send({
                    "embeds": [
                        {
                            "author": {
                                "name": `${User.username}`,
                                "icon_url": `${User.displayAvatarURL({ "forceStatic": false, size: 64 })}`,
                            },
                            "title": `${assets.icons.noentry} Banned`,
                            "description": `You were __banned__ from **${interaction.guild?.name}**`,
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
                            ],
                        },
                    ],
                });
            } catch (err) {
                log.trace(err);
            };
        } catch (err) {
            log.trace(err);

            await interaction.reply({
                "content": `> ${assets.icons.xmark} **${interaction.user?.username}** - Invalid user`,
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
                        "icon_url": interaction.user?.displayAvatarURL({ "forceStatic": false, "size": 128 }),
                    },
                    "title": `:exclamation: Moderator`,
                    "description": `**${interaction.user?.username}** has taken a moderation action on \`${User.username}\``,
                    "color": assets.colors.tertiary,
                    "fields": [
                        {
                            "name": "Type",
                            "value": `Ban`,
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
                log.warn(`Logs for moderator actions not enabled in guild ${interaction.guild?.id}.`);
            };
        };
    },
);