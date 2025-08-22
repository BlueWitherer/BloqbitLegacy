import { Command, log } from "#bloqbit/include.ts";
import { ApplicationIntegrationType, GuildMember, InteractionContextType, PermissionsBitField } from 'discord.js';
import { EmbedBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import fetch from "#bloqbit/modules/fetch.mjs";

export default new Command(
    new SlashCommandBuilder()
        .setName("nickname")
        .setDescription("Modify a user's nickname.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .setNSFW(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addSubcommand((c) => c
            .setName("set")
            .setDescription("Change someone's nickname.")
            .addUserOption((o) => o
                .setName("user")
                .setDescription("The user whose nickname to change.")
                .setRequired(true))
            .addStringOption((s) => s
                .setName("name")
                .setDescription("The nickname to change to.")
                .setRequired(true)))
        .addSubcommand((c) => c
            .setName("block")
            .setDescription("Block a user from having their name displayed publicly.")
            .addUserOption((o) => o
                .setName("user")
                .setDescription("The user whose nickname to block.")
                .setRequired(true))
            .addStringOption((s) => s
                .setName("reason")
                .setDescription("The reason to block this name.")
                .setRequired(false)))
        .addSubcommand((c) => c
            .setName("unblock")
            .setDescription("Unblock a user's name.")
            .addUserOption((o) => o
                .setName("user")
                .setDescription("The user whose name to unblock.")
                .setRequired(true)))
        .addSubcommand((c) => c
            .setName("view")
            .setDescription("View a user's blocked name.")
            .addUserOption((o) => o
                .setName("user")
                .setDescription("The user whose blocked name to view.")
                .setRequired(true)))
        .addSubcommand((c) => c
            .setName("reset")
            .setDescription("Reset a user's nickname.")
            .addUserOption((o) => o
                .setName("user")
                .setDescription("The user whose nickname to reset.")
                .setRequired(true))),
    async (interaction, assets, system, db) => {
        const date = Math.floor(Date.now() / 1000);
        const User = interaction.options?.getUser("user", true);
        const Member = interaction.options?.getMember("user");

        if (Member?.permissions instanceof PermissionsBitField && Member.permissions.has([PermissionFlagsBits.ManageNicknames])) {
            await interaction.reply({
                "content": "",
                "embeds": [
                    {
                        "description": `${assets.icons.xmark} You cannot moderate another moderator`,
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
            const subcommand = interaction.options?.getSubcommand();

            if (subcommand === "block") {
                const User = interaction.options?.getUser("user", true);
                const Member = interaction.options?.getMember("user");
                const Reason = interaction.options?.getString("reason", false) ?? "Unspecified";

                if (Member instanceof GuildMember) {
                    await Member.setNickname("[Username Blocked]", `${interaction.user?.username} | Block Display Name - ${Reason}`);

                    await interaction.reply({
                        "content": "",
                        "embeds": [
                            {
                                "author": {
                                    "name": `${interaction.user?.username}`,
                                    "icon_url": `${interaction.user?.displayAvatarURL({ "forceStatic": false, size: 64 })}`,
                                },
                                "title": `${assets.icons.check} Username Blocked`,
                                "color": assets.colors.primary,
                                "fields": [
                                    {
                                        "name": "User",
                                        "value": User.username,
                                        "inline": false,
                                    },
                                    {
                                        "name": "Reason",
                                        "value": Reason,
                                        "inline": true,
                                    },
                                    {
                                        "name": "Moderator",
                                        "value": `<@!${interaction.user?.id}>`,
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
                                    "title": `${assets.icons.exclamation} Username Blocked`,
                                    "description": `Your display name in the server ${interaction.guild?.name} has been blocked.`,
                                    "color": assets.colors.primary,
                                    "fields": [
                                        {
                                            "name": "reason",
                                            "value": Reason,
                                            "inline": true,
                                        },
                                        {
                                            "name": "Reviewed",
                                            "value": `<t:${date}:F> • <t:${date}:R>`,
                                            "inline": false,
                                        },
                                    ],
                                },
                            ],
                        });
                    } catch (err) {
                        log.trace(err);
                        log.warn(`Failed to send nickname block DM to user ${User.username} (${User.id}): ${err}`);
                    };
                } else {
                    log.error(`Invalid user: ${User.username}`);

                    await interaction.reply({
                        "content": "",
                        "embeds": [
                            {
                                "description": `${assets.icons.xmark} **${interaction.user?.username}** - This user is not a member of this server`,
                                "color": assets.colors.secondary,
                            },
                        ],
                        "flags": [
                            "Ephemeral",
                        ],
                    });

                    return;
                };
            } else if (subcommand === "view") {
                const User = interaction.options?.getUser("user", true);

                const blocked = false;

                // TODO: Fetch all info from database
                const mod = "ModeratorID"; // Replace with actual data
                const displayed = "BlockedName"; // Replace with actual data
                const Reason = "reason"; // Replace with actual data

                if (blocked) {
                    await interaction.reply({
                        "content": "",
                        "embeds": [
                            {
                                "author": {
                                    "name": `${interaction.user?.username}`,
                                    "icon_url": `${interaction.user?.displayAvatarURL({ "forceStatic": false, size: 64 })}`,
                                },
                                "title": `${assets.icons.info} ${User.username}'s Blocked Username`,
                                "color": assets.colors.primary,
                                "fields": [
                                    {
                                        "name": "reason",
                                        "value": `${Reason}`,
                                        "inline": false,
                                    },
                                    {
                                        "name": "Previously Displayed As",
                                        "value": `||${displayed}||`,
                                        "inline": false,
                                    },
                                    {
                                        "name": "Moderator",
                                        "value": `<@!${mod}>`,
                                        "inline": false,
                                    },
                                ],
                            },
                        ],
                    });
                } else {
                    await interaction.reply({
                        "content": "",
                        "embeds": [
                            {
                                "description": `${assets.icons.xmark} **${interaction.user?.username}** - This user has no blocked names`,
                                "color": assets.colors.secondary,
                            },
                        ],
                    });
                };
            } else if (subcommand === "unblock") {
                const User = interaction.options?.getUser("user", true);

                await interaction.reply({
                    "content": "",
                    "embeds": [
                        {
                            "author": {
                                "name": `${interaction.user?.username}`,
                                "icon_url": `${interaction.user?.displayAvatarURL({ forceStatic: false, size: 64 })}`,
                            },
                            "fields": [
                                {
                                    "name": "User",
                                    "value": `${User.username}`,
                                    "inline": false,
                                },
                                {
                                    "name": "Moderator",
                                    "value": `<@!${interaction.user?.id}>`,
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
                                "description": `${assets.icons.info} Your name has been unblocked. Have fun!`,
                                "color": assets.colors.primary,
                            },
                        ],
                    });
                } catch (err) {
                    log.trace(err);
                    log.warn(`Failed to send nickname unblock DM to user ${User.username} (${User.id}): ${err}`);
                };
            } else if (subcommand === "set") {
                const User = interaction.options?.getUser("user", true);
                const Member = interaction.options?.getMember("user");
                const name = interaction.options?.getString("name");

                if (Member instanceof GuildMember) {
                    await Member.setNickname(name);

                    await interaction.reply({
                        "content": "",
                        "embeds": [
                            {
                                "description": `${assets.icons.check} Set **${User.username}**'s nickname`,
                                "color": assets.colors.primary,
                            },
                        ],
                    });
                } else {
                    log.error(`Invalid user: ${User.username}`);

                    await interaction.reply({
                        "content": "",
                        "embeds": [
                            {
                                "description": `${assets.icons.xmark} **${interaction.user?.username}** - This user is not a member of this server`,
                                "color": assets.colors.secondary,
                            },
                        ],
                        "flags": [
                            "Ephemeral",
                        ],
                    });

                    return;
                };
            } else if (subcommand === "reset") {
                const User = interaction.options?.getUser("user", true);
                const Member = interaction.options?.getMember("user");

                if (Member instanceof GuildMember) {
                    await Member.setNickname(null, `${interaction.user?.username} - Reset Nickname`);

                    await interaction.reply({
                        "content": "",
                        "embeds": [
                            {
                                "description": `${assets.icons.check} Reset **${User.username}**'s nickname`,
                                "color": assets.colors.primary,
                            },
                        ],
                    });
                } else {
                    log.error(`Invalid user: ${User.username}`);

                    await interaction.reply({
                        "content": "",
                        "embeds": [
                            {
                                "description": `${assets.icons.xmark} **${interaction.user?.username}** - This user is not a member of this server`,
                                "color": assets.colors.secondary,
                            },
                        ],
                        "flags": [
                            "Ephemeral",
                        ],
                    });

                    return;
                };
            } else {
                log.error(`Invalid subcommand: ${subcommand}`);

                await interaction.reply({
                    "content": "",
                    "embeds": [
                        {
                            "description": `${assets.icons.xmark} **${interaction.user?.username}** - Invalid subcommand`,
                            "color": assets.colors.secondary,
                        },
                    ],
                    "flags": [
                        "Ephemeral",
                    ],
                });
            };
        } catch (err) {
            log.trace(err);

            await interaction.reply({
                "content": `> ${assets.icons.xmark} **${interaction.user?.username}** - An error occurred while processing the command.`,
                "flags": [
                    "Ephemeral",
                ],
            });
        } finally {
            if (system.logs.enabled && system.logs.actions.moderator) {
                const date = Math.floor(Date.now() / 1000);

                const emb = new EmbedBuilder({
                    "author": {
                        "name": interaction.user?.username,
                        "icon_url": interaction.user?.displayAvatarURL({ "forceStatic": false, size: 128 }),
                    },
                    "title": `:exclamation: Moderator`,
                    "description": `**${interaction.user?.username}** has taken a moderation action on \`${User.username}\``,
                    "color": assets.colors.tertiary,
                    "fields": [
                        {
                            "name": "Type",
                            "value": `Change nickname`,
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
                log.warn(`Logs for moderator actions not enabled in guild ${interaction.guild?.id}`);
            };
        };
    },
);