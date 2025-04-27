import { ServerLogEventType, Command } from '../../classes.js';
import { ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import fetch from '../../modules/fetch.js';
import resolve from '../../modules/resolve.js';
import cache from '../../cache.mjs';

export default new Command(
    new SlashCommandBuilder()
        .setName("logs")
        .setDescription("Set up server logs.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .setNSFW(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((c) => c
            .setName("config")
            .setDescription("Adjust the general settings of the module per your server's needs.")
            .addBooleanOption((o) => o
                .setName("enable")
                .setDescription("Toggle logging module.")
                .setRequired(true))
            .addChannelOption((o) => o
                .setName("channel")
                .setDescription("Set the channel in which server-wide actions will be logged.")
                .setRequired(false))
            .addBooleanOption((o) => o
                .setName("webhook")
                .setDescription("Use a webhook.")
                .setRequired(false)))
        .addSubcommand((c) => c
            .setName("action_type")
            .setDescription("Configure whether or not a certain type of action should be logged and where it'll be logged.")
            .addStringOption((o) => o
                .setName("action")
                .setDescription("The type of action that will be logged.")
                .addChoices(
                    {
                        name: "Bloqbit Auto-moderator",
                        value: ServerLogEventType.AutoModerator,
                    },
                    {
                        name: "Moderator actions",
                        value: ServerLogEventType.Moderator,
                    },
                    {
                        name: "Server invites",
                        value: ServerLogEventType.ServerInvites,
                    },
                    {
                        name: "Member joins",
                        value: ServerLogEventType.MemberJoin,
                    },
                    {
                        name: "Member leaves",
                        value: ServerLogEventType.MemberLeave,
                    },
                    {
                        name: "Member timed out",
                        value: ServerLogEventType.MemberTimeout,
                    },
                    {
                        name: "Member banned",
                        value: ServerLogEventType.MemberBan,
                    },
                    {
                        name: "Member kicked",
                        value: ServerLogEventType.MemberKick,
                    },
                    {
                        name: "Member nickname updated",
                        value: ServerLogEventType.MemberNickname,
                    },
                    {
                        name: "Message deleted",
                        value: ServerLogEventType.MessageDelete,
                    },
                    {
                        name: "Message edited",
                        value: ServerLogEventType.MessageEdit,
                    },
                    {
                        name: "Message pinned",
                        value: ServerLogEventType.MessagePin,
                    },
                    {
                        name: "Messages bulk deleted",
                        value: ServerLogEventType.MessageBulkDelete,
                    },
                    {
                        name: "Message reactions removed",
                        value: ServerLogEventType.MessageRemoveReactions,
                    },
                    {
                        name: "Role created",
                        value: ServerLogEventType.RoleCreate,
                    },
                    {
                        name: "Role deleted",
                        value: ServerLogEventType.RoleDelete,
                    },
                    {
                        name: "Role assigned",
                        value: ServerLogEventType.RoleGive,
                    },
                    {
                        name: "Role taken",
                        value: ServerLogEventType.RoleTake,
                    },
                    {
                        name: "Channel created",
                        value: ServerLogEventType.ChannelCreate,
                    },
                    {
                        name: "Channel deleted",
                        value: ServerLogEventType.ChannelDelete,
                    },
                    {
                        name: "Voice user joined",
                        value: ServerLogEventType.VoiceJoin,
                    },
                    {
                        name: "Voice user moved",
                        value: ServerLogEventType.VoiceMove,
                    },
                    {
                        name: "Voice user left",
                        value: ServerLogEventType.VoiceLeave,
                    },
                )
                .setRequired(true))
            .addBooleanOption((o) => o
                .setName("enable")
                .setDescription("Toggle detection of this action.")
                .setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async (interaction, assets, system, db) => {
        const subCmd = interaction.options?.getSubcommand(true);

        /**
         * Config sub-command
         */
        const configCmd = async () => {
            const toggle = interaction.options?.getBoolean("enable", true);
            const channel = interaction.options?.getChannel("channel", false);
            const webhook = interaction.options?.getBoolean("webhook", false);

            const allEmbeds = [];

            if (toggle !== null) {
                system.logs.enabled = toggle;

                allEmbeds.push({
                    "description": `${assets.icons.check} **${interaction.user?.username}** - Successfully __${resolve.abled(toggle)}__ logs`,
                    "color": assets.colors.primary,
                });
            };

            if (channel !== null) {
                system.logs.channel = channel.id;

                allEmbeds.push({
                    "description": `${assets.icons.check} **${interaction.user?.username}** - Successfully __set \`#${channel.name}\`__ as the logging channel`,
                    "color": assets.colors.primary,
                });
            };

            if (webhook !== null) {
                system.logs.webhookEnabled = toggle;

                allEmbeds.push({
                    "description": `${assets.icons.check} **${interaction.user?.username}** - Successfully __${resolve.abled(webhook)}__ use of the webhook for logs`,
                    "color": assets.colors.primary,
                });
            };

            const update = await cache.update(system, db);

            if (update) {
                if (interaction.replied) {
                    await interaction.followUp({
                        "content": `> -# ${assets.icons.check} Configured **${allEmbeds.length}** ${resolve.isPlural(allEmbeds.length, "setting", "settings")}`,
                        "embeds": allEmbeds,
                    });
                } else {
                    await interaction.reply({
                        "content": `> -# ${assets.icons.check} Configured **${allEmbeds.length}** ${resolve.isPlural(allEmbeds.length, "setting", "settings")}`,
                        "embeds": allEmbeds,
                    });
                };
            } else {
                await fetch.commandErrorResponse(interaction, assets);
            };
        };

        /**
         * Action type sub-command
         */
        const actionCmd = async () => {
            const action = interaction.options?.getString("action", true);
            const toggle = interaction.options?.getBoolean("enable", true);

            switch (action) {
                case ServerLogEventType.AutoModerator:
                    system.logs.actions.autoMod = toggle;
                    break;

                case ServerLogEventType.Moderator:
                    system.logs.actions.moderator = toggle;
                    break;

                case ServerLogEventType.ServerInvites:
                    system.logs.actions.invites = toggle;
                    break;

                case ServerLogEventType.MemberJoin:
                    system.logs.actions.join = toggle;
                    break;

                case ServerLogEventType.MemberLeave:
                    system.logs.actions.leave = toggle;
                    break;

                case ServerLogEventType.MemberTimeout:
                    system.logs.actions.timeout = toggle;
                    break;

                case ServerLogEventType.MemberBan:
                    system.logs.actions.ban = toggle;
                    break;

                case ServerLogEventType.MemberKick:
                    system.logs.actions.kick = toggle;
                    break;

                case ServerLogEventType.MemberNickname:
                    system.logs.actions.nickname = toggle;
                    break;

                case ServerLogEventType.MessageDelete:
                    system.logs.actions.msgDel = toggle;
                    break;

                case ServerLogEventType.MessageEdit:
                    system.logs.actions.msgUpd = toggle;
                    break;

                case ServerLogEventType.MessagePin:
                    system.logs.actions.msgPin = toggle;
                    break;

                case ServerLogEventType.MessageBulkDelete:
                    system.logs.actions.msgBulkDel = toggle;
                    break;

                case ServerLogEventType.MessageRemoveReactions:
                    system.logs.actions.remAllReact = toggle;
                    break;

                case ServerLogEventType.RoleCreate:
                    system.logs.actions.rolesAdd = toggle;
                    break;

                case ServerLogEventType.RoleDelete:
                    system.logs.actions.rolesRem = toggle;
                    break;

                case ServerLogEventType.RoleGive:
                    system.logs.actions.rolesAssign = toggle;
                    break;

                case ServerLogEventType.RoleTake:
                    system.logs.actions.rolesUnassign = toggle;
                    break;

                case ServerLogEventType.ChannelCreate:
                    system.logs.actions.channelAdd = toggle;
                    break;

                case ServerLogEventType.ChannelDelete:
                    system.logs.actions.channelDel = toggle;
                    break;

                case ServerLogEventType.VoiceJoin:
                    system.logs.actions.vcJoin = toggle;
                    break;

                case ServerLogEventType.VoiceMove:
                    system.logs.actions.vcMove = toggle;
                    break;

                case ServerLogEventType.VoiceLeave:
                    system.logs.actions.vcLeave = toggle;
                    break;

                default:
                    console.error(`Unknown log action type: '${action}'`);
                    break;
            };

            const update = await cache.update(system, db);

            if (update) {
                if (interaction.replied) {
                    await interaction.followUp({
                        "content": "",
                        "embeds": [
                            {
                                "description": `${assets.icons.check} **${interaction.user?.username}** - Successfully __${resolve.abled(toggle)}__ logs for action type \`${action}\``,
                                "color": assets.colors.primary,
                            },
                        ],
                    });
                } else {
                    await interaction.reply({
                        "content": "",
                        "embeds": [
                            {
                                "description": `${assets.icons.check} **${interaction.user?.username}** - Successfully __${resolve.abled(toggle)}__ logs for action type \`${action}\``,
                                "color": assets.colors.primary,
                            },
                        ],
                    });
                };
            } else {
                await fetch.commandErrorResponse(interaction, assets);
            };
        };

        switch (subCmd) {
            case "config":
                await configCmd();
                break;

            case "action_type":
                await actionCmd();
                break;

            default:
                await fetch.commandErrorResponse(interaction, assets);
                break;
        };
    });