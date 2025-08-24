import { ContextButton } from "#bloqbit/include.ts";
import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { ContextMenuCommandBuilder } from '@discordjs/builders';
import { ApplicationCommandType, PermissionFlagsBits } from 'discord-api-types/v10';

export default new ContextButton(
    new ContextMenuCommandBuilder()
        .setName("Quick Choice")
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
                        "description": `${assets.icons.update} *Adding choices...*`,
                        "color": assets.colors.primary,
                    },
                ],
                "flags": ["Ephemeral"],
            });

            await targetM.react('1️⃣'); // yes
            await targetM.react('2️⃣'); // no

            await interaction.editReply({
                "embeds": [
                    {
                        "description": `${assets.icons.check} Users may now choose.`,
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