import { Command } from '../../classes.mjs';
import { ApplicationIntegrationType, InteractionContextType, ChannelType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v10';

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
            .addNumberOption((n) => n.setName("cooldown").setDescription("Amount of time for the slowmode interval.").setMinValue(1).setMaxValue(59).setRequired(true))
            .addNumberOption((n) => n.setName("time").setDescription("In what time to set the slowmode to.").addChoices(
                {
                    name: "seconds",
                    value: 1,
                },
                {
                    name: "minutes",
                    value: 60,
                },
                {
                    name: "hours",
                    value: 3600,
                }
            ).setRequired(true)))
        .addSubcommand((c) => c
            .setName("remove")
            .setDescription("Remove the slowmode in this channel.")),
    async (interaction, assets, system, db) => {
        if (interaction.options?.getSubcommand() === "set") {
            const cooldown = interaction.options?.getNumber("cooldown") || 1;
            const time = interaction.options?.getNumber("time") || 1;

            const duration = Math.floor(cooldown * time);

            let type = "seconds";

            switch (interaction.options?.getNumber("time")) {
                case (1):
                    type = "seconds";
                    break;

                case (60):
                    type = "minutes";
                    break;

                case (3600):
                    type = "hours";
                    break;

                default:
                    type = "seconds";
                    break;
            };

            if (cooldown === 1) {
                type = type.slice(0, -1);
            };

            if (time === 3600 && cooldown > 12) {
                await interaction.reply({
                    "content": "",
                    "embeds": [
                        {
                            "description": `${assets.icons.xmark} Slowmode cannot be set to over 12 hours.`,
                            "color": assets.colors.primary,
                        },
                    ],
                    "flags": [
                        "Ephemeral",
                    ],
                });

                return;
            };

            if (interaction.channel?.isTextBased() && interaction.channel?.type === ChannelType.GuildText) {
                await interaction.channel.setRateLimitPerUser(duration, `${interaction.user?.username} Slowmode set.`);

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
                                    "value": `${cooldown} ${type}`,
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
                            "description": `${assets.icons.xmark} Slowmode cannot be set in this channel.`,
                            "color": assets.colors.primary,
                        },
                    ],
                    "flags": [
                        "Ephemeral",
                    ],
                });
            };

            return;
        } else if (interaction.options?.getSubcommand() === "remove") {
            if (interaction.channel?.isTextBased() && interaction.channel?.type === ChannelType.GuildText) {
                await interaction.channel.setRateLimitPerUser(0, `${interaction.user?.username} Slowmode removed.`);

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
                            "description": `${assets.icons.xmark} Slowmode cannot be removed in this channel.`,
                            "color": assets.colors.primary,
                        },
                    ],
                    "flags": [
                        "Ephemeral",
                    ],
                });
            };

            return;
        };

        return;
    });