import { Command } from '../../classes.mjs';
import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';

export default new Command(
    new SlashCommandBuilder()
        .setName("invite")
        .setDescription("Create a permanent invite for this server.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .setNSFW(false)
        .addChannelOption((c) => c
            .setName("channel")
            .setDescription("Channel to create the invite in.")
            .addChannelTypes([ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildStageVoice, ChannelType.GuildAnnouncement, ChannelType.GuildForum, ChannelType.GuildMedia]))
        .setDefaultMemberPermissions(PermissionFlagsBits.CreateInstantInvite),
    async (interaction, assets, system, db) => {
        const channel = interaction.options?.getChannel("channel", false);

        let invite = null;

        if (channel) {
            if ((channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement) && 'createInvite' in channel) {
                invite = await channel.createInvite({
                    maxAge: 0,
                    maxUses: 0,
                    unique: true,
                });
            } else {
                throw new Error("Selected channel does not support creating invites.");
            };
        } else {
            if ((interaction.channel?.type === ChannelType.GuildText || interaction.channel?.type === ChannelType.GuildAnnouncement) && 'createInvite' in interaction.channel) {
                invite = await interaction.channel.createInvite({
                    maxAge: 0,
                    maxUses: 0,
                    unique: true,
                });
            } else {
                throw new Error("The current channel does not support creating invites.");
            };
        };

        if (invite) {
            await interaction.reply({
                "content": "",
                "embeds": [
                    {
                        "description": `${assets.icons.check} **${interaction.user?.username}** - Successfully created permanent invite code \`${invite.code}\``,
                        "color": assets.colors.primary,
                    },
                ],
            });

            return;
        } else {
            await interaction.reply({
                "content": "",
                "embeds": [
                    {
                        "description": `${assets.icons.xmark} **${interaction.user?.username}** - Failed to create invite code.`,
                        "color": assets.colors.primary,
                    },
                ],
            });

            return;
        };
    });