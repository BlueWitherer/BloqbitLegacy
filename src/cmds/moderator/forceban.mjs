import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { EmbedBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { Command } from '../../classes.js';
import fetch from 'modules/fetch.js';

export default new Command(
    new SlashCommandBuilder()
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
    async (interaction, assets, system, db) => {
        const User = interaction.options?.getString("user", true);
        const Member = interaction.guild?.members?.cache?.get(User);
        const Reason = interaction.options?.getString("reason", false) ?? 'Unspecified';

        if (Member?.permissions.has([PermissionFlagsBits.BanMembers])) {
            await interaction.reply({
                "content": "",
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
        };

        try {
            const bannedUser = await interaction.guild?.members?.ban(User, {
                deleteMessageSeconds: 7 * 86400,
                reason: `${interaction.user?.username} Ban - ${Reason}`
            });

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
                                "value": `**${typeof bannedUser === 'object' && 'user' in bannedUser ? bannedUser.user?.username : bannedUser}**`,
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
        } catch (err) {
            console.trace(err);

            await interaction.reply({
                "content": `> ${assets.icons.xmark} **${interaction.user?.username}** - Invalid ID`,
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
                    "title": `${assets.icons.exclamation} Moderator`,
                    "description": `**${interaction.user?.username}** has taken a moderation action on \`${User}\``,
                    "color": assets.colors.tertiary,
                    "fields": [
                        {
                            "name": "Type",
                            "value": `Force-ban`,
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
                console.warn(`Logs for moderator actions not enabled in guild ${interaction.guild?.id}.`);
            };
        };
    });