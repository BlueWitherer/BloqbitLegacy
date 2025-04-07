import SysAssets from '../../assets.json' with { type: 'json' };
import { SaveData, Config } from '../../classes.mjs';
import { ApplicationIntegrationType, ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export default {
    data: new SlashCommandBuilder()
        .setName("user-info")
        .setDescription("View information about a user.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setNSFW(false)
        .addUserOption((u) => u
            .setName("user")
            .setDescription("The user to check.")
            .setRequired(false)),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction The interaction for the slash command.
     * @param {typeof SysAssets} assets The configuration of the client's visual assets.
     * @param {Config} system The settings model for the bot's configuration.
     * @param {SaveData} db The database information.
     * 
     * @returns {Promise<void>}
     */
    execute: async (interaction, assets, system, db) => {
        const User = interaction.options?.getMember("user");

        const Author = interaction.user;
        const Member = interaction.member;

        let MemberPermissions = interaction.member?.permissions?.toArray({ checkAdmin: true, checkOwner: true }).join('` | `');

        if (!MemberPermissions) MemberPermissions = 'None'

        if (!User) {
            var joinedAtU = Math.floor(interaction.member?.joinedTimestamp / 1000);
            var createdAtU = Math.floor(interaction.user?.createdTimestamp / 1000);

            await interaction.reply({
                "content": null,
                "embeds": [
                    {
                        "title": `${assets.icons.info} | ${interaction.user?.username}`,
                        "color": `${assets.colors.primary}`,
                        "thumbnail": {
                            "url": `${Author.displayAvatarURL({ forceStatic: false })}`,
                        },
                        "author": {
                            "name": `${Author.username}`,
                            "icon_url": `${Author.displayAvatarURL({ forceStatic: false })}`,
                        },
                        "fields": [
                            {
                                "name": "User",
                                "value": `${Author}`,
                                "inline": true,
                            },
                            {
                                "name": "Tag",
                                "value": `${Author.username}`,
                                "inline": true,
                            },
                            {
                                "name": "User ID",
                                "value": `${Author.id}`,
                                "inline": true,
                            },
                            {
                                "name": "Date Created",
                                "value": `<t:${createdAtU}:F> | <t:${createdAtU}:R>`,
                                "inline": true,
                            },
                            {
                                "name": "Date Joined",
                                "value": `<t:${joinedAtU}:F> | <t:${joinedAtU}:R>`,
                                "inline": true,
                            },
                            {
                                "name": `Roles [${Member.roles?.cache.size}]`,
                                "value": `${Member.roles?.cache.filter(r => r.id !== interaction.guild?.id).map(r => `${r}`).join(' | ')}`,
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

        var joinedAt = Math.floor(User.joinedTimestamp / 1000);
        var createdAt = Math.floor(User.user?.createdTimestamp / 1000);

        if (User) {

            let UserPermissions = User.permissions.toArray({ checkAdmin: true, checkOwner: true }).join('` | `');

            if (!UserPermissions) UserPermissions = 'None';

            await interaction.reply({
                "content": null,
                "embeds": [
                    {
                        "title": `${assets.icons.info} | ${User.user?.username}`,
                        "color": `${assets.colors.primary}`,
                        "thumbnail": {
                            "url": `${User.user?.displayAvatarURL({ forceStatic: false })}`,
                        },
                        "author": {
                            "name": `${interaction.user?.username}`,
                            "icon_url": `${interaction.user?.displayAvatarURL({ forceStatic: false })}`,
                        },
                        "fields": [
                            {
                                "name": "User",
                                "value": `${User}`,
                                "inline": true,
                            },
                            {
                                "name": "Tag",
                                "value": `${User.user?.username}`,
                                "inline": true,
                            },
                            {
                                "name": "User ID",
                                "value": `${User.user?.id}`,
                                "inline": true,
                            },
                            {
                                "name": "Date Created",
                                "value": `<t:${createdAt}:F> | <t:${createdAt}:R>`,
                                "inline": true,
                            },
                            {
                                "name": "Date Joined",
                                "value": `<t:${joinedAt}:F> | <t:${joinedAt}:R>`,
                                "inline": true,
                            },
                            {
                                "name": `Roles [${User.roles?.cache.size}]`,
                                "value": `${User.roles?.cache.filter(r => r.id !== interaction.guild?.id).map(r => `${r}`).join(' | ')}`,
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
        } else if (User.user?.bot) {
            let UserPermissions = User.permissions?.toArray().join('` | `');

            if (!UserPermissions) UserPermissions = 'None'

            await interaction.reply({
                "embeds": [{
                    "title": `${assets.icons.info} | ${User.user?.username}`,
                    "color": `${assets.colors.primary}`,
                    "thumbnail": {
                        "url": `${User.user?.displayAvatarURL({ forceStatic: false })}`,
                    },
                    "author": {
                        "name": `${interaction.user?.username}`,
                        "icon_url": `${interaction.user?.displayAvatarURL({ forceStatic: false })}`,
                    },
                    "fields": [
                        {
                            "name": "User",
                            "value": `${User}`,
                            "inline": true,
                        },
                        {
                            "name": "Tag",
                            "value": `${User.user?.username}`,
                            "inline": true,
                        },
                        {
                            "name": "User ID",
                            "value": `${User.user?.id}`,
                            "inline": true,
                        },
                        {
                            "name": "Date Created",
                            "value": `<t:${createdAt}:F> | <t:${createdAt}:R>`,
                            "inline": true,
                        },
                        {
                            "name": "Date Joined",
                            "value": `<t:${joinedAt}:F> | <t:${joinedAt}:R>`,
                            "inline": true,
                        },
                        {
                            "name": `Roles [${User.roles?.cache.size}]`,
                            "value": `${User.roles?.cache.filter(r => r.id !== interaction.guild?.id).map(r => `${r}`).join(' | ')}`,
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
        };

        return;
    },
};