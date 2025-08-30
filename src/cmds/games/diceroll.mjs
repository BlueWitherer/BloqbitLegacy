import { Command, log } from "#bloqbit/include.ts";
import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export default new Command(
    new SlashCommandBuilder()
        .setName("dice-roll")
        .setDescription("Roll a number of dice.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
        .setContexts([InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM])
        .setNSFW(false)
        .addNumberOption((n) => n
            .setName("amount")
            .setDescription("The amount of dice to roll.")
            .setMinValue(1)
            .setMaxValue(9)
            .setRequired(false)),
    async (interaction, assets, system, db) => {
        await interaction.reply({
            "embeds": [
                {
                    "description": `${assets.icons.update} *Rolling dice...*`,
                    "color": assets.colors.tertiary,
                },
            ],
        });

        const amount = interaction.options?.getNumber("amount", false) || 1;

        log.debug(`[I] Rolling ${amount} dice for ${interaction.user?.username}...`);

        /**
         * @type {import("discord.js").EmbedField[]}
         */
        const rolls = [];
        let total = 0;

        for (let i = 1; i <= amount; i++) {
            const die = Math.floor(Math.random() * 6) + 1;

            rolls.push({
                "name": `#${i}`,
                "value": `:game_die: ${die}`,
                "inline": true,
            });

            total += die;
        };

        rolls.push({
            "name": "Total Rolled",
            "value": `**:1234: ${total}**`,
            "inline": false,
        });

        log.info(`[O] Rolled ${amount} dice for ${interaction.user?.username} with total ${total}`);

        await interaction.editReply({
            "embeds": [
                {
                    "title": `${assets.icons.exclamation} Dice Roll`,
                    "description": `You rolled ${amount} dice.`,
                    "color": assets.colors.primary,
                    "fields": rolls,
                },
            ],
        });
    },
);