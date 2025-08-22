import { BloqbitClient, log } from "#bloqbit/include.ts";

import { Events, WebhookClient } from 'discord.js';

import cache from "#bloqbit/database.mjs";

import fetch from "#bloqbit/modules/fetch.mjs";

export default {
    name: Events.InteractionCreate,
    once: false,
    /**
     * 
     * @param {BloqbitClient} bot 
     * @param {import('discord.js').Interaction} interaction
     * 
     * @returns {Promise<void>}
     */
    execute: async (bot, interaction) => {
        try {
            if (interaction.isChatInputCommand()) {
                const command = bot.cmds?.get(interaction.commandName);

                const devWH = new WebhookClient({ url: bot.dev_wh, });
                const interactionServer = await fetch.fetchGuild(interaction.guild?.id ?? '', bot.db);

                if (command && interactionServer) {
                    try {
                        log.debug(`Running command /${interaction.commandName} (${interaction.id}) executed by ${interaction.user?.username} (${interaction.user?.id})`);
                        await command.execute(interaction, bot.assets, interactionServer, bot.db);
                    } catch (err) {
                        log.trace(err);

                        try {
                            if (interaction.replied || interaction.deferred) {
                                await interaction.followUp({
                                    "content": `${bot.assets.icons.xmark} There was an error while executing this command.`,
                                    "flags": [
                                        "Ephemeral",
                                    ],
                                });
                            } else {
                                await interaction.reply({
                                    "content": `${bot.assets.icons.xmark} There was an error while executing this command.`,
                                    "flags": [
                                        "Ephemeral",
                                    ],
                                });
                            };
                        } catch (err) {
                            log.trace(err);
                        };
                    } finally {
                        const date = Math.floor(Date.now() / 1000);

                        log.debug(`Interaction /${interaction.commandName} (${interaction.id}) executed by ${interaction.user?.username} (${interaction.user?.id})`);

                        await devWH.send({
                            "avatarURL": interaction.client?.user?.displayAvatarURL({ "forceStatic": true, "size": 128 }),
                            "content": "",
                            "embeds": [
                                {
                                    "author": {
                                        "name": "Interaction",
                                    },
                                    "color": bot.assets.colors.tertiary,
                                    "description": `Used **/${interaction.commandName}** in guild __${interaction.guild?.name}__`,
                                    "fields": [
                                        {
                                            "name": "Used At",
                                            "value": `<t:${date}:F> • <t:${date}:R>`,
                                            "inline": false,
                                        },
                                    ],
                                    "footer": {
                                        "text": interaction.user?.username,
                                        "icon_url": interaction.user?.displayAvatarURL({ "forceStatic": false, "size": 128 }),
                                    },
                                },
                            ],
                        });
                    };

                    return;
                } else if (!command) {
                    log.error(`Command ${interaction.commandName} not found`);
                    await fetch.commandErrorResponse(interaction, bot.assets);
                } else if (!interactionServer) {
                    log.error(`Interaction ${interaction.id} not found in database`);
                    await fetch.databaseErrorResponse(interaction, bot.assets);
                } else {
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({
                            "content": `${bot.assets.icons.xmark} There was an error while executing this command`,
                            "flags": [
                                "Ephemeral",
                            ],
                        });
                    } else {
                        await interaction.reply({
                            "content": `${bot.assets.icons.xmark} There was an error while executing this command`,
                            "flags": [
                                "Ephemeral",
                            ],
                        });
                    };

                    return;
                };
            } else {
                log.error(`Interaction ${interaction.id} not a command`);
            };
        } catch (err) {
            log.trace(err);

            await fetch.commandErrorResponse(interaction, bot.assets);
            return;
        };
    },
};