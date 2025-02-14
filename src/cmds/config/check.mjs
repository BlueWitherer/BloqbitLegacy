import SysAssets from '../../assets.json' with { type: 'json' };
import SysSettings from '../../settings.json' with { type: 'json' };
import { BotDatabase, FilterMode, ModActionType, FilterClass } from '../../classes.mjs';
import { ChatInputCommandInteraction, Role, BaseChannel } from 'discord.js';
import { EmbedBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import fetch from '../../modules/fetch.mjs';
import resolve from '../../modules/resolve.mjs';
import cache from '../../cache.mjs';

export default {
    premium: false,
    data: new SlashCommandBuilder()
        .setName("check")
        .setDescription("View an auto-moderator list.")
        .addSubcommand((c) => c
            .setName("filters")
            .setDescription("Basic keyword filtering.")
            .addStringOption((s) => s
                .setName("filter")
                .setDescription("Filter to check.")
                .addChoices([
                    {
                        name: "Swear Words",
                        value: FilterClass.SWEAR,
                    },
                    {
                        name: "External URLs",
                        value: FilterClass.URL,
                    },
                    {
                        name: "Server Invites",
                        value: FilterClass.INV,
                    },
                    {
                        name: "Duplicate Text",
                        value: FilterClass.DUPETXT,
                    },
                    {
                        name: "Mass Mentions",
                        value: FilterClass.MASSPING,
                    },
                ])
                .setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction The interaction for the slash command.
     * @param {typeof SysAssets} assets The configuration of the client's visual assets.
     * @param {typeof SysSettings} system The settings model for the bot's configuration.
     * @param {BotDatabase} db The database information.
     * 
     * @returns {Promise<void>}
     */
    execute: async (interaction, assets, system, db) => {
        if (interaction.options.getSubcommand() == "filters") {
            const am = system.automod;

            /**
             * 
             * @param {typeof SysSettings} thisFilter Filter object.
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
                        "value": `<#${thisFilter.roles.join(">,<#")}>`,
                        "inline": false,
                    },);
                };

                return new EmbedBuilder()
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
                case FilterClass.SWEAR:
                    returnEmbed = checkFilter(am.swearFilter, "Swear");
                    break;

                case FilterClass.INV:
                    returnEmbed = checkFilter(am.inviteFilter, "Invite");
                    break;

                case FilterClass.URL:
                    returnEmbed = checkFilter(am.linkFilter, "Link");
                    break;

                case FilterClass.DUPETXT:
                    returnEmbed = checkFilter(am.dupetextFilter, "Dupe Text");
                    break;

                case FilterClass.MASSPING:
                    returnEmbed = checkFilter(am.massmentionFilter, "Mass Mention");
                    break;

                default:
                    return fetch.commandErrorResponse(interaction, assets);
            };

            return await interaction.reply({
                "content": "",
                "embeds": [
                    returnEmbed,
                ],
                "flags": [
                    "Ephemeral",
                ],
            });
        };
    },
};