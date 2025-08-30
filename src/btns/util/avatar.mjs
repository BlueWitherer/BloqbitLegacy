import { ContextButton, log } from "#bloqbit/include.ts";
import { ApplicationIntegrationType, GuildMember, InteractionContextType } from 'discord.js';
import { ContextMenuCommandBuilder } from '@discordjs/builders';
import { ApplicationCommandType, PermissionFlagsBits } from 'discord-api-types/v10';

export default new ContextButton(
    new ContextMenuCommandBuilder()
        .setName("View Avatar")
        .setType(ApplicationCommandType.User)
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
        .setContexts([InteractionContextType.Guild]),
    async (interaction, assets, system, db) => {
        const targetU = interaction.isUserContextMenuCommand() ? interaction.targetUser : null;
        const targetM = interaction.isUserContextMenuCommand() ? interaction.targetMember : null;

        let username = "";

        let globalAv = "";
        let serverAv = "";

        if (targetU && targetM) {
            username = targetU.username;

            globalAv = targetU.displayAvatarURL({ "forceStatic": false, size: 1024 });
            serverAv = targetM instanceof GuildMember ? targetM.displayAvatarURL({ "forceStatic": false, size: 1024 }) : targetU.displayAvatarURL({ "forceStatic": false, size: 1024 })
        } else {
            username = interaction.user?.username;

            globalAv = interaction.user?.displayAvatarURL({ "forceStatic": false, size: 1024 });
            serverAv = interaction.member instanceof GuildMember ? interaction.member?.displayAvatarURL({ "forceStatic": false, size: 1024 }) : interaction.user?.displayAvatarURL({ "forceStatic": false, size: 1024 });
        };

        await interaction.reply({
            "content": (targetU && targetM) ? "" : `${assets.icons.exclamation} Failed to get target user`,
            "embeds": [
                {
                    "title": `${assets.icons.info} ${username}'s Avatar`,
                    "color": assets.colors.primary,
                    "thumbnail": {
                        "url": globalAv,
                        "width": 1024,
                        "height": 1024,
                    },
                    "image": {
                        "url": serverAv,
                        "width": 1024,
                        "height": 1024,
                    },
                },
            ],
            "flags": ["Ephemeral"],
        });
    },
)