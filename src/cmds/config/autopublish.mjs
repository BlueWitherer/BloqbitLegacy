import { Command, log } from "#bloqbit/include.ts";
import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import fetch from "#bloqbit/modules/fetch.mjs";
import resolve from "#bloqbit/modules/resolve.mjs";
import cache from "#bloqbit/database.mjs";

export default new Command(
    new SlashCommandBuilder()
        .setName("autopublish")
        .setDescription("Set an announcement channel to automatically publish every message posted on it.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .setNSFW(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((c) => c
            .setName("config")
            .setDescription("Configure the auto-publisher.")
            .addBooleanOption((o) => o
                .setName("enable")
                .setDescription("Toggle the auto-publisher for the server.")
                .setRequired(true))
            .addBooleanOption((o) => o
                .setName("bots")
                .setDescription("Allow bot messages to be published.")
                .setRequired(false)))
        .addSubcommand((c) => c
            .setName("channel")
            .setDescription("Add a channel to the auto-publish list.")
            .addChannelOption((o) => o
                .setName("channel")
                .setDescription("The channel to set.")
                .addChannelTypes([ChannelType.GuildAnnouncement])
                .setRequired(true))
            .addBooleanOption((o) => o
                .setName("enable")
                .setDescription("Toggle the auto-publisher for this channel.")
                .setRequired(true))),
    async (interaction, assets, system, db) => {
        const subCmd = interaction.options?.getSubcommand(true);

        const configCmd = async () => {
            const toggle = interaction.options?.getBoolean("enable", true);
            const bots = interaction.options?.getBoolean("bots", false);

            system.autopublish.enabled = toggle;
            if (bots !== null) system.autopublish.bots = bots;

            const update = await cache.update(system, db);

            if (update) {
                await interaction.reply({
                    "embeds": [
                        {
                            "description": `${assets.icons.check} **${interaction.user?.username}** - Successfully __${resolve.abled(toggle)}__ the auto-publisher${bots ? ` including bot messages` : ``}.`,
                            "color": assets.colors.primary,
                        },
                    ],
                });
            } else {
                await fetch.commandErrorResponse(interaction, assets);
            };
        };

        const channelCmd = async () => {
            const channel = interaction.options?.getChannel("channel", true, [ChannelType.GuildAnnouncement]);
            const toggle = interaction.options?.getBoolean("enable", true);

            const chnls = fetch.scanChannels(interaction.guild, system.autopublish.channels);
            const foundChannel = chnls?.findIndex((c) => c === channel.id) || -1;

            if (foundChannel >= 0) {
                if (!toggle) chnls.splice(foundChannel, 1);
            } else {
                if (toggle) chnls.push(channel.id);
            };

            system.autopublish.channels = chnls;
            const update = await cache.update(system, db);

            if (update) {
                await interaction.reply({
                    "embeds": [
                        {
                            "description": `${assets.icons.check} **${interaction.user?.username}** - Successfully __${resolve.abled(toggle)}__ the auto-publisher in <#${channel.id}>.`,
                            "color": assets.colors.primary,
                        },
                    ],
                });
            } else {
                await fetch.commandErrorResponse(interaction, assets);
            };
        };

        switch (subCmd) {
            case "config":
                await configCmd();
                break;

            case "channel":
                await channelCmd();
                break;

            default:
                await fetch.commandErrorResponse(interaction, assets);
                break;
        };

        return;
    },
);