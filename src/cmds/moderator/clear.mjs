import { ApplicationIntegrationType, Collection, InteractionContextType, TextChannel } from 'discord.js';
import { EmbedBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { Command, log } from "#bloqbit/include";
import fetch from "#bloqbit/modules/fetch";

export default new Command(
    new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Clear messages in channel.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .setNSFW(false)
        .addNumberOption((o) => o
            .setName("amount")
            .setDescription("Number of messages to clear.")
            .setMinValue(2)
            .setMaxValue(100)
            .setRequired(true))
        .addUserOption((o) => o
            .setName("user")
            .setDescription("User whose messages to clear.")
            .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async (interaction, assets, system, db) => {
        const Amount = interaction.options?.getNumber("amount", true);
        const User = interaction.options?.getUser("user", false);

        const botMember = interaction.guild?.members?.cache?.get(interaction.client?.user?.id);

        try {
            if (!User && botMember?.permissions.has("ManageMessages")) {
                const msgs = await interaction.channel?.messages?.fetch({
                    "limit": Amount,
                });

                if (msgs) {
                    if (interaction.channel instanceof TextChannel) await interaction.channel.bulkDelete(msgs, true);

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
                } else {
                    await interaction.reply({
                        "content": "",
                        "embeds": [
                            {
                                "description": `${assets.icons.xmark} No messages to clear`,
                                "color": assets.colors.secondary,
                            },
                        ],
                    });
                };

                return;
            } else if (User) {
                const msgs = await interaction.channel?.messages?.fetch({
                    "limit": 100,
                });

                if (msgs) {
                    const filteredMsgs = msgs.filter((m) => m.author?.id === User.id);
                    const memberMsgs = new Collection([...filteredMsgs.entries()].slice(0, Amount));

                    if (interaction.channel instanceof TextChannel) await interaction.channel?.bulkDelete(memberMsgs, true);

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
                                        "value": `<@!${User.id}>`,
                                        "inline": true,
                                    },
                                ],
                            },
                        ],
                    });
                } else {
                    log.error(`Failed to fetch messages from user ${User.id} in channel ${interaction.channel?.id}.`);

                    await interaction.reply({
                        "content": "",
                        "embeds": [
                            {
                                "description": `${assets.icons.xmark} No messages to clear`,
                                "color": assets.colors.secondary,
                            },
                        ],
                    });
                };
            };
        } catch (err) {
            log.trace(err);

            await interaction.reply({
                "content": "",
                "embeds": [
                    {
                        "description": `${assets.icons.xmark} An error occurred while clearing messages`,
                        "color": assets.colors.secondary,
                    },
                ],
            });

            return;
        } finally {
            if (system.logs.enabled && system.logs.actions.moderator) {
                const date = Math.floor(Date.now() / 1000);

                const emb = new EmbedBuilder({
                    "author": {
                        "name": interaction.user?.username,
                        "icon_url": interaction.user?.displayAvatarURL({ "forceStatic": false, "size": 128 }),
                    },
                    "title": `${assets.icons.exclamation} Moderator`,
                    "description": `**${interaction.user?.username}** has taken a moderation action in \`#${interaction.channel instanceof TextChannel ? interaction.channel?.name : "unknown"}\``,
                    "color": assets.colors.tertiary,
                    "fields": [
                        {
                            "name": "Type",
                            "value": `Clear messages`,
                            "inline": true,
                        },
                        {
                            "name": "Time",
                            "value": `<t:${date}:F> • <t:${date}:R>`,
                            "inline": false,
                        },
                    ],
                }).data;

                if (interaction.guild) await fetch.sendLog(interaction.client, system, db, emb, interaction.guild);
            } else {
                log.warn(`Logs for moderator actions not enabled in guild ${interaction.guild?.id}.`);
            };

            setTimeout(async () => {
                await interaction.deleteReply();
            }, 3000);
        };
    },
);