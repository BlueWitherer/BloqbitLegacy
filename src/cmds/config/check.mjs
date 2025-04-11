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
                    fetch.commandErrorResponse(interaction, assets);
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
    });