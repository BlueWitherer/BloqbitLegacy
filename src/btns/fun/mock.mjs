import { ContextButton, log } from "#bloqbit/include.ts";
import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ContextMenuCommandBuilder } from '@discordjs/builders';
import { ApplicationCommandType, ButtonStyle } from 'discord-api-types/v10';

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
                            "description": `:arrows_counterclockwise: *Mocking ${targetM.author?.username}...*`,
                            "color": assets.colors.primary,
                        },
                    ],
                    "flags": ["Ephemeral"],
                });

                const reply = await interaction.followUp({
                    "content": mocked,
                    "allowedMentions": {
                        "repliedUser": false,
                    },
                });

                const button = new ButtonBuilder()
                    .setLabel("View Message")
                    .setStyle(ButtonStyle.Primary)
                    .setURL(reply.url);
                const row = new ActionRowBuilder().addComponents(button);

                await interaction.editReply({
                    "embeds": [
                        {
                            "description": `:white_check_mark: That ${targetM.author?.username} person has been mocked! Hehehe...`,
                            "color": assets.colors.primary,
                        },
                    ],
                    "components": [row.toJSON()],
                });
            } catch (err) {
                console.trace(err);
                await interaction.reply({
                    "embeds": [
                        {
                            "description": `:x: Bot is not installed in this server or is missing permissions.`,
                            "color": assets.colors.secondary,
                        },
                    ],
                });
            };
        } else {
            await interaction.reply({
                "content": `:x: Unable to fetch the target message.`,
                "flags": ["Ephemeral"],
            });
        };
    },
)