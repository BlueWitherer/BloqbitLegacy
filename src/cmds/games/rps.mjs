import { Command } from '../../classes.mjs';
import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export default new Command(
    new SlashCommandBuilder()
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
                    name: "Rock",
                    value: "r",
                },
                {
                    name: "Paper",
                    value: "p",
                },
                {
                    name: "Scissors",
                    value: "s",
                },
            )
            .setRequired(true)),
    async (interaction, assets, system, db) => {
        const moves = {
            r: "Rock",
            p: "Paper",
            s: "Scissors",
        };

        const human = "🎉 " + interaction.user?.username;
        const robot = "💔 " + interaction.client?.user?.username;

        let userMove = moves[interaction.options?.getString("move").toLowerCase()];
        let botMove = moves[Object.keys(moves)[Math.floor(Math.random() * Object.keys(moves).length)]];

        const outcomes = {
            Rock: { Scissors: human, Paper: robot },
            Scissors: { Paper: human, Rock: robot },
            Paper: { Rock: human, Scissors: robot },
        };

        let winner;

        if (userMove === botMove) {
            winner = '📛 Draw';
        } else {
            winner = outcomes[userMove][botMove];
        };

        await interaction.reply({
            "content": null,
            "embeds": [
                {
                    "author": {
                        "name": `${interaction.user?.username}`,
                        "icon_url": `${interaction.user?.displayAvatarURL({ "forceStatic": false, size: 64 })}`
                    },
                    "title": `${assets.icons.exclamation} Rock-Paper-Scissors`,
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
    });