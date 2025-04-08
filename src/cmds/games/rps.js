import SysAssets from '../../assets.json' with { type: 'json' };
import { SaveData, Config } from '../../classes.mjs';
import { ApplicationIntegrationType, ChatInputCommandInteraction, InteractionContextType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rps")
        .setDescription("Play a match of Rock-Paper-Scissors.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .setNSFW(false)
        .addStringOption((s) => s
            .setName("move")
            .setDescription("What you'll play.")
            .addChoices(
                {
                    name: "rock", value: "r",
                },
                {
                    name: "paper", value: "p",
                },
                {
                    name: "scissors", value: "s",
                },
            ).setRequired(true)),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction The interaction for the slash command.
     * @param {typeof SysAssets} assets The configuration of the client's visual assets.
     * @param {Config} system The settings model for the bot's configuration.
     * @param {SaveData} db The database information.
     * 
     * @returns {Promise<void>}
     */
    execute: async (interaction, assets, system, db) => {

        const moves = ['r', 'p', 's'];

        const human = interaction.user?.username;
        const robot = interaction.client?.user?.username;

        let userMove = interaction.options?.getString("move");
        let botMove = moves[Math.floor(Math.random() * moves.length)];

        switch (botMove) {
            case 'r':
                botMove = "Rock"
                break;

            case 'p':
                botMove = "Paper"
                break;

            case 's':
                botMove = "Scissors"
                break;
        };

        switch (userMove.toLowerCase()) {
            case 'r':
                userMove = "Rock"
                break;

            case 'p':
                userMove = "Paper"
                break;

            case 's':
                userMove = "Scissors"
                break;
        };

        let winner = 'Unspecified.'

        if (userMove === 'Rock' && (botMove === 'Scissors')) {
            winner = human;
        } else if (userMove === 'Scissors' && (botMove === 'Rock')) {
            winner = robot;
        } else if (userMove === 'Scissors' && (botMove === 'Paper')) {
            winner = human;
        } else if (userMove === 'Paper' && (botMove === 'Scissors')) {
            winner = robot;
        } else if (userMove === 'Paper' && (botMove === 'Rock')) {
            winner = human;
        } else if (userMove === 'Rock' && (botMove === 'Paper')) {
            winner = robot;
        } else if (userMove === botMove) {
            winner = 'Draw';
        };

        await interaction.reply({
            "content": null,
            "embeds": [
                {
                    "author": {
                        "name": `${interaction.user?.username}`,
                        "icon_url": `${interaction.user?.displayAvatarURL({ "forceStatic": false, size: 1024 })}`
                    },
                    "title": `${assets.icons.exclamation} | Rock-Paper-Scissors`,
                    "color": assets.colors.primary,
                    "fields": [
                        {
                            "name": `${interaction.user?.username}'s Move`,
                            "value": `${userMove}`,
                            "inline": false,
                        },
                        {
                            "name": `${interaction.client?.user?.username}'s Move`,
                            "value": `${botMove}`,
                            "inline": false,
                        },
                        {
                            "name": "Winner",
                            "value": `**${winner}**`,
                            "inline": false,
                        },
                    ],
                },
            ],
        });

        return;
    },
};