import SysAssets from '../../assets.json' with { type: 'json' };
import { SaveDataClient, Config } from '../../classes.mjs';
import { ApplicationIntegrationType, ChatInputCommandInteraction, InteractionContextType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export default {
    data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("View a user's profile picture.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .setNSFW(false)
        .addUserOption((u) => u
            .setName("user")
            .setDescription("The user whose profile picture to view.")
            .setRequired(false)),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction The interaction for the slash command.
     * @param {typeof SysAssets} assets The configuration of the client's visual assets.
     * @param {Config} system The settings model for the bot's configuration.
     * @param {SaveDataClient} db The database information.
     * 
     * @returns {Promise<void>}
     */
    execute: async (interaction, assets, system, db) => {
        const User = interaction.options?.getUser("user");
        const Member = interaction.options?.getMember("user");

        if (User) {
            await interaction.reply({
                "content": null,
                "embeds": [
                    {
                        "author": {
                            "name": `${interaction.user?.username}`,
                            "icon_url": `${interaction.user?.displayAvatarURL({ forceStatic: false })}`
                        },
                        "title": `${assets.icons.info} | ${User.username}'s Avatar`,
                        "color": assets.colors.primary,
                        "image": {
                            "url": `${Member.avatar}`,
                            "width": 1024,
                            "height": 1024,
                        },
                        "thumbnail": {
                            "url": User.displayAvatarURL({ "forceStatic": false, size: 1024 }),
                            "width": 1024,
                            "height": 1024,
                        },
                    },
                ],
            });

            return;
        } else {
            await interaction.reply({
                "content": null,
                "embeds": [
                    {
                        "author": {
                            "name": `${interaction.user?.username}`,
                            "icon_url": `${interaction.user?.displayAvatarURL({ forceStatic: false })}`
                        },
                        "title": `${assets.icons.info} | ${interaction.user?.username}'s Avatar`,
                        "color": assets.colors.primary,
                        "image": {
                            "url": `${interaction.member?.avatar}`,
                            "width": 1024,
                            "height": 1024,
                        },
                        "thumbnail": {
                            "url": interaction.user?.displayAvatarURL({ "forceStatic": false, size: 1024 }),
                            "width": 1024,
                            "height": 1024,
                        },
                    },
                ],
            });

            return;
        };
    },
};