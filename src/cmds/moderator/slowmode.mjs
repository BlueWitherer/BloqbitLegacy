import { Command } from '../../classes.js';
import { ApplicationIntegrationType, InteractionContextType, ChannelType } from 'discord.js';
import { EmbedBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import fetch from '../../modules/fetch.js';

export default new Command(
    new SlashCommandBuilder()
        .setName("slowmode")
        .setDescription("Set slowmode in the current channel.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .setNSFW(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addSubcommand((c) => c
            .setName("set")
            .setDescription("Set the slowmode in this channel.")
            .addNumberOption((o) => o
                .setName("cooldown")
                .setDescription("Amount of time for the slowmode interval.")
                .setMinValue(1)
                .setMaxValue(59)
                .setRequired(true))
            .addNumberOption((o) => o
                .setName("time")
                .setDescription("In what time to set the slowmode to.")
                .addChoices(
                    {
                        name: "seconds",
                        value: 1
                    },
                    {
                        name: "minutes",
                        value: 60
                    },
                    {
                        name: "hours",
                        value: 3600
                    },
                ).setRequired(true)))
        .addSubcommand((c) => c
            .setName("remove")
            .setDescription("Remove the slowmode in this channel.")),
    async (interaction, assets, system, db) => {
        const subcommand = interaction.options?.getSubcommand(true);

        try {
            if (subcommand === "set") {
                const Cooldown = interaction.options?.getNumber("Cooldown", true) ?? 1;
                const Time = interaction.options?.getNumber("Time", true) ?? 1;
                const duration = Math.floor(Cooldown * Time);

                let type = "seconds";

                switch (Time) {
                    case 1: type = "seconds"; break;
                    case 60: type = "minutes"; break;
                    case 3600: type = "hours"; break;

                    default: type = "seconds"; break;
                };

                if (Cooldown === 1) type = type.slice(0, -1);

                if (Time === 3600 && Cooldown > 12) {
                    await interaction.reply({
                        "content": "",
                        "embeds": [
                            {
                                "description": `${assets.icons.xmark} Slowmode cannot be set to over 12 hours`,
                                "color": assets.colors.secondary,
                            },
                        ],
                        "flags": ["Ephemeral"],
                    });

                    return;
                } else {
                    if (interaction.channel?.isTextBased() && interaction.channel?.type === ChannelType.GuildText) {
                        await interaction.channel.setRateLimitPerUser(duration, `${interaction.user?.username} Slowmode set`);

                        await interaction.reply({
                            "content": "",
                            "embeds": [
                                {
                                    "author": {
                                        "name": interaction.user?.username,
                                        "icon_url": interaction.user?.displayAvatarURL({ forceStatic: false }),
                                    },
                                    "title": `${assets.icons.check} Slowmode Set`,
                                    "color": assets.colors.primary,
                                    "fields": [
                                        {
                                            "name": "Duration",
                                            "value": `${Cooldown} ${type}`,
                                            "inline": true,
                                        },
                                        {
                                            "name": "Moderator",
                                            "value": `<@!${interaction.user?.id}>`,
                                            "inline": true,
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
                                    "description": `${assets.icons.xmark} Slowmode cannot be set in this channel`,
                                    "color": assets.colors.secondary,
                                },
                            ],
                            "flags": [
                                "Ephemeral"
                            ],
                        });
                    };
                };
            } else if (subcommand === "remove") {
                if (interaction.channel?.isTextBased() && interaction.channel?.type === ChannelType.GuildText) {
                    await interaction.channel.setRateLimitPerUser(0, `${interaction.user?.username} Slowmode removed`);

                    await interaction.reply({
                        "content": "",
                        "embeds": [
                            {
                                "author": {
                                    "name": interaction.user?.username,
                                    "icon_url": interaction.user?.displayAvatarURL({ forceStatic: false }),
                                },
                                "title": `${assets.icons.check} Slowmode Removed`,
                                "color": assets.colors.primary,
                                "fields": [
                                    {
                                        "name": "Moderator",
                                        "value": `<@!${interaction.user?.id}>`,
                                        "inline": true,
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
                                "description": `${assets.icons.xmark} Slowmode cannot be removed in this channel`,
                                "color": assets.colors.secondary,
                            },
                        ],
                        "flags": [
                            "Ephemeral"
                        ],
                    });
                };
            } else {
                console.error(`Invalid subcommand: ${subcommand}`);

                await interaction.reply({
                    "content": "",
                    "embeds": [
                        {
                            "description": `${assets.icons.xmark} Invalid subcommand`,
                            "color": assets.colors.secondary,
                        },
                    ],
                    "flags": [
                        "Ephemeral"
                    ],
                });
            };
        } catch (err) {
            console.trace(err);

            await interaction.reply({
                "content": `> ${assets.icons.xmark} **${interaction.user?.username}** - An error occurred while processing the command.`,
                "flags": [
                    "Ephemeral"
                ],
            });
        } finally {
            if (system.logs.enabled && system.logs.actions.moderator) {
                const date = Math.floor(Date.now() / 1000);

                const emb = new EmbedBuilder({
                    "author": {
                        "name": interaction.user?.username,
                        "icon_url": interaction.user?.displayAvatarURL({ forceStatic: false, size: 128 }),
                    },
                    "title": `${assets.icons.exclamation} Moderator`,
                    "description": `**${interaction.user?.username}** has modified the slowmode in <#${interaction.channel?.id}>`,
                    "color": assets.colors.tertiary,
                    "fields": [
                        {
                            "name": "Action",
                            "value": subcommand === "set" ? "Set Slowmode" : "Removed Slowmode",
                            "inline": true,
                        },
                        {
                            "name": "Channel",
                            "value": `<#${interaction.channel?.id}>`,
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