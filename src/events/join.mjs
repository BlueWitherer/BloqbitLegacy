import fetch from "#bloqbit/modules/fetch.mjs";
import { BloqbitClient, log } from "#bloqbit/include.ts";
import { Events, Guild, WebhookClient, PresenceUpdateStatus } from 'discord.js';

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
        try {
            const clientShard = bot.client?.shard?.ids[0] || 0;
            const date = Math.floor(Date.now() / 1000);
            const devWH = new WebhookClient({ url: bot.dev_wh, });

            log.debug(`Authorized to join guild ${guild.name} (${guild.id})`);

            await devWH.send({
                "avatarURL": bot.client?.user?.displayAvatarURL({ "forceStatic": true, "size": 512, }),
                "embeds": [
                    {
                        "author": {
                            "name": `Servers`,
                        },
                        "description": `${bot.assets.icons.plus} **${bot.client?.user?.username}** was authorized to join the guild __${guild.name}__`,
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
                            "icon_url": guild.iconURL({ "forceStatic": false, "size": 128 }) ?? '',
                        },
                    },
                ],
            });

            const srvs = await bot.client?.guilds?.fetch();
            fetch.setPresence(bot.client, `Alpha Testing!`, `Active across ${srvs.size} servers on shard ${clientShard}!`, PresenceUpdateStatus.Online);
        } catch (err) {
            log.trace(err);
        };

        return;
    },
};