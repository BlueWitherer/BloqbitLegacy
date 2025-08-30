import { Command, log } from "#bloqbit/include.ts";
import { ApplicationIntegrationType, GuildMember, InteractionContextType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export default new Command(
    new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("View a user's profile picture.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
        .setContexts([InteractionContextType.Guild])
        .setNSFW(false)
        .addUserOption((o) => o
            .setName("user")
            .setDescription("The user whose profile picture to view.")
            .setRequired(false)),
    async (interaction, assets, system, db) => {
        const targetU = interaction.options?.getUser("user", false);
        const targetM = interaction.options?.getMember("user");

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
);