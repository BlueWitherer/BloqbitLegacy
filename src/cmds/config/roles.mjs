import { ServerLogEventType, Command } from '../../classes.js';
import { Roles } from '../../classes/Config.js';
import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import fetch from '../../modules/fetch.js';
import resolve from '../../modules/resolve.js';
import cache from '../../cache.mjs';

export default new Command(
    new SlashCommandBuilder()
        .setName("roles")
        .setDescription("Configure special roles on this server")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .setNSFW(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((c) => c
            .setName('immune')
            .setDescription('Add a role to be immune to moderator actions')
            .addRoleOption((o) => o
                .setName('role')
                .setDescription('Select immunity role')
                .setRequired(true)))
        .addSubcommand((c) => c
            .setName('anti-ping')
            .setDescription('Add a role to be protected from @mentions')
            .addRoleOption((o) => o
                .setName('role')
                .setDescription('Select ping-protected role')
                .setRequired(true)))
        .addSubcommand((c) => c
            .setName('streaming')
            .setDescription('Set the streaming role')
            .addRoleOption((o) => o
                .setName('role')
                .setDescription('Select streaming role')
                .setRequired(true)))
        .addSubcommand((c) => c
            .setName('muted')
            .setDescription('Set the muted role')
            .addRoleOption((o) => o
                .setName('role')
                .setDescription('Select muted role')
                .setRequired(true))),
    async (interaction, assets, system, db) => {
        await interaction.reply({
            content: "This command is currently W.I.P.!",
            ephemeral: true,
        });

        return;
    },
);