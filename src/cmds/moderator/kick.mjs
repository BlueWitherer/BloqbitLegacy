import { ApplicationIntegrationType, GuildMember, InteractionContextType, PermissionsBitField } from 'discord.js';
import { EmbedBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { Command, log } from "#bloqbit/include";
import fetch from "#bloqbit/modules/fetch";

export default new Command(
    new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick a user.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .setNSFW(false)
        .addUserOption((o) => o
            .setName("user")
            .setDescription("User to kick.")
            .setRequired(true))
        .addStringOption((o) => o
            .setName("reason")
            .setDescription("Reason for kick.")
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    async (interaction, assets, system, db) => {
        const User = interaction.options?.getUser("user", true);
        const Member = interaction.options?.getMember("user");
        const Reason = interaction.options?.getString("reason", false) ?? 'Unspecified';

        if (Member && Member.permissions instanceof PermissionsBitField && Member.permissions.has(PermissionFlagsBits.KickMembers)) {
            await interaction.reply({
                "content": "",
                "embeds": [
                    {
                        "description": `${assets.icons.xmark} You cannot kick another moderator`,
                        "color": assets.colors.secondary,
                    },
                ],
                "flags": [
                    "Ephemeral",
                ],
            });
            return;
        }

        try {
            const kickResult = await interaction.guild?.members?.kick(User.id, `${interaction.user?.username} | Kick - ${Reason}`);

            await interaction.reply({
                "content": "",
                "embeds": [
                    {
                        "author": {
                            "name": `${interaction.user?.username}`,
                            "icon_url": `${interaction.user?.displayAvatarURL({ "forceStatic": false, size: 64 })}`,
                        },
                        "title": `${assets.icons.noentry} User Kicked`,
                        "color": assets.colors.primary,
                        "fields": [
                            {
                                "name": "User",
                                "value": `**${kickResult instanceof GuildMember ? kickResult.user?.username : User.username}**`,
                                "inline": true,
                            },
                            {
                                "name": "Moderator",
                                "value": `**${interaction.user?.username}**`,
                                "inline": true,
                            },
                            {
                                "name": "reason",
                                "value": `${Reason}`,
                                "inline": false,
                            },
                        ],
                    },
                ],
            });

            try {
                await User.send({
                    "content": "",
                    "embeds": [
                        {
                            "author": {
                                "name": `${User.username}`,
                                "icon_url": `${User.displayAvatarURL({ "forceStatic": false, size: 64 })}`,
                            },
                            "title": `${assets.icons.noentry} Kicked`,
                            "description": `You were __kicked__ from **${interaction.guild?.name}**`,
                            "color": assets.colors.primary,
                            "fields": [
                                {
                                    "name": `Reason`,
                                    "value": `${Reason}`,
                                    "inline": false,
                                },
                                {
                                    "name": `Reviewed`,
                                    "value": `<t:${Math.floor(Date.now() / 1000)}:F>`,
                                    "inline": false,
                                },
                            ],
                        },
                    ],
                });
            } catch (err) {
                log.trace(err);
                log.warn(`Failed to send kick DM to user ${User.username} (${User.id}): ${err}`);
            };
        } catch (err) {
            log.trace(err);

            await interaction.reply({
                "content": `> ${assets.icons.xmark} **${interaction.user?.username}** - An error occurred`,
                "flags": [
                    "Ephemeral",
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
                    "title": `:exclamation: Moderator`,
                    "description": `**${interaction.user?.username}** has taken a moderation action on \`${User.username}\``,
                    "color": assets.colors.tertiary,
                    "fields": [
                        {
                            "name": "Type",
                            "value": `Kick`,
                            "inline": true,
                        },
                        {
                            "name": "Reason",
                            "value": `${Reason}`,
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
        };
    },
);