import { Command } from '../../classes.mjs';
import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v10';

export default new Command(
    new SlashCommandBuilder()
        .setName("timeout")
        .setDescription("Timeout a user.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .setNSFW(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addSubcommand((c) => c
            .setName("set")
            .setDescription("Set the timeout for this user.")
            .addUserOption((u) => u.setName("user").setDescription("The user to timeout.").setRequired(true))
            .addNumberOption((n) => n.setName("span").setDescription("Amount of time for the timeout.").setMinValue(1).setMaxValue(59).setRequired(true))
            .addNumberOption((n) => n.setName("time").setDescription("In what time to set the timeout to.").addChoices(
                {
                    name: "seconds",
                    value: 1000,
                },
                {
                    name: "minutes",
                    value: 60000,
                },
                {
                    name: "hours",
                    value: 3600000,
                },
                {
                    name: "days",
                    value: 86400000,
                },
            ).setRequired(true))
            .addStringOption(option => option.setName("reason").setDescription("Reason for timeout.").setRequired(true)))
        .addSubcommand((c) => c
            .setName("remove")
            .setDescription("Remove the timeout for a user.")
            .addUserOption((u) => u.setName("user").setDescription("The user to warn.").setRequired(true))),
    async (interaction, assets, system, db) => {
        if (interaction.options?.getSubcommand() === "set") {
            const Member = interaction.options?.getMember("user");
            const cooldown = interaction.options?.getNumber("span") || 1;
            const time = interaction.options?.getNumber("time") || 1;
            const reason = interaction.options?.getString("reason");

            if (Member.permissions.has([PermissionFlagsBits.ModerateMembers])) {
                await interaction.reply({
                    "content": "",
                    "embeds": [
                        {
                            "description": `${assets.icons.xmark} You cannot moderate another moderator.`,
                            "color": assets.colors.primary,
                        },
                    ],
                    "flags": [
                        "Ephemeral",
                    ],
                });

                return;
            };

            const duration = Math.floor(cooldown * time);

            const date = Date.now();
            const until = Math.floor((date / 1000) + (duration / 1000));

            let type = "seconds";

            switch (interaction.options?.getNumber("time")) {
                case (1000):
                    type = "seconds";
                    break;

                case (60000):
                    type = "minutes";
                    break;

                case (3600000):
                    type = "hours";
                    break;

                case (86400000):
                    type = "days";
                    break;

                case (604800000):
                    type = "weeks";
                    break;
            };

            if (cooldown === 1) {
                type = type.slice(0, -1);
            };

            if (type === "weeks" && cooldown > 4 || type === "days" && cooldown > 28) {
                await interaction.reply({
                    "content": "",
                    "embeds": [
                        {
                            "description": `${assets.icons.xmark} Timeout cannot be set to over 4 weeks.`,
                            "color": assets.colors.primary,
                        },
                    ],
                    "flags": [
                        "Ephemeral",
                    ],
                });

                return;
            };

            await Member.timeout(duration, `${interaction.user?.username} Timeout - ${reason}`);
            await interaction.reply({
                "content": "",
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
                                "inline": true,
                            },
                            {
                                "name": "Until",
                                "value": `<t:${until}:R>`,
                                "inline": true,
                            },
                            {
                                "name": "Reason",
                                "value": `${reason}`,
                                "inline": false,
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

            return;
        } else if (interaction.options?.getSubcommand() === "remove") {
            const Member = interaction.options?.getMember("user");

            if (Member.permissions.has([PermissionFlagsBits.ModerateMembers])) {
                await interaction.reply({
                    "content": "",
                    "embeds": [
                        {
                            "description": `${assets.icons.xmark} You cannot moderate another moderator.`,
                            "color": assets.colors.primary,
                        },
                    ],
                    "flags": [
                        "Ephemeral",
                    ],
                });
            };

            await Member?.timeout(0, `${interaction.user?.username} Timeout removed.`);
            await interaction.reply({
                "content": "",
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

            return;
        };

        return;
    });