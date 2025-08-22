import { Command, log } from "#bloqbit/include.ts";
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
        } else if (interaction.guild?.partnered) {
            data.push('<:badge_partner:824328233964011581> ');
        } else if (interaction.guild?.verified) {
            data.push('<:badge_verified:824328233931505714> ');
        } else if (interaction.guild?.verified && interaction.guild?.partnered) {
            data.push('<:badge_verifiedpartnered:824329742597226608> ');
        };

        const createdAt = Math.floor((interaction.guild?.createdTimestamp ?? 0) / 1000);

        const owner = await interaction.guild?.fetchOwner();

        if (owner) {
            await interaction.reply({
                "embeds": [
                    {
                        "author": {
                            "name": `${interaction.user?.username ?? "Unknown User"}`,
                            "icon_url": `${interaction.user?.displayAvatarURL({ forceStatic: false }) ?? ""}`,
                        },
                        "title": `${data.join("")}${interaction.guild?.name ?? "Unknown Server"}`,
                        "description": `${interaction.guild?.description ?? "-# *No description*"}`,
                        "thumbnail": {
                            "url": `${interaction.guild?.iconURL({ "forceStatic": false, size: 64 }) ?? assets.images.defaults.guild}`,
                        },
                        "image": {
                            "url": interaction.guild?.bannerURL({ size: 512 }) ?? "",
                        },
                        "color": assets.colors.primary ?? 0x000000,
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
        };

        return;
    },
);