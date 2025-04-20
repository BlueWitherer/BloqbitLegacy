import { Command } from '../../classes.mjs';
import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export default new Command(
    new SlashCommandBuilder()
        .setName("user-info")
        .setDescription("View information about a user.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .setNSFW(false)
        .addUserOption((u) => u
            .setName("user")
            .setDescription("The user to check.")
            .setRequired(false)),
    async (interaction, assets, system, db) => {
        const Member = interaction.options?.getMember("user");

        let MemberPermissions = interaction.member?.permissions?.toArray({ checkAdmin: true, checkOwner: true }).join('` | `');

        if (!MemberPermissions) MemberPermissions = 'None'

        let joinedAt = Math.floor(Member.joinedTimestamp / 1000);
        let createdAt = Math.floor(Member.user?.createdTimestamp / 1000);

        if (Member) {
            if (Member.user?.bot) {
                let UserPermissions = Member.permissions?.toArray().join('` | `');

                if (!UserPermissions) UserPermissions = 'None'

                await interaction.reply({
                    "embeds": [{
                        "author": {
                            "name": `${interaction.user?.username}`,
                            "icon_url": `${interaction.user?.displayAvatarURL({ forceStatic: false })}`,
                        },
                        "title": `${assets.icons.info} ${Member.user?.username}`,
                        "color": `${assets.colors.primary}`,
                        "thumbnail": {
                            "url": `${Member.user?.displayAvatarURL({ forceStatic: false })}`,
                        },
                        "fields": [
                            {
                                "name": "Member",
                                "value": `${Member}`,
                                "inline": true,
                            },
                            {
                                "name": "Username",
                                "value": `${Member.user?.username}`,
                                "inline": true,
                            },
                            {
                                "name": "User ID",
                                "value": `${Member.user?.id}`,
                                "inline": true,
                            },
                            {
                                "name": "Account Created",
                                "value": `<t:${createdAt}:F> • <t:${createdAt}:R>`,
                                "inline": true,
                            },
                            {
                                "name": "Joined Server",
                                "value": `<t:${joinedAt}:F> • <t:${joinedAt}:R>`,
                                "inline": true,
                            },
                            {
                                "name": `Roles [${Member.roles?.cache.size}]`,
                                "value": `${Member.roles?.cache.filter(r => r.id !== interaction.guild?.id).map(r => `${r}`).join(' | ')}`,
                                "inline": false,
                            },
                            {
                                "name": "Server Permissions",
                                "value": `\`${UserPermissions}\``,
                                "inline": false,
                            },
                        ],
                    },
                    ],
                });

                return;
            } else {
                let UserPermissions = Member.permissions.toArray({ checkAdmin: true, checkOwner: true }).join('` | `');

                if (!UserPermissions) UserPermissions = 'None';

                await interaction.reply({
                    "content": null,
                    "embeds": [
                        {
                            "title": `${assets.icons.info} ${Member.user?.username}`,
                            "color": `${assets.colors.primary}`,
                            "thumbnail": {
                                "url": `${Member.user?.displayAvatarURL({ forceStatic: false })}`,
                            },
                            "author": {
                                "name": `${interaction.user?.username}`,
                                "icon_url": `${interaction.user?.displayAvatarURL({ forceStatic: false })}`,
                            },
                            "fields": [
                                {
                                    "name": "Member",
                                    "value": `${Member}`,
                                    "inline": true,
                                },
                                {
                                    "name": "Username",
                                    "value": `${Member.user?.username}`,
                                    "inline": true,
                                },
                                {
                                    "name": "User ID",
                                    "value": `${Member.user?.id}`,
                                    "inline": true,
                                },
                                {
                                    "name": "Account Created",
                                    "value": `<t:${createdAt}:F> • <t:${createdAt}:R>`,
                                    "inline": true,
                                },
                                {
                                    "name": "Joined Server",
                                    "value": `<t:${joinedAt}:F> • <t:${joinedAt}:R>`,
                                    "inline": true,
                                },
                                {
                                    "name": `Roles [${Member.roles?.cache.size}]`,
                                    "value": `${Member.roles?.cache.filter(r => r.id !== interaction.guild?.id).map(r => `${r}`).join(' | ')}`,
                                    "inline": false,
                                },
                                {
                                    "name": "Server Permissions",
                                    "value": `\`${UserPermissions}\``,
                                    "inline": false,
                                },
                            ],
                        },
                    ],
                });

                return;
            };
        } else {
            let joinedAtU = Math.floor(interaction.member?.joinedTimestamp / 1000);
            let createdAtU = Math.floor(interaction.user?.createdTimestamp / 1000);

            await interaction.reply({
                "content": null,
                "embeds": [
                    {
                        "title": `${assets.icons.info} ${interaction.user?.username}`,
                        "color": `${assets.colors.primary}`,
                        "thumbnail": {
                            "url": `${interaction.user?.displayAvatarURL({ forceStatic: false })}`,
                        },
                        "author": {
                            "name": `${interaction.user?.username}`,
                            "icon_url": `${interaction.user?.displayAvatarURL({ forceStatic: false })}`,
                        },
                        "fields": [
                            {
                                "name": "Member",
                                "value": `${interaction.member}`,
                                "inline": true,
                            },
                            {
                                "name": "Username",
                                "value": `${interaction.user?.username}`,
                                "inline": true,
                            },
                            {
                                "name": "User ID",
                                "value": `${interaction.user?.id}`,
                                "inline": true,
                            },
                            {
                                "name": "Account Created",
                                "value": `<t:${createdAtU}:F> • <t:${createdAtU}:R>`,
                                "inline": true,
                            },
                            {
                                "name": "Joined Server",
                                "value": `<t:${joinedAtU}:F> • <t:${joinedAtU}:R>`,
                                "inline": true,
                            },
                            {
                                "name": `Roles [${interaction.member.roles?.cache.size}]`,
                                "value": `${interaction.member.roles?.cache.filter(r => r.id !== interaction.guild?.id).map(r => `${r}`).join(' | ')}`,
                                "inline": false,
                            },
                            {
                                "name": "Server Permissions",
                                "value": `\`${MemberPermissions}\``,
                                "inline": false,
                            },
                        ],
                    },
                ],
            });
        };

        return;
    });