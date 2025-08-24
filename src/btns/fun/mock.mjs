import { ContextButton, log } from "#bloqbit/include.ts";
import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { ContextMenuCommandBuilder } from '@discordjs/builders';
import { ApplicationCommandType, PermissionFlagsBits } from 'discord-api-types/v10';

export default new ContextButton(
    new ContextMenuCommandBuilder()
        .setName("Mock Them")
        .setType(ApplicationCommandType.Message)
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
        .setContexts([InteractionContextType.Guild, InteractionContextType.PrivateChannel]),
    async (interaction, assets, system, db) => {
        const targetM = interaction.isMessageContextMenuCommand() ? interaction.targetMessage : null;

        if (targetM) {
            const mocked = targetM.content.split('').map((c) => Math.random() > 0.5 ? c.toLowerCase() : c.toUpperCase()).join('');

            try {
                await interaction.reply({
                    "embeds": [
                        {
                            "description": `${assets.icons.update} *Mocking ${targetM.author?.username}...*`,
                            "color": assets.colors.primary,
                        },
                    ],
                    "flags": ["Ephemeral"],
                });

                await interaction.followUp({
                    "content": mocked,
                    "allowedMentions": {
                        "repliedUser": false,
                    },
                });

                await interaction.editReply({
                    "embeds": [
                        {
                            "description": `${assets.icons.check} That ${targetM.author?.username} person has been mocked! Hehehe...`,
                            "color": assets.colors.primary,
                        },
                    ]
                })
            } catch (err) {
                log.trace(err);
                await interaction.reply({
                    "embeds": [
                        {
                            "description": `${assets.icons.xmark} Bot is not installed in this server or is missing permissions.`,
                            "color": assets.colors.secondary,
                        },
                    ],
                });
            };
        } else {
            await interaction.reply({
                "content": `${assets.icons.xmark} Unable to fetch the target message.`,
                "flags": ["Ephemeral"],
            });
        };
    },
)