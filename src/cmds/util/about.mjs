import { Command, log } from "#bloqbit/include.ts";
import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export default new Command(
    new SlashCommandBuilder()
        .setName("about")
        .setDescription("View detailed information about the current installation of Bloqbit.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
        .setContexts([InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM])
        .setNSFW(false),
    async (interaction, assets, system, db) => {
        await interaction.reply({
            "embeds": [
                {
                    "author": {
                        "name": interaction.client?.user?.username,
                        "icon_url": interaction.client?.user?.displayAvatarURL({ "forceStatic": false, "size": 512 }),
                    },
                    "title": `Bloqbit \`v${process.env.npm_package_version || "0.0.1"}\``,
                    "description": `Running on Discord bot client **\`${interaction.client?.user?.username}\`**\`#${interaction.client?.user?.discriminator}\` (\`${interaction.client?.user?.id}\`) on shard **#${interaction.client?.shard?.ids[0] || 0}**`,
                    "color": assets.colors.primary,
                    "fields": [
                        {
                            "name": "Node.js Version",
                            "value": `\`${process.version}\``,
                        },
                    ],
                    "footer": {
                        "text": `This command is in the works - expect more information added soon.`,
                    },
                },
            ],
        });
    },
)