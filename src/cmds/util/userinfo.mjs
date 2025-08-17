import { Command, log } from "#bloqbit/include";
import { ApplicationIntegrationType, GuildMember, InteractionContextType, PermissionsBitField, Role } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export default new Command(
    new SlashCommandBuilder()
        .setName("user-info")
        .setDescription("View information about a user.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .setNSFW(false)
        .addUserOption((o) => o
            .setName("user")
            .setDescription("The user to check.")
            .setRequired(false)),
    async (interaction, assets, system, db) => {
        const Member = interaction.options?.getMember("user");

        let MemberPermissions = interaction.member?.permissions instanceof PermissionsBitField
            ? interaction.member?.permissions.toArray().join('` | `')
            : 'None';

        if (!MemberPermissions) MemberPermissions = 'None';

        if (Member) {
            const joinedAt = Member instanceof GuildMember && Member.joinedTimestamp
                ? Math.floor(Member.joinedTimestamp / 1000)
                : null;

            const createdAt = Member instanceof GuildMember && Member.user?.createdTimestamp
                ? Math.floor(Member.user.createdTimestamp / 1000)
                : null;

            if (Member instanceof GuildMember && Member.user?.bot) {
                let UserPermissions = Member.permissions?.toArray().join('` | `');

                if (!UserPermissions) UserPermissions = 'None';

                await interaction.reply({
                    "embeds": [{
                        "author": {
                            "name": `${interaction.user?.username}`,
                            "icon_url": `${interaction.user?.displayAvatarURL({ forceStatic: false })}`,
                        },
                        "title": `${assets.icons.info} ${Member instanceof GuildMember ? Member.user?.username : 'Unknown User'}`,
                        "color": assets.colors.primary,
                        "thumbnail": {
                            "url": `${Member instanceof GuildMember ? Member.user?.displayAvatarURL({ forceStatic: false }) : ''}`,
                        },
                        "fields": [
                            {
                                "name": "Member",
                                "value": `${Member}`,
                                "inline": true,
                            },
                            {
                                "name": "Username",
                                "value": `${Member instanceof GuildMember ? Member.user?.username : 'Unknown User'}`,
                                "inline": true,
                            },
                            {
                                "name": "User ID",
                                "value": `${Member instanceof GuildMember ? Member.user?.id : 'Unknown ID'}`,
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
                                "name": `Roles [${Array.isArray(Member.roles) ? Member.roles.length : Member.roles?.cache?.size}]`,
                                "value": `${Member.roles?.cache?.filter(r => r.id !== interaction.guild?.id).map(r => `${r}`).join(' | ')}`,
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
                let UserPermissions = Member.permissions instanceof PermissionsBitField
                    ? Member.permissions.toArray().join('` | `')
                    : 'None';

                if (!UserPermissions) UserPermissions = 'None';

                await interaction.reply({
                    "content": "",
                    "embeds": [
                        {
                            "title": `${assets.icons.info} ${Member instanceof GuildMember ? Member.user?.username : 'Unknown User'}`,
                            "color": assets.colors.primary,
                            "thumbnail": {
                                "url": `${Member instanceof GuildMember ? Member.user?.displayAvatarURL({ forceStatic: false }) : ''}`,
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
                                    "value": `${Member instanceof GuildMember ? Member.user?.username : 'Unknown User'}`,
                                    "inline": true,
                                },
                                {
                                    "name": "User ID",
                                    "value": `${Member instanceof GuildMember ? Member.user?.id : 'Unknown ID'}`,
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
                                    "name": `Roles [${Array.isArray(Member.roles) ? Member.roles.length : Member.roles?.cache?.size}]`,
                                    "value": `${Array.isArray(Member.roles)
                                        ? Member.roles.join(' | ')
                                        : Member.roles?.cache?.filter((/** @type {Role} */ r) => r.id !== interaction.guild?.id).map((/** @type {Role} */ r) => `${r}`).join(' | ')}`,
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
            const joinedAtU = interaction.member instanceof GuildMember && interaction.member?.joinedTimestamp
                ? Math.floor(interaction.member?.joinedTimestamp / 1000)
                : null;
            const createdAtU = Math.floor(interaction.user?.createdTimestamp / 1000);

            await interaction.reply({
                "content": "",
                "embeds": [
                    {
                        "title": `${assets.icons.info} ${interaction.user?.username}`,
                        "color": assets.colors.primary,
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
                                "name": `Roles [${Array.isArray(interaction.member?.roles) ? interaction.member?.roles.length : interaction.member?.roles?.cache?.size}]`,
                                "value": `${Array.isArray(interaction.member?.roles)
                                    ? interaction.member?.roles.join(' | ')
                                    : interaction.member?.roles?.cache?.filter((/** @type { Role } */ r) => r.id !== interaction.guild?.id).map((/** @type {Role} */ r) => `${r}`).join(' | ')
                                    }`,
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
    },
);