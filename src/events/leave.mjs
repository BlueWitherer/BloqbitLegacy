import fetch from "#bloqbit/modules/fetch";
import { BloqbitClient } from "#bloqbit/include";
import { Events, Guild, WebhookClient, PresenceUpdateStatus } from 'discord.js';

export default {
    name: Events.GuildDelete,
    once: false,
    /**
     * 
     * @param {BloqbitClient} bot 
     * @param {Guild} guild 
     * 
     * @returns {Promise<void>}
     */
    execute: async (bot, guild) => {
        try {
            const clientShard = bot.client?.shard?.ids[0] || 0;
            const devWH = new WebhookClient({ url: bot.dev_wh, });
            const date = Math.floor(Date.now() / 1000);

            console.debug(`Forced to leave guild ${guild.name} (${guild.id})`);

            await devWH.send({
                "avatarURL": bot.client?.user?.displayAvatarURL({ "forceStatic": true, "size": 512, }),
                "embeds": [
                    {
                        "author": {
                            "name": `Servers`,
                        },
                        "description": `${bot.assets.default.icons.minus} **${bot.client?.user?.username}** was forced to leave the guild __${guild.name}__`,
                        "color": bot.assets.colors.secondary,
                        "fields": [
                            {
                                "name": "Time of Leave",
                                "value": `<t:${date}:F> • <t:${date}:R>`,
                                "inline": false,
                            },
                        ],
                        "footer": {
                            "text": guild.name,
                            "icon_url": guild.iconURL({ "forceStatic": false, "size": 128 }) ?? undefined,
                        },
                    },
                ],
            });

            const srvs = await bot.client?.guilds?.fetch();
            fetch.setPresence(bot.client, `Alpha Testing!`, `Active across ${srvs.size} servers on shard ${clientShard}!`, PresenceUpdateStatus.Online);
        } catch (err) {
            console.trace(err);
        };

        return;
    },
};