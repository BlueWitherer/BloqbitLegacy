import BloqbitClient from '../classes/BloqbitClient.mjs';
import { Events, Guild, WebhookClient, ActivityType, PresenceUpdateStatus } from 'discord.js';
import fetch from '../modules/fetch.mjs';

export default {
    name: Events.GuildCreate,
    once: false,
    /**
     * 
     * @param {BloqbitClient} bot 
     * @param {Guild} guild 
     * 
     * @returns {Promise<void>}
     */
    execute: async (bot, guild) => {
        const isLogged = fetch.fetchGuild(guild.id);

        if (isLogged) {
            console.log(`Incoming guild ${guild.id} registered in cache`);
        } else {
            try {
                await fetch.reviseGuild(bot.db, guild.id);
            } catch (err) {
                console.error(err);
            };
        };

        try {
            const devWH = new WebhookClient({ url: bot.dev_wh, });
            const date = Math.floor(Date.now() / 1000);

            await devWH.send({
                "avatarURL": bot.client?.user?.displayAvatarURL({ "forceStatic": true, "size": 512, }),
                "embeds": [
                    {
                        "author": {
                            "name": `Servers`,
                        },
                        "description": `${bot.assets.default.icons.plus} **${bot.client?.user?.username}** was authorized to join the guild __${guild.name}__.`,
                        "color": bot.assets.colors.primary,
                        "fields": [
                            {
                                "name": "Time of Join",
                                "value": `<t:${date}:F> • <t:${date}:R>`,
                                "inline": false,
                            },
                        ],
                        "footer": {
                            "text": guild.name,
                            "icon_url": guild.iconURL({ "forceStatic": false, "size": 128 }),
                        },
                    },
                ],
            });

            const srvs = await bot.client?.guilds?.fetch();

            bot.client?.user?.setPresence({
                "activities": [
                    {
                        "name": `Alpha Testing!`,
                        "state": `Active across ${srvs.size} servers!`,
                        "type": ActivityType.Streaming,
                        "url": `https://www.youtube.com/@CubicCommunity/`,
                    }
                ],
                "afk": false,
                "status": PresenceUpdateStatus.Online,
            });
        } catch (err) {
            console.error(err);
        };

        return;
    },
};