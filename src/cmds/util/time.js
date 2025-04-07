import SysAssets from '../../assets.json' with { type: 'json' };
import { SaveData, Config } from '../../classes.mjs';
import { ApplicationIntegrationType, ChatInputCommandInteraction, InteractionContextType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

module.exports = {
    data: new SlashCommandBuilder()
        .setName("time")
        .setDescription("View a timestamp.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .setNSFW(false)
        .addNumberOption((n) => n
            .setName("time")
            .setDescription("The unix timestamp to view.")
            .setRequired(false)),
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
        const customUnixDate = interaction.options?.getNumber("time");

        var getUnixDate = Math.floor(new Date().getTime() / 1000);
        var localDateString = String(new Date().toLocaleDateString() + `, ` + new Date().toLocaleTimeString());

        if (customUnixDate) {
            await interaction.reply({
                "content": null,
                "embeds": [
                    {
                        "author": {
                            "name": interaction.user?.username,
                            "icon_url": interaction.user?.displayAvatarURL({ "forceStatic": false, size: 1024 })
                        },
                        "title": `${assets.icons.info} | Defined Time`,
                        "color": assets.colors.primary,
                        "fields": [
                            {
                                "name": `Time`,
                                "value": `<t:${customUnixDate}:F>`,
                                "inline": false,
                            },
                            {
                                "name": `Since`,
                                "value": `<t:${customUnixDate}:R>`,
                                "inline": true,
                            },
                            {
                                "name": `Unix Timestamp`,
                                "value": `${customUnixDate}`,
                                "inline": true,
                            },
                        ],
                        "footer": {
                            "text": `The unix timestamp will automatically show up as your timezone's.`,
                        },
                    },
                ],
            });

            return;
        } else {
            await interaction.reply({
                "content": null,
                "embeds": [
                    {
                        "author": {
                            "name": interaction.user?.username,
                            "icon_url": interaction.user?.displayAvatarURL({ "forceStatic": false, size: 1024 })
                        },
                        "title": `${assets.icons.info} | Current Time`,
                        "color": assets.colors.primary,
                        "fields": [
                            {
                                "name": `Your Time`,
                                "value": `<t:${getUnixDate}:F>`,
                                "inline": false,
                            },
                            {
                                "name": `Bot Host Time`,
                                "value": `${localDateString}`,
                                "inline": true,
                            },
                            {
                                "name": `Unix Timestamp`,
                                "value": String(getUnixDate),
                                "inline": true,
                            },
                        ],
                        "footer": {
                            "text": `The unix timestamp will automatically show up as your timezone's.`,
                        },
                    },
                ],
            });

            return;
        };
    },
};