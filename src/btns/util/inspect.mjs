import { ContextButton, log } from "#bloqbit/include.ts";
import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { ContextMenuCommandBuilder } from '@discordjs/builders';
import { ApplicationCommandType, PermissionFlagsBits } from 'discord-api-types/v10';

export default new ContextButton(
    new ContextMenuCommandBuilder()
        .setName("Inspect Message")
        .setType(ApplicationCommandType.Message)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
        .setContexts([InteractionContextType.Guild, InteractionContextType.PrivateChannel]),
    async (interaction, assets, system, db) => {
        const targetM = interaction.isMessageContextMenuCommand() ? interaction.targetMessage : null;

        if (targetM) {
            await interaction.reply({
                "embeds": [
                    {
                        "title": `:information_source: Message Inspection`,
                        "description": `\`\`\`txt\n${targetM.content}\n\`\`\``,
                        "color": assets.colors.primary,
                        "fields": [
                            {
                                "name": "Jump",
                                "value": `[Proceed](${targetM.url})`,
                                "inline": false,
                            },
                            {
                                "name": "Author",
                                "value": `<@!${targetM.author?.id}>`,
                                "inline": true,
                            },
                            {
                                "name": "Message ID",
                                "value": `\`${targetM.id}\``,
                                "inline": true,
                            },
                            {
                                "name": "Originally Sent",
                                "value": `<t:${Math.floor(targetM.createdTimestamp / 1000)}:F> • <t:${Math.floor(targetM.createdTimestamp / 1000)}:R>`,
                                "inline": true,
                            },
                        ]
                    },
                ],
                "flags": ["Ephemeral"],
            });
        } else {
            log.error(`Failed to fetch target message for inspection in guild ${interaction.guild?.id} (${interaction.guild?.name}) by user ${interaction.user?.id} (${interaction.user?.username}).`);

            await interaction.reply({
                "content": `:x: Unable to fetch the target message.`,
                "flags": ["Ephemeral"],
            });
        };
    },
)