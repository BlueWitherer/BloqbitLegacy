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

        if (targetU) {
            await interaction.reply({
                "embeds": [
                    {
                        "author": {
                            "name": `${interaction.user?.username}`,
                            "icon_url": `${interaction.user?.displayAvatarURL({ forceStatic: false })}`
                        },
                        "title": `${assets.icons.info} ${targetU.username}'s Avatar`,
                        "color": assets.colors.primary,
                        "image": {
                            "url": `${targetM instanceof GuildMember ? targetM.displayAvatarURL({ "forceStatic": false, size: 1024 }) : targetU.displayAvatarURL({ "forceStatic": false, size: 1024 })}`,
                            "width": 1024,
                            "height": 1024,
                        },
                        "thumbnail": {
                            "url": targetU.displayAvatarURL({ "forceStatic": false, size: 1024 }),
                            "width": 1024,
                            "height": 1024,
                        },
                    },
                ],
                "flags": ["Ephemeral"],
            });
        } else {
            log.error(`Failed to fetch target user for avatar inspection in guild ${interaction.guild?.id} (${interaction.guild?.name}) by user ${interaction.user?.id} (${interaction.user?.username}).`);

            await interaction.reply({
                "content": `${assets.icons.xmark} Unable to fetch the target user.`,
                "flags": ["Ephemeral"],
            });
        };
    },
)