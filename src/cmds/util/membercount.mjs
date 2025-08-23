import { Command, log } from "#bloqbit/include.ts";
import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import resolve from "#bloqbit/modules/resolve.mjs";

export default new Command(
    new SlashCommandBuilder()
        .setName("member-count")
        .setDescription("View the member count of this server.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .setNSFW(false),
    async (interaction, assets, system, db) => {
        const memberCount = interaction.guild?.memberCount ?? 0;
        const botCount = interaction.guild?.members?.cache?.filter((m) => m.user.bot).size ?? 0;

        await interaction.reply({
            "embeds": [
                {
                    "author": {
                        "name": `${interaction.guild?.name ?? "Unknown Server"}`,
                        "icon_url": `${interaction.guild?.iconURL({ "forceStatic": false, "size": 128 }) ?? assets.images.defaults.guild}`,
                    },
                    "color": assets.colors.primary,
                    "fields": [
                        {
                            "name": "Member Count",
                            "value": `**\`\`\`${memberCount}\`\`\`**`,
                            "inline": true,
                        },
                    ],
                    "footer": {
                        "text": `${botCount} ${resolve.isPlural(botCount, "Bot", "Bots")}`,
                    },
                },
            ],
        });

        return;
    },
);