import { ApplicationIntegrationType, Collection, InteractionContextType, TextChannel } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { Command } from '../../classes.mjs';

export default new Command(
    new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Clear amount of messages in channel.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .setNSFW(false)
        .addNumberOption((n) => n
            .setName("amount")
            .setDescription("Number of messages to clear.")
            .setMinValue(2)
            .setMaxValue(100)
            .setRequired(true))
        .addUserOption((u) => u
            .setName("user")
            .setDescription("User whose messages to clear.")
            .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async (interaction, assets, system, db) => {
        const amount = interaction.options?.getNumber("amount") || 0;
        const user = interaction.options?.getUser("user");

        const botMember = interaction.guild?.members?.cache?.get(interaction.client?.user?.id);

        if (!user && botMember?.permissions.has("ManageMessages")) {
            const msgs = await interaction.channel?.messages?.fetch({
                "limit": amount,
                "bulkDeletable": true,
            });

            if (interaction.channel.isTextBased()) await interaction.channel.bulkDelete(msgs);

            await interaction.reply({
                "content": "",
                "embeds": [
                    {
                        "author": {
                            "name": interaction.user?.username,
                            "icon_url": interaction.user?.displayAvatarURL({ "forceStatic": false, }),
                        },
                        "title": `${assets.icons.check} Messages Cleared`,
                        "color": assets.colors.primary,
                        "fields": [
                            {
                                "name": "Amount",
                                "value": `${msgs.size}`,
                                "inline": true,
                            },
                            {
                                "name": "Moderator",
                                "value": `<@!${interaction.user?.id}>`,
                                "inline": true,
                            },
                        ],
                    },
                ],
            });

            setTimeout(async () => {
                await interaction.deleteReply();
            }, 2500);

            return;
        } else if (user) {
            const msgs = await interaction.channel?.messages?.fetch({
                "limit": 100,
            });

            const filteredMsgs = msgs.filter((m) => m.author?.id === user.id);
            const memberMsgs = new Collection([...filteredMsgs.entries()].slice(0, amount));

            if (interaction.channel.isTextBased()) await interaction.channel?.bulkDelete(memberMsgs);

            await interaction.reply({
                "content": "",
                "embeds": [
                    {
                        "author": {
                            "name": interaction.user?.username,
                            "icon_url": interaction.user?.displayAvatarURL({ "forceStatic": false, }),
                        },
                        "title": `${assets.icons.check} Messages Cleared`,
                        "color": assets.colors.primary,
                        "fields": [
                            {
                                "name": "Amount",
                                "value": `${memberMsgs.size}`,
                                "inline": true,
                            },
                            {
                                "name": "Moderator",
                                "value": `<@!${interaction.user?.id}>`,
                                "inline": true,
                            },
                            {
                                "name": "User",
                                "value": `<@!${user.id}>`,
                                "inline": true,
                            },
                        ],
                    },
                ],
            });

            setTimeout(async () => {
                await interaction.deleteReply();
            }, 3000);

            return;
        };
    },
);