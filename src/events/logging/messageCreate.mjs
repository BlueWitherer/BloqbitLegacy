import { Events, Message, EmbedBuilder } from "discord.js";

import { BloqbitClient, BotEvent } from "#bloqbit/include";

import fetch from "#bloqbit/modules/fetch";
export default new BotEvent(
    Events.MessageCreate,
    /**
     * 
     * @param {BloqbitClient} bot
     * @param {unknown[]} args
     * 
     * @returns {Promise<void>}
     */
    async (bot, ...args) => {
        const msg = /** @type {import("discord.js").OmitPartialGroupDMChannel<Message>} */ (args[0]);

        if (msg.guild) {
            console.debug(`Handling created message log event on guild of ID ${msg.guild?.id || msg.guildId}...`);
            const system = await fetch.fetchGuild((msg.guild?.id || msg.guildId) ?? '', bot.db);

            const inviteRegex = /discord\.gg\/[a-zA-Z0-9]{8,10}|discord\.com\/invite\/[a-zA-Z0-9]{8,10}/g;
            const matchInvite = msg.content?.match(inviteRegex);
            const isInvite = inviteRegex.test(msg.cleanContent) || msg.attachments?.some((a) => inviteRegex.test(a.url)) || msg.embeds.some((e) => e.url && inviteRegex.test(e.url)) || msg.content.includes("discord.gg") || msg.content.includes("discord.com/invite");

            if (system) {
                if (system.logs.enabled && (system.logs.actions.invites)) {
                    const emb = new EmbedBuilder({
                        "author": {
                            "name": `${msg.author?.username}`,
                            "iconURL": `${msg.author?.displayAvatarURL({ "forceStatic": false, size: 64 })}`,
                        },
                        "title": `${bot.assets.icons.exclamation} Server Invite Posted`,
                        "description": `${isInvite && matchInvite ? `${matchInvite[0]}` : ""}`,
                        "color": bot.assets.colors.tertiary,
                        "fields": [
                            {
                                "name": "Jump",
                                "value": `[Proceed](${msg.url})`,
                                "inline": false,
                            },
                            {
                                "name": "Author",
                                "value": `<@!${msg.author?.id}>`,
                                "inline": true,
                            },
                            {
                                "name": "Channel",
                                "value": `<#${msg.channel?.id}>`,
                                "inline": true,
                            },
                            {
                                "name": "Message ID",
                                "value": `\`${msg.id}\``,
                                "inline": true,
                            },
                            {
                                "name": "Originally Sent",
                                "value": `<t:${Math.floor(msg.createdTimestamp / 1000)}:F> • <t:${Math.floor(msg.createdTimestamp / 1000)}:R>`,
                                "inline": false,
                            },
                        ],
                        "image": {
                            "url": fetch.ifImage(msg) || "",
                            "proxyURL": fetch.ifProxyImage(msg) || "",
                        },
                    }).data;

                    if (isInvite) await fetch.sendLog(bot.client, system, bot.db, emb, msg.guild);
                } else {
                    console.warn(`Logs for posted server invites not enabled in guild '${msg.guild?.name}' (${msg.guild?.id})`);
                };
            } else {
                console.error(`Server '${msg.guild?.name}' (${msg.guild?.id}) not registered in database`);
            };

            return;
        } else {
            console.error(`Message of ID ${msg.id} not in a guild`);
            return;
        };
    });