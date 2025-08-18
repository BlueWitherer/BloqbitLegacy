import { Command, log } from "#bloqbit/include";
import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import fetch from "#bloqbit/modules/fetch";
import resolve from "#bloqbit/modules/resolve";
import cache from "#bloqbit/database";

export default new Command(
    new SlashCommandBuilder()
        .setName("ghostping")
        .setDescription("Set up a dedicated logger for ghost pings.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .setNSFW(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((c) => c
            .setName("config")
            .setDescription("Configure the ghost ping logger.")
            .addBooleanOption((o) => o
                .setName("enable")
                .setDescription("Toggle the ghost ping logger for the server.")
                .setRequired(true)))
        .addSubcommand((c) => c
            .setName("pings")
            .setDescription("Add a mention type to be logged.")
            .addBooleanOption((o) => o
                .setName("moderators")
                .setDescription("Log ghost pings from moderators.")
                .setRequired(true))
            .addBooleanOption((o) => o
                .setName("users")
                .setDescription("Log user pings.")
                .setRequired(false))
            .addBooleanOption((o) => o
                .setName("bots")
                .setDescription("Log bot pings.")
                .setRequired(false))
            .addBooleanOption((o) => o
                .setName("roles")
                .setDescription("Log role pings.")
                .setRequired(false))
            .addBooleanOption((o) => o
                .setName("everyone")
                .setDescription("Log @everyone pings.")
                .setRequired(false))),
    async (interaction, assets, system, db) => {
        const subCmd = interaction.options?.getSubcommand(true);

        const configCmd = async () => {
            const toggle = interaction.options?.getBoolean("enable", true);

            system.ghostping.enabled = toggle;

            const update = await cache.update(system, db);

            if (update) {
                await interaction.reply({
                    "content": "",
                    "embeds": [
                        {
                            "description": `${assets.icons.check} **${interaction.user?.username}** - Successfully __${resolve.abled(toggle)}__ the ghost ping logger.`,
                            "color": assets.colors.primary,
                        },
                    ],
                });
            } else {
                log.error(`Failed to update ghost ping logger configuration in guild '${interaction.guild?.name}' (${interaction.guild?.id})`);
                await fetch.commandErrorResponse(interaction, assets);
            };
        };

        const pingCmd = async () => {
            const moderators = interaction.options?.getBoolean("moderators", true);
            const users = interaction.options?.getBoolean("users", false);
            const bots = interaction.options?.getBoolean("bots", false);
            const roles = interaction.options?.getBoolean("roles", false);
            const everyone = interaction.options?.getBoolean("everyone", false);

            const allEmbeds = [];

            if (moderators !== null) {
                system.ghostping.noMods = moderators;

                allEmbeds.push({
                    "description": `${assets.icons.check} **${interaction.user?.username}** - Successfully __${resolve.abled(moderators)}__ ghost ping logs from moderators.`,
                    "color": assets.colors.primary,
                });
            };

            if (users !== null) {
                system.ghostping.settings.users = users;

                allEmbeds.push({
                    "description": `${assets.icons.check} **${interaction.user?.username}** - Successfully __${resolve.abled(users)}__ ghost ping detection for users.`,
                    "color": assets.colors.primary,
                });
            };

            if (bots !== null) {
                system.ghostping.settings.bots = bots;

                allEmbeds.push({
                    "description": `${assets.icons.check} **${interaction.user?.username}** - Successfully __${resolve.abled(bots)}__ ghost ping detection for bots.`,
                    "color": assets.colors.primary,
                });
            };

            if (roles !== null) {
                system.ghostping.settings.bots = roles;

                allEmbeds.push({
                    "description": `${assets.icons.check} **${interaction.user?.username}** - Successfully __${resolve.abled(roles)}__ ghost ping detection for roles.`,
                    "color": assets.colors.primary,
                });
            };

            if (everyone !== null) {
                system.ghostping.settings.bots = everyone;

                allEmbeds.push({
                    "description": `${assets.icons.check} **${interaction.user?.username}** - Successfully __${resolve.abled(everyone)}__ ghost ping detection for @everyone.`,
                    "color": assets.colors.primary,
                });
            };

            const update = await cache.update(system, db);

            if (update) {
                if (interaction.replied) {
                    await interaction.followUp({
                        "content": `> -# ${assets.icons.check} Configured **${allEmbeds.length}** ${resolve.isPlural(allEmbeds.length, "setting", "settings")}`,
                        "embeds": allEmbeds,
                    });
                } else {
                    await interaction.reply({
                        "content": `> -# ${assets.icons.check} Configured **${allEmbeds.length}** ${resolve.isPlural(allEmbeds.length, "setting", "settings")}`,
                        "embeds": allEmbeds,
                    });
                };
            } else {
                log.error(`Failed to update ghost ping logger configuration in guild '${interaction.guild?.name}' (${interaction.guild?.id})`);
                await fetch.commandErrorResponse(interaction, assets);
            };
        };

        switch (subCmd) {
            case "config":
                await configCmd();
                break;

            case "pings":
                await pingCmd();
                break;

            default:
                await fetch.commandErrorResponse(interaction, assets);
                break;
        };

        return;
    },
);