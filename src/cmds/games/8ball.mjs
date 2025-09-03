import { Command, log } from "#bloqbit/include.ts";
import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export default new Command(
    new SlashCommandBuilder()
        .setName("8-ball")
        .setDescription("Ask the magic 8-ball a question, and it will totally respond with truth.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
        .setContexts([InteractionContextType.Guild, InteractionContextType.PrivateChannel, InteractionContextType.BotDM])
        .setNSFW(false)
        .addStringOption((o) => o
            .setName("question")
            .setDescription("Your question.")
            .setRequired(true)),
    async (interaction, assets, system, db) => {
        const question = interaction.options?.getString("question", true);

        await interaction.reply({
            "embeds": [
                {
                    "description": `:8ball: *Asking the magic 8-ball...*`,
                    "color": assets.colors.tertiary,
                },
            ],
        });

        log.debug(`[I] Asking the magic 8-ball a question for ${interaction.user?.username}...`);

        const responses = [
            "It is certain.",
            "It is decidedly so.",
            "Without a doubt.",
            "Yes - definitely.",
            "You may rely on it.",
            "As I see it, yes.",
            "Most likely.",
            "Outlook good.",
            "Yes.",
            "Signs point to yes.",
            "Reply hazy, try again.",
            "Ask again later.",
            "Better not tell you now.",
            "Cannot predict now.",
            "Concentrate and ask again.",
            "Don't count on it.",
            "My reply is no.",
            "My sources say no.",
            "Outlook not so good.",
            "Very doubtful."
        ];

        const response = responses[Math.floor(Math.random() * responses.length)];

        log.info(`[O] 8-ball responded to question from ${interaction.user?.username} with '${response}'`);

        await interaction.editReply({
            "embeds": [
                {
                    "author": {
                        "name": interaction.user?.username,
                        "icon_url": interaction.user?.displayAvatarURL({ "forceStatic": false, size: 64 }),
                    },
                    "title": `:8ball: The Magic 8-Ball`,
                    "color": assets.colors.primary,
                    "fields": [
                        {
                            "name": `Question`,
                            "value": `*${question}*`,
                            "inline": false,
                        },
                        {
                            "name": `Answer`,
                            "value": `**${response}**`,
                            "inline": false,
                        },
                    ],
                },
            ],
        });
    },
);