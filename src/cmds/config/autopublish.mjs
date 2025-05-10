import { Command } from '../../classes.js';
import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import fetch from '../../modules/fetch.js';
import resolve from '../../modules/resolve.js';
import cache from '../../cache.mjs';

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
                .setRequired(true)))
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

            system.autopublish.enabled = toggle;

            const update = await cache.update(system, db);

            if (update) {
                await interaction.reply({
                    "content": "",
                    "embeds": [
                        {
                            "description": `${assets.icons.check} **${interaction.user?.username}** - Successfully __${resolve.abled(toggle)}__ the auto-publisher.`,
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

            const foundChannel = system.autopublish.channels.findIndex((c) => c === channel.id);

            if (foundChannel >= 0) {
                system.autopublish.channels.splice(foundChannel, 1);
            } else {
                system.autopublish.channels.push(channel.id);
            };

            const update = await cache.update(system, db);

            if (update) {
                await interaction.reply({
                    "content": "",
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