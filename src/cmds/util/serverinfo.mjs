import { Command } from '../../classes.mjs';
import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export default new Command(
    new SlashCommandBuilder()
        .setName("server-info")
        .setDescription("View information about the server.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .setNSFW(false),
    async (interaction, assets, system, db) => {
        const data = [];

        if (interaction.guild?.premiumSubscriptionCount === 1) {
            data.push('<:boosttier0:824330219757895760> ');
        } else if (interaction.guild?.premiumTier === 1) {
            data.push('<:boosttier1:824328233305636926> ');
        } else if (interaction.guild?.premiumTier === 2) {
            data.push('<:boosttier2:824328233663070228> ');
        } else if (interaction.guild?.premiumTier === 3) {
            data.push('<:boosttier3:824328233675784252> ');
        } else if (interaction.guild?.partnered === true) {
            data.push('<:badge_partner:824328233964011581> ');
        } else if (interaction.guild?.verified === true) {
            data.push('<:badge_verified:824328233931505714> ');
        } else if (interaction.guild?.verified === true && interaction.guild?.partnered === true) {
            data.push('<:badge_verifiedpartnered:824329742597226608> ');
        };

        const createdAt = Math.floor(interaction.guild?.createdTimestamp / 1000);

        const owner = await interaction.guild?.fetchOwner();

        await interaction.reply({
            "content": "",
            "embeds": [
                {
                    "author": {
                        "name": `${interaction.user?.username}`,
                        "icon_url": `${interaction.user?.displayAvatarURL({ forceStatic: false })}`,
                    },
                    "title": `${data}${interaction.guild?.name}`,
                    "description": `${interaction.guild?.description || "-# *No description*"}`,
                    "thumbnail": {
                        "url": `${interaction.guild?.iconURL({ "forceStatic": false, size: 64 })}`,
                    },
                    "image": {
                        "url": interaction.guild?.bannerURL({ size: 64 }),
                    },
                    "color": `${assets.colors.primary}`,
                    "fields": [
                        {
                            "name": "Server ID",
                            "value": `${interaction.guild?.id}`,
                            "inline": true,
                        },
                        {
                            "name": "Server Owner",
                            "value": `<@!${owner.user?.id}> (**${owner.user?.username}**, \`${owner.user?.id}\`)`,
                            "inline": true,
                        },
                        {
                            "name": "Moderation Level",
                            "value": `**${interaction.guild?.verificationLevel}**`,
                            "inline": true,
                        },
                        {
                            "name": "Boosts",
                            "value": `**${interaction.guild?.premiumTier}**\n**${interaction.guild?.premiumSubscriptionCount}** Boosts`,
                            "inline": true,
                        },
                        {
                            "name": "Member Count",
                            "value": `**${interaction.guild?.memberCount}** Members`,
                            "inline": true,
                        },
                        {
                            "name": "Date Created",
                            "value": `<t:${createdAt}:F> • <t:${createdAt}:R>`,
                            "inline": true,
                        },
                    ],
                },
            ],
        });

        return;
    });