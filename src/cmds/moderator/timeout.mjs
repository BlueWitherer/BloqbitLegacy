import { Command, log } from "#bloqbit/include.ts";
import { ApplicationIntegrationType, GuildMember, InteractionContextType, PermissionsBitField } from 'discord.js';
import { EmbedBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import fetch from "#bloqbit/modules/fetch.mjs";

export default new Command(
    new SlashCommandBuilder()
        .setName("timeout")
        .setDescription("Timeout a user.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .setNSFW(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addSubcommand((o) => o
            .setName("set")
            .setDescription("Set the timeout for this user.")
            .addUserOption((o) => o
                .setName("user")
                .setDescription("The user to timeout.")
                .setRequired(true))
            .addNumberOption((o) => o
                .setName("span")
                .setDescription("Amount of time for the timeout.")
                .setMinValue(1)
                .setMaxValue(59)
                .setRequired(true))
            .addNumberOption((o) => o
                .setName("time")
                .setDescription("In what time to set the timeout to.")
                .addChoices(
                    {
                        name: "seconds",
                        value: 1000
                    },
                    {
                        name: "minutes",
                        value: 60000
                    },
                    {
                        name: "hours",
                        value: 3600000
                    },
                    {
                        name: "days",
                        value: 86400000
                    },
                ).setRequired(true))
            .addStringOption((o) => o
                .setName("reason")
                .setDescription("Reason for timeout.")
                .setRequired(false)))
        .addSubcommand((o) => o
            .setName("remove")
            .setDescription("Remove the timeout for a user.")
            .addUserOption((o) => o
                .setName("user")
                .setDescription("The user to remove timeout for.")
                .setRequired(true))),
    async (interaction, assets, system, db) => {
        const subcommand = interaction.options?.getSubcommand();

        const User = interaction.options?.getUser("user", true);

        try {
            if (subcommand === "set") {
                const Member = interaction.options?.getMember("user");
                const Reason = interaction.options?.getString("reason", false) ?? 'Unspecified';
                const Cooldown = interaction.options?.getNumber("span", true) ?? 1;
                const Time = interaction.options?.getNumber("time", true) ?? 1;

                const date = Date.now();
                const duration = Math.floor(Cooldown * Time);

                const until = Math.floor((date / 1000) + (duration / 1000));

                if (Member?.permissions instanceof PermissionsBitField && Member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                    await interaction.reply({
                        "embeds": [
                            {
                                "description": `${assets.icons.xmark} You cannot moderate another moderator`,
                                "color": assets.colors.primary,
                            },
                        ],
                        "flags": [
                            "Ephemeral"
                        ],
                    });

                    return;
                };

                if (duration > 2419200000) { // 4 weeks in milliseconds
                    await interaction.reply({
                        "embeds": [
                            {
                                "description": `${assets.icons.xmark} Timeout cannot be set to over 4 weeks`,
                                "color": assets.colors.primary,
                            },
                        ],
                        "flags": [
                            "Ephemeral"
                        ],
                    });

                    return;
                } else {
                    if (Member instanceof GuildMember) {
                        await Member.timeout(duration, `${interaction.user?.username} | Timeout - ${Reason}`);

                        await interaction.reply({
                            "embeds": [
                                {
                                    "author": {
                                        "name": interaction.user?.username,
                                        "icon_url": interaction.user?.displayAvatarURL({ forceStatic: false }),
                                    },
                                    "title": `${assets.icons.noentry} User Timed Out`,
                                    "color": assets.colors.primary,
                                    "fields": [
                                        {
                                            "name": "User",
                                            "value": Member?.user?.username,
                                            "inline": true
                                        },
                                        {
                                            "name": "Until",
                                            "value": `<t:${until}:R>`,
                                            "inline": true
                                        },
                                        {
                                            "name": "Reason",
                                            "value": `${Reason}`,
                                            "inline": false
                                        },
                                        {
                                            "name": "Moderator",
                                            "value": `<@!${interaction.user?.id}>`,
                                            "inline": true
                                        },
                                    ],
                                },
                            ],
                        });
                    } else {
                        await interaction.reply({
                            "embeds": [
                                {
                                    "description": `${assets.icons.xmark} Unable to timeout the user. Invalid member type`,
                                    "color": assets.colors.primary,
                                },
                            ],
                            "flags": [
                                "Ephemeral"
                            ],
                        });
                    };
                };
            } else if (subcommand === "remove") {
                const Member = interaction.options?.getMember("user");

                if (Member?.permissions instanceof PermissionsBitField && Member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                    await interaction.reply({
                        "embeds": [
                            {
                                "description": `${assets.icons.xmark} You cannot moderate another moderator`,
                                "color": assets.colors.primary,
                            },
                        ],
                        "flags": [
                            "Ephemeral"
                        ],
                    });

                    return;
                };

                if (Member instanceof GuildMember) {
                    await Member.timeout(0, `${interaction.user?.username} Timeout removed`);

                    await interaction.reply({
                        "embeds": [
                            {
                                "author": {
                                    "name": interaction.user?.username,
                                    "icon_url": interaction.user?.displayAvatarURL({ forceStatic: false }),
                                },
                                "title": `${assets.icons.check} Timeout Removed`,
                                "color": assets.colors.primary,
                                "fields": [
                                    {
                                        "name": "User",
                                        "value": Member?.user?.username,
                                        "inline": true
                                    },
                                    {
                                        "name": "Moderator",
                                        "value": `<@!${interaction.user?.id}>`,
                                        "inline": true
                                    },
                                ],
                            },
                        ],
                    });
                } else {
                    await interaction.reply({
                        "embeds": [
                            {
                                "description": `${assets.icons.xmark} Unable to remove timeout. Invalid member type`,
                                "color": assets.colors.primary,
                            },
                        ],
                        "flags": [
                            "Ephemeral"
                        ],
                    });
                };
            } else {
                log.warn(`Invalid subcommand: ${subcommand}`);
            };
        } catch (err) {
            console.trace(err);

            await interaction.reply({
                "content": `> ${assets.icons.xmark} **${interaction.user?.username}** - An error occurred while processing the command.`,
                "flags": [
                    "Ephemeral"
                ],
            });

            return;
        } finally {
            if (system.logs.enabled && system.logs.actions.moderator) {
                const date = Math.floor(Date.now() / 1000);

                const emb = new EmbedBuilder({
                    "author": {
                        "name": interaction.user?.username,
                        "icon_url": interaction.user?.displayAvatarURL({ forceStatic: false, size: 128 }),
                    },
                    "title": `:exclamation: Moderator`,
                    "description": `**${interaction.user?.username}** has taken a moderation action on \`${User.username}\`.`,
                    "color": assets.colors.tertiary,
                    "fields": [
                        {
                            "name": "Action",
                            "value": subcommand === "set" ? "Set Timeout" : "Removed Timeout",
                            "inline": true
                        },
                        {
                            "name": "Time",
                            "value": `<t:${date}:F> • <t:${date}:R>`,
                            "inline": false
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