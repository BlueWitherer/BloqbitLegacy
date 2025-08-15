import { Command } from '../../include.js';
import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export default new Command(
    new SlashCommandBuilder()
        .setName("time")
        .setDescription("View a timestamp.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .setNSFW(false)
        .addNumberOption((o) => o
            .setName("time")
            .setDescription("The unix timestamp to view.")
            .setRequired(false)),
    async (interaction, assets, system, db) => {
        const customUnixDate = interaction.options?.getNumber("time");

        const getUnixDate = Math.floor(new Date().getTime() / 1000);
        const localDateString = String(new Date().toLocaleDateString() + `, ` + new Date().toLocaleTimeString());

        if (customUnixDate) {
            await interaction.reply({
                "content": "",
                "embeds": [
                    {
                        "author": {
                            "name": interaction.user?.username,
                            "icon_url": interaction.user?.displayAvatarURL({ "forceStatic": false, size: 64 })
                        },
                        "title": `${assets.icons.info} Defined Time`,
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
                                "value": `**\`${customUnixDate}\`**`,
                                "inline": true,
                            },
                        ],
                        "footer": {
                            "text": `The unix timestamp will automatically show up as your timezone's`,
                        },
                    },
                ],
            });

            return;
        } else {
            await interaction.reply({
                "content": "",
                "embeds": [
                    {
                        "author": {
                            "name": interaction.user?.username,
                            "icon_url": interaction.user?.displayAvatarURL({ "forceStatic": false, size: 64 })
                        },
                        "title": `${assets.icons.info} Current Time`,
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
                                "value": `**\`${getUnixDate}\`**`,
                                "inline": true,
                            },
                        ],
                        "footer": {
                            "text": `The unix timestamp will automatically show up as your timezone's`,
                        },
                    },
                ],
            });

            return;
        };
    },
);