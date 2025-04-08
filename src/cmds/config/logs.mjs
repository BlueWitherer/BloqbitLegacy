import SysAssets from '../../assets.json' with { type: 'json' };
import { SaveDataClient, ServerLogEventType, Config } from '../../classes.mjs';
import { ApplicationIntegrationType, ChatInputCommandInteraction, InteractionContextType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import fetch from '../../modules/fetch.mjs';
import resolve from '../../modules/resolve.mjs';
import cache from '../../cache.mjs';

export default {
    premium: false,
    cooldown: 0,
    data: new SlashCommandBuilder()
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
                .addChannelTypes([ChannelType.GuildText, ChannelType.GuildVoice])))
        .addSubcommand((c) => c
            .setName("action_type")
            .setDescription("Configure whether or not a certain type of action should be logged and where it'll be logged.")
            .addStringOption((o) => o
                .setName("action")
                .setDescription("The type of action that will be logged.")
                .addChoices(
                    {
                        name: "Auto-moderator",
                        value: ServerLogEventType.AutoModerator,
                    },
                    {
                        name: "Moderator",
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
                )
                .setRequired(true))
            .addBooleanOption((o) => o
                .setName("enable")
                .setDescription("Toggle detection of this action.")
                .setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction The interaction for the slash command.
     * @param {typeof SysAssets} assets The configuration of the client's visual assets.
     * @param {Config} system The settings model for the bot's configuration.
     * @param {SaveDataClient} db The database information.
     * 
     * @returns {Promise<void>}
     */
    execute: async (interaction, assets, system, db) => {
        const subCmd = interaction.options?.getSubcommand(true);

        const configCmd = async () => {
            const toggle = interaction.options?.getBoolean("enable", true);
            const channel = interaction.options?.getChannel("channel", true);

            const allEmbeds = [];

            if (toggle !== null && typeof toggle === "boolean") {
                system.logs.enabled = toggle;

                allEmbeds.push({
                    "description": `${assets.icons.check} **${interaction.user?.username}** - Successfully __${resolve.abled(toggle)}__ logs.`,
                    "color": assets.colors.primary,
                });
            };

            if (channel !== null && typeof channel === "object") {
                system.logs.channel = channel.id;

                allEmbeds.push({
                    "description": `${assets.icons.check} **${interaction.user?.username}** - Successfully __set \`#${channel.name}\`__ as the logging channel.`,
                    "color": assets.colors.primary,
                });
            };

            const update = await cache.update(system, db);

            if (update) {
                if (interaction.replied) {
                    await interaction.followUp({
                        "content": `> -# ${assets.icons.check} Configured **${allEmbeds.length}** ${resolve.isPlural(allEmbeds.length, "setting", "settings")}.`,
                        "embeds": allEmbeds,
                    });
                } else {
                    await interaction.reply({
                        "content": `> -# ${assets.icons.check} Configured **${allEmbeds.length}** ${resolve.isPlural(allEmbeds.length, "setting", "settings")}.`,
                        "embeds": allEmbeds,
                    });
                };
            } else {
                await fetch.commandErrorResponse(interaction, assets);
            };
        };

        const actionCmd = async () => {
            const action = interaction.options.getString("action", true);
            const toggle = interaction.options.getBoolean("enable", true);

            switch (action) {
                case ServerLogEventType.AutoModerator:
                    system.logs.actions.autoMod = toggle;
                    break;

                case ServerLogEventType.MOD:
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
            };

            const update = await cache.update(system, db);

            if (update) {
                if (interaction.replied) {
                    await interaction.followUp({
                        "content": "",
                        "embeds": [
                            {
                                "description": `${assets.icons.check} **${interaction.user?.username}** - Successfully __${resolve.abled(toggle)}__ logs for action type \`${action}\`.`,
                                "color": assets.colors.primary,
                            },
                        ],
                    });
                } else {
                    await interaction.reply({
                        "content": "",
                        "embeds": [
                            {
                                "description": `${assets.icons.check} **${interaction.user?.username}** - Successfully __${resolve.abled(toggle)}__ logs for action type \`${action}\`.`,
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
    },
};