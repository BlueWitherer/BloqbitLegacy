import SysAssets from '../../assets.json' with { type: 'json' };
import { SaveData, Config } from '../../classes.mjs';
import { ApplicationIntegrationType, ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export default {
    data: new SlashCommandBuilder()
        .setName("server-info")
        .setDescription("View information about the server.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setNSFW(false),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction The interaction for the slash command.
     * @param {typeof SysAssets} assets The configuration of the client's visual assets.
     * @param {Config} system The settings model for the bot's configuration.
     * @param {SaveData} db The database information.
     * 
     * @returns {Promise<void>}
     */
    execute: async (interaction, assets, system, db) => {
        let data = [];

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

        var createdAt = Math.floor(interaction.guild?.createdTimestamp / 1000);

        await interaction.reply({
            "content": null,
            "embeds": [
                {
                    "author": {
                        "name": `${interaction.user?.username}`,
                        "icon_url": `${interaction.user?.displayAvatarURL({ forceStatic: false })}`,
                    },
                    "title": `${data}${interaction.guild?.name}`,
                    "description": `${interaction.guild?.description}`,
                    "thumbnail": {
                        "url": `${interaction.guild?.iconURL({ "forceStatic": false, size: 1024 })}`,
                    },
                    "image": {
                        "url": interaction.guild?.bannerURL({ size: 1024 }),
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
                            "value": `<@!${interaction.guild?.owner?.id}> (**${(await interaction.guild?.fetchOwner()).user?.username}**, ${interaction.guild?.owner?.id})`,
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
                            "value": `<t:${createdAt}:F> | <t:${createdAt}:R>`,
                            "inline": true,
                        },
                    ],
                },
            ],
        });

        return;
    },
};