import { ContextButton } from "#bloqbit/include.ts";
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
                        "author": {
                            "name": `${interaction.user?.username}`,
                            "icon_url": `${interaction.user?.displayAvatarURL({ forceStatic: false })}`,
                        },
                        "title": `${assets.icons.info} Message Inspection`,
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
            await interaction.reply({
                "content": `${assets.icons.xmark} Unable to fetch the target message.`,
                "flags": ["Ephemeral"],
            });
        };
    },
)