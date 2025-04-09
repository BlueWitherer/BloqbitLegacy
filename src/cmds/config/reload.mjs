import { Command } from '../../classes.mjs';
import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import fetch from '../../modules/fetch.mjs';

export default new Command(
    new SlashCommandBuilder()
        .setName("reload")
        .setDescription("Refresh the server's save data.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .setNSFW(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async (interaction, assets, system, db) => {
        const registered = fetch.fetchGuild(interaction.guild?.id);

        if (registered) {
            console.log(`Fetched guild ${interaction.guild?.name} (${interaction.guild?.id}) successfully.`);

            await interaction.reply({
                "content": "",
                "embeds": [
                    {
                        "title": `${assets.icons.check} Server Registered`,
                        "description": `Your server, *${interaction.guild?.name}*, has been successfully registered to our database and commands are now available for use.`,
                        "color": assets.colors.primary,
                    },
                ],
            });
        } else {
            try {
                const revised = await fetch.reviseGuild(db, interaction.guildId);

                if (revised) {
                    console.log(`Manually registered guild ${interaction.guild?.name} (${interaction.guild?.id}) successfully.`);

                    await interaction.reply({
                        "content": "",
                        "embeds": [
                            {
                                "title": `${assets.icons.check} Server Registered`,
                                "description": `Your server, *${interaction.guild?.name}*, has been successfully registered to our database and commands are now available for use.`,
                                "color": assets.colors.primary,
                            },
                        ],
                    });
                } else {
                    console.error(`Manual registration of guild ${interaction.guild?.name} (${interaction.guild?.id}) failed.`);

                    await interaction.reply({
                        "content": "",
                        "embeds": [
                            {
                                "title": `${assets.icons.xmark} Failed To Register`,
                                "description": `We faced an issue registering your guild, *${interaction.guild?.name}*. We apologize for the inconvenience, please try again later.`,
                                "color": assets.colors.secondary,
                            },
                        ],
                    });
                };
            } catch (err) {
                await fetch.commandErrorResponse(interaction, assets);

                console.error(err);
            };
        };
    });