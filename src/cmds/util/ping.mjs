import { Command, log } from "#bloqbit/include";
import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export default new Command(
    new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Ping the bot, test its latency.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .setNSFW(false),
    async (interaction, assets, system, db) => {
        await interaction.reply({
            "content": "",
            "flags": [
                "Ephemeral",
            ],
            "embeds": [{
                "author": {
                    "name": interaction.user?.username,
                    "icon_url": interaction.user?.displayAvatarURL({ "forceStatic": false, size: 64 })
                },
                "title": `${assets.icons.info} Ping`,
                "color": assets.colors.primary,
                "fields": [
                    {
                        "name": `Latency`,
                        "value": `${Date.now() - interaction.createdTimestamp}ms`,
                        "inline": false
                    },
                    {
                        "name": `API Latency`,
                        "value": `${Math.round(interaction.client?.ws.ping)}ms`,
                        "inline": false
                    },
                ],
            }],
        });

        return;
    },
);