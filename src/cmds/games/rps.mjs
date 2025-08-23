import { Command, log } from "#bloqbit/include.ts";
import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export default new Command(
    new SlashCommandBuilder()
        .setName("rps")
        .setDescription("Play a match of Rock-Paper-Scissors.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
        .setContexts([InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM])
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
        await interaction.reply({
            "embeds": [
                {
                    "description": `${assets.icons.update} *${interaction.client?.user?.displayName} is making a move...*`,
                    "color": assets.colors.tertiary,
                },
            ],
        });

        log.debug(`[I] Picking RPS move for ${interaction.user?.username}...`);

        /**
         * @type {Record<string, string>}
         * @description Moves for the game
         */
        const moves = {
            r: "Rock",
            p: "Paper",
            s: "Scissors",
        };

        const human = "🎉 " + interaction.user?.username;
        const robot = "💔 " + interaction.client?.user?.username;

        const userMove = moves[interaction.options?.getString("move", true).toLowerCase()];
        const botMove = moves[Object.keys(moves)[Math.floor(Math.random() * Object.keys(moves).length)]];

        /**
         * @type {Record<string, Record<string, string>>}
         * @description Outcomes of the game
         */
        const outcomes = {
            Rock: { Scissors: human, Paper: robot },
            Scissors: { Paper: human, Rock: robot },
            Paper: { Rock: human, Scissors: robot },
        };

        log.debug(`[II] ${interaction.user?.username} played ${userMove}, bot played ${botMove}`);

        let winner;

        if (userMove === botMove) {
            winner = '📛 Draw';
        } else {
            winner = outcomes[userMove][botMove];
        };

        log.info(`[O] RPS winner is ${winner}`);

        await interaction.editReply({
            "embeds": [
                {
                    "author": {
                        "name": `${interaction.user?.username}`,
                        "icon_url": `${interaction.user?.displayAvatarURL({ "forceStatic": false, size: 64 })}`,
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
    },
);