import { ContextButton } from "#bloqbit/include.ts";
import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { ContextMenuCommandBuilder } from '@discordjs/builders';
import { ApplicationCommandType, PermissionFlagsBits } from 'discord-api-types/v10';

export default new ContextButton(
    new ContextMenuCommandBuilder()
        .setName("Poll This")
        .setType(ApplicationCommandType.Message)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild]),
    async (interaction, assets, system, db) => {
        const targetM = interaction.isMessageContextMenuCommand() ? interaction.targetMessage : null;

        if (targetM) {
            await interaction.reply({
                "embeds": [
                    {
                        "description": `${assets.icons.update} *Adding reactions for quick poll...*`,
                        "color": assets.colors.primary,
                    },
                ],
            });

            await targetM.react('1409005079092134040'); // yes
            await targetM.react('1409005076604911626'); // meh
            await targetM.react('1409005081491411015'); // no

            await interaction.editReply({
                "embeds": [
                    {
                        "description": `${assets.icons.check} The quick poll has been created.`,
                        "color": assets.colors.primary,
                    },
                ],
            });
        } else {
            await interaction.reply({
                "content": `${assets.icons.xmark} Unable to fetch the target message.`,
                "flags": ["Ephemeral"],
            });
        };
    },
)