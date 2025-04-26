import { Command } from '../../classes.mjs';
import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';

export default new Command(
    new SlashCommandBuilder()
        .setName("say")
        .setDescription("Send a message in a channel.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .setNSFW(false)
        .addStringOption((s) => s
            .setName("message")
            .setDescription("The message to send in the channel.")
            .setRequired(true))
        .addChannelOption((c) => c
            .setName("channel")
            .setDescription("The channel to send a message to.")
            .addChannelTypes([ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildAnnouncement, ChannelType.GuildStageVoice])
            .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async (interaction, assets, system, db) => {
        const channel = interaction.options?.getChannel("channel", false, [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.GuildForum, ChannelType.GuildStageVoice, ChannelType.GuildVoice]);
        const message = interaction.options?.getString("message", true);

        if (channel && channel === interaction.channel && channel.isTextBased() && 'send' in channel) {
            await channel.send({
                "content": "",
                "embeds": [
                    {
                        "description": `${message}`,
                        "color": assets.colors.primary,
                    },
                ],
            });

            await interaction.reply({
                "content": "",
                "embeds": [
                    {
                        "description": `${assets.icons.check} Message sent`,
                        "color": assets.colors.primary,
                    },
                ],
                "flags": [
                    "Ephemeral",
                ],
            });

            return;
        } else if (channel && 'send' in channel) {
            await channel.send({
                "content": "",
                "embeds": [
                    {
                        "description": message,
                        "color": assets.colors.primary,
                    },
                ],
            });

            await interaction.reply({
                "content": "",
                "embeds": [
                    {
                        "description": `${assets.icons.check} Message sent in ${channel}`,
                        "color": assets.colors.primary,
                    },
                ],
            });

            return;
        } else if (!channel) {
            await interaction.reply({
                "content": "",
                "embeds": [
                    {
                        "description": message,
                        "color": assets.colors.primary,
                    },
                ],
            });

            return;
        };
    });