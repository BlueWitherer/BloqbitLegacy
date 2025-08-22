import { Command, MessageFilterClass, log } from "#bloqbit/include.ts";
import { ApplicationIntegrationType, EmbedBuilder, InteractionContextType } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import fetch from "#bloqbit/modules/fetch.mjs";
import resolve from "#bloqbit/modules/resolve.mjs";

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
        .addSubcommand((c) => c
            .setName("autopublish")
            .setDescription("Check the server's auto-publisher settings."))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async (interaction, assets, system, db) => {
        const cmd = interaction.options?.getSubcommand(true);

        const filtersCmd = async () => {
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
                    .setTitle(`${assets.icons.info} ${name} Filter for ${interaction.guild?.name}`)
                    .setDescription(`**${resolve.abled(thisFilter.enabled)}**`)
                    .setColor(assets.colors.primary)
                    .addFields(fields)
                    .setFooter({
                        "text": `${interaction.user?.username}`,
                        "iconURL": `${interaction.user?.displayAvatarURL({ "forceStatic": false })}`
                    }).data;
            };

            let returnEmbed = new EmbedBuilder().data;

            switch (interaction.options?.getString("filter")) {
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
        };

        const logsCmd = async () => {
            const lg = system.logs;

            const loggingIn = () => {
                if (lg.enabled && lg.channel) return ` and are currently being sent in <#${lg.channel}>`;
            };

            const returnEmbed = new EmbedBuilder()
                .setTitle(`${assets.icons.info} Set of active logs for ${interaction.guild?.name}`)
                .setDescription(`Logs are currently **${resolve.abled(lg.enabled)}**${loggingIn()}!`)
                .setColor(assets.colors.primary)
                .setFields([
                    {
                        "name": "General",
                        "value": `**Bloqbit Auto-moderator** ${resolve.abled(lg.actions.autoMod, true)}\n**Moderator Actions** ${resolve.abled(lg.actions.moderator, true)}\n**Server Invites** ${resolve.abled(lg.actions.invites, true)}`,
                        "inline": true,
                    },
                    {
                        "name": "Members",
                        "value": `**Member join** ${resolve.abled(lg.actions.join, true)}\n**Member left** ${resolve.abled(lg.actions.leave, true)}\n**Member timed out** ${resolve.abled(lg.actions.timeout, true)}\n**Member banned** ${resolve.abled(lg.actions.ban, true)}\n**Member nickname updated** ${resolve.abled(lg.actions.nickname, true)}\n`,
                        "inline": true,
                    },
                    {
                        "name": "Messages",
                        "value": `**Message deleted** ${resolve.abled(lg.actions.msgDel, true)}\n**Message edited** ${resolve.abled(lg.actions.msgUpd, true)}\n**Message pinned** ${resolve.abled(lg.actions.msgPin, true)}\n**Messages bulk deleted** ${resolve.abled(lg.actions.msgBulkDel, true)}\n**Message reactions removed** ${resolve.abled(lg.actions.remAllReact, true)}`,
                        "inline": true,
                    },
                    {
                        "name": "Voice",
                        "value": `**Join voice channel** ${resolve.abled(lg.actions.vcJoin, true)}\n**More through voice channels** ${resolve.abled(lg.actions.vcMove, true)}\n**Leave voice channel** ${resolve.abled(lg.actions.vcLeave, true)}`,
                        "inline": true,
                    },
                    {
                        "name": "Roles",
                        "value": `**Role created** ${resolve.abled(lg.actions.rolesAdd, true)}\n**Role deleted** ${resolve.abled(lg.actions.rolesRem, true)}\n**Role given** ${resolve.abled(lg.actions.rolesAssign, true)}\n**Role taken** ${resolve.abled(lg.actions.rolesUnassign, true)}`,
                        "inline": true,
                    },
                    {
                        "name": "Channels",
                        "value": `**Channel created** ${resolve.abled(lg.actions.channelAdd, true)}\n**Channel deleted** ${resolve.abled(lg.actions.channelDel, true)}`,
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

            return;
        };

        const autopublishCmd = async () => {
            const ap = system.autopublish;
            const chnls = fetch.scanChannels(interaction.guild, ap.channels);

            const returnEmbed = new EmbedBuilder()
                .setTitle(`${assets.icons.info} Auto-publisher Settings`)
                .setDescription(`${chnls.length ? `<#${chnls.join(">,<#")}>` : `-# *No channels*`}`)
                .setColor(assets.colors.primary)
                .setFields(
                    {
                        "name": "Status",
                        "value": `**${resolve.abled(ap.enabled, true)}**`,
                        "inline": false,
                    },
                    {
                        "name": "Bots Allowed",
                        "value": `**${resolve.abled(ap.bots, true)}**`,
                        "inline": true,
                    },
                )
                .setFooter({
                    "text": `${interaction.user?.username}`,
                    "iconURL": `${interaction.user?.displayAvatarURL({ "forceStatic": false })}`
                });

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
        };

        switch (cmd) {
            case "filters":
                await filtersCmd();
                break;

            case "logs":
                await logsCmd();
                break;

            case "autopublish":
                await autopublishCmd();
                break;

            default:
                await fetch.commandErrorResponse(interaction, assets);
                break;
        };

        return;
    },
);