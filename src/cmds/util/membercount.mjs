import { Command } from '../../classes.js';
import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import resolve from '../../modules/resolve.js';

export default new Command(
    new SlashCommandBuilder()
        .setName("member-count")
        .setDescription("View the member count of the server.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .setNSFW(false),
    async (interaction, assets, system, db) => {
        const memberCount = interaction.guild?.memberCount ?? 0;
        const botCount = interaction.guild?.members?.cache?.filter((m) => m.user.bot).size ?? 0;

        await interaction.reply({
            "embeds": [
                {
                    "color": assets.colors.primary,
                    "fields": [
                        {
                            "name": "Member Count",
                            "value": `# ${memberCount}`,
                            "inline": true,
                        },
                    ],
                    "footer": {
                        "text": `${botCount} ${resolve.isPlural(botCount, "Bot", "Bots")}`,
                    },
                },
            ],
            "ephemeral": true,
        });

        return;
    },
)