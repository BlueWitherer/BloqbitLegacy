import { Command, MessageFilterClass } from '../../classes.mjs';
import { ApplicationIntegrationType, EmbedBuilder, InteractionContextType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import fetch from '../../modules/fetch.mjs';
import resolve from '../../modules/resolve.mjs';

export default new Command(
    new SlashCommandBuilder()
        .setName("check")
        .setDescription("View an auto-moderator list.")
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
        .setContexts([InteractionContextType.Guild])
        .setNSFW(false)
        .addSubcommand((c) => c
            .setName("filters")
            .setDescription("Basic keyword filtering.")
            .addStringOption((s) => s
                .setName("filter")
                .setDescription("Filter to check.")
                .addChoices([
                    {
                        name: "Swear Words",
                        value: MessageFilterClass.SWEAR,
                    },
                    {
                        name: "External URLs",
                        value: MessageFilterClass.URL,
                    },
                    {
                        name: "Server Invites",
                        value: MessageFilterClass.INV,
                    },
                    {
                        name: "Duplicate Text",
                        value: MessageFilterClass.DUPETXT,
                    },
                    {
                        name: "Mass Mentions",
                        value: MessageFilterClass.MASSPING,
                    },
                ])
                .setRequired(true)))
        .addSubcommand((c) => c
            .setName("logs")
            .setDescription("Configuration for server logging."))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async (interaction, assets, system, db) => {
        if (interaction.options.getSubcommand() == "filters") {
            const am = system.automod;

            /**
             * 
             * @param {any} thisFilter Filter object.
             * @param {string} name Singular name of the filter.
             */
            const checkFilter = (thisFilter, name) => {
                const fields = [{
                    "name": "Channel Filter Mode",
                    "value": `**${resolve.filterMode(thisFilter.filterMode)}**`,
                    "inline": true,
                },
                {
                    "name": "Role Filter Mode",
                    "value": `**${resolve.filterMode(thisFilter.permFilterMode)}**`,
                    "inline": true,
                },];

                if (thisFilter.keywords?.length) {
                    fields.push({
                        "name": "Keyword List",
                        "value": `\`${thisFilter.keywords.join("`,`")}\``,
                        "inline": false,
                    },);
                };

                if (thisFilter.keywordsSuper?.length) {
                    fields.push({
                        "name": "Stronger Keyword List",
                        "value": `||\`${thisFilter.keywordsSuper.join("`||,||`")}\`||`,
                        "inline": false,
                    },);
                };

                if (thisFilter.channels?.length) {
                    fields.push({
                        "name": "Channels",
                        "value": `<#${thisFilter.channels.join(">,<#")}>`,
                        "inline": false,
                    },);
                };

                if (thisFilter.roles?.length) {
                    fields.push({
                        "name": "Roles",
                        "value": `<@&${thisFilter.roles.join(">,<@&")}>`,
                        "inline": false,
                    },);
                };

                return new EmbedBuilder()
                    .setAuthor({
                        "name": `${interaction.user?.username}`,
                        "icon_url": `${interaction.user?.displayAvatarURL({ "forceStatic": false, size: 64 })}`
                    })
                    .setTitle(`${name} Filter for ${interaction.guild?.name}`)
                    .setDescription(`**${resolve.abled(thisFilter.enabled)}**`)
                    .setColor(assets.colors.primary)
                    .addFields(fields)
                    .setFooter({
                        "text": `${interaction.user?.username}`,
                        "iconURL": `${interaction.user?.displayAvatarURL({ "forceStatic": false })}`
                    }).data;
            };

            let returnEmbed = new EmbedBuilder().data;

            switch (interaction.options.getString("filter")) {
                case MessageFilterClass.SWEAR:
                    returnEmbed = checkFilter(am.swearFilter, "Swear");
                    break;

                case MessageFilterClass.INV:
                    returnEmbed = checkFilter(am.inviteFilter, "Invite");
                    break;

                case MessageFilterClass.URL:
                    returnEmbed = checkFilter(am.linkFilter, "Link");
                    break;

                case MessageFilterClass.DUPETXT:
                    returnEmbed = checkFilter(am.dupetextFilter, "Dupe Text");
                    break;

                case MessageFilterClass.MASSPING:
                    returnEmbed = checkFilter(am.massmentionFilter, "Mass Mention");
                    break;

                default:
                    await fetch.commandErrorResponse(interaction, assets);
                    return;
            };

            await interaction.reply({
                "content": "",
                "embeds": [
                    returnEmbed,
                ],
                "flags": [
                    "Ephemeral",
                ],
            });

            return;
        } else if (interaction.options.getSubcommand() == "logs") {
            const loggingIn = () => {
                if (system.logs.enabled && system.logs.channel) return ` and are currently being sent in <#${system.logs.channel}>`;
            };

            const returnEmbed = new EmbedBuilder()
                .setAuthor({
                    "name": `${interaction.user?.username}`,
                    "icon_url": `${interaction.user?.displayAvatarURL({ "forceStatic": false, size: 64 })}`
                })
                .setTitle(`Set of active logs for ${interaction.guild?.name}`)
                .setDescription(`Logs are currently **${resolve.abled(system.logs.enabled)}**${loggingIn()}!`)
                .setFields([
                    {
                        "name": "Bloqbit Auto-moderator",
                        "value": `**${resolve.abled(system.logs.actions.autoMod)}**`, // General
                        "inline": true,
                    },
                    {
                        "name": "Moderator actions",
                        "value": `**${resolve.abled(system.logs.actions.moderator)}**`,
                        "inline": true,
                    },
                    {
                        "name": "Server invites",
                        "value": `**${resolve.abled(system.logs.actions.invites)}**`,
                        "inline": true,
                    },
                    {
                        "name": "Member joins",
                        "value": `**${resolve.abled(system.logs.actions.join)}**`, // Members
                        "inline": false,
                    },
                    {
                        "name": "Member leaves",
                        "value": `**${resolve.abled(system.logs.actions.leave)}**`,
                        "inline": true,
                    },
                    {
                        "name": "Member timed out",
                        "value": `**${resolve.abled(system.logs.actions.timeout)}**`,
                        "inline": true,
                    },
                    {
                        "name": "Member banned",
                        "value": `**${resolve.abled(system.logs.actions.ban)}**`,
                        "inline": true,
                    },
                    {
                        "name": "Member nickname updated",
                        "value": `**${resolve.abled(system.logs.actions.nickname)}**`,
                        "inline": true,
                    },
                    {
                        "name": "Message deleted",
                        "value": `**${resolve.abled(system.logs.actions.msgDel)}**`, // Messages
                        "inline": false,
                    },
                    {
                        "name": "Message edited",
                        "value": `**${resolve.abled(system.logs.actions.msgUpd)}**`,
                        "inline": true,
                    },
                    {
                        "name": "Message pinned",
                        "value": `**${resolve.abled(system.logs.actions.msgPin)}**`,
                        "inline": true,
                    },
                    {
                        "name": "Messages bulk deleted",
                        "value": `**${resolve.abled(system.logs.actions.msgBulkDel)}**`,
                        "inline": true,
                    },
                    {
                        "name": "All reactions removed from message",
                        "value": `**${resolve.abled(system.logs.actions.remAllReact)}**`,
                        "inline": true,
                    },
                    {
                        "name": "Role created",
                        "value": `**${resolve.abled(system.logs.actions.rolesAdd)}**`, // Roles
                        "inline": false,
                    },
                    {
                        "name": "Role deleted",
                        "value": `**${resolve.abled(system.logs.actions.rolesRem)}**`,
                        "inline": true,
                    },
                    {
                        "name": "Role assigned",
                        "value": `**${resolve.abled(system.logs.actions.rolesAssign)}**`,
                        "inline": true,
                    },
                    {
                        "name": "Role taken",
                        "value": `**${resolve.abled(system.logs.actions.rolesUnassign)}**`,
                        "inline": true,
                    },
                    {
                        "name": "Channel created",
                        "value": `**${resolve.abled(system.logs.actions.channelAdd)}**`, // Channels
                        "inline": false,
                    },
                    {
                        "name": "Channel updated",
                        "value": `**${resolve.abled(system.logs.actions.channelUpd)}**`,
                        "inline": true,
                    },
                    {
                        "name": "Channel deleted",
                        "value": `**${resolve.abled(system.logs.actions.channelDel)}**`,
                        "inline": true,
                    },
                ]).data;

            await interaction.reply({
                "content": "",
                "embeds": [
                    returnEmbed,
                ],
                "flags": [
                    "Ephemeral",
                ],
            });
        } else {
            await fetch.commandErrorResponse(interaction, assets);
            return;
        };
    });