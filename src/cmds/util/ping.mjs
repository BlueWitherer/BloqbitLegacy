import { Command, log } from "#bloqbit/include.ts";
import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export default new Command(
    new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Ping the bot, test its latency.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
        .setContexts([InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM])
        .setNSFW(false),
    async (interaction, assets, system, db) => {
        const ping = Date.now() - interaction.createdTimestamp;
        log.debug(`Pinging command in guild with ${ping}ms`);

        await interaction.reply({
            "embeds": [{
                "author": {
                    "name": interaction.user?.username,
                    "icon_url": interaction.user?.displayAvatarURL({ "forceStatic": false, size: 64 }),
                },
                "title": `${assets.icons.info} Ping`,
                "color": assets.colors.primary,
                "fields": [
                    {
                        "name": `Latency`,
                        "value": `${ping}ms`,
                        "inline": false,
                    },
                    {
                        "name": `API Latency`,
                        "value": `${Math.round(interaction.client?.ws?.ping)}ms`,
                        "inline": false,
                    },
                ],
            }],
            "flags": ["Ephemeral"],
        });
    },
);