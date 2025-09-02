import { Command, log } from "#bloqbit/include.ts";
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
            .addChannelTypes([ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildAnnouncement, ChannelType.GuildStageVoice, ChannelType.PublicThread, ChannelType.PrivateThread, ChannelType.AnnouncementThread])
            .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async (interaction, assets, system, db) => {
        const message = interaction.options?.getString("message", true);
        const channel = interaction.options?.getChannel("channel", false, [ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildAnnouncement, ChannelType.GuildStageVoice, ChannelType.PublicThread, ChannelType.PrivateThread, ChannelType.AnnouncementThread]);

        if (channel && channel === interaction.channel && channel.isTextBased() && 'send' in channel) {
            await channel.send({
                "embeds": [
                    {
                        "description": `${message}`,
                        "color": assets.colors.primary,
                    },
                ],
            });

            await interaction.reply({
                "embeds": [
                    {
                        "description": `${assets.icons.check} Message sent`,
                        "color": assets.colors.primary,
                    },
                ],
                "flags": ["Ephemeral"],
            });
        } else if (channel && 'send' in channel) {
            const msg = await channel.send({
                "embeds": [
                    {
                        "description": message,
                        "color": assets.colors.primary,
                    },
                ],
            });

            await interaction.reply({
                "embeds": [
                    {
                        "description": `${assets.icons.check} Message sent in ${msg.url}`,
                        "color": assets.colors.primary,
                    },
                ],
            });
        } else if (!channel) {
            await interaction.reply({
                "embeds": [
                    {
                        "description": message,
                        "color": assets.colors.primary,
                    },
                ],
            });
        };
    },
);