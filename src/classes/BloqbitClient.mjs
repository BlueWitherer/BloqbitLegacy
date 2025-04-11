import SysAssets from '../assets.json' with { type: 'json' };

import SaveDataClient from './SaveDataClient.mjs';

import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { REST } from '@discordjs/rest';

import Guilded from 'guilded.js';

/**
 * @class Bot model.
 */
export default class BloqbitClient {
    /**
     * 
     * @param {string} token Bot token
     * @param {string} secret Application secret
     * @param {string} web Developer log webhook URL
     * @param {string} db MongoDB database URI
     * @param {string} gil Guilded bot token
     */
    constructor(token, secret, web, db, gil) {
        this.online = false;

        this.token = token;
        this.secret = secret;

        this.dev_wh = web;

        this.db = new SaveDataClient(db);

        this.commands = [];
        this.moderation = [];

        this.assets = SysAssets;

        this.rest = new REST();
        this.cmds = new Collection();

        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildExpressions,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildIntegrations,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildWebhooks,
                GatewayIntentBits.GuildModeration,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildMessageTyping,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.DirectMessages,
            ],
            partials: [
                Partials.Channel,
                Partials.Message,
                Partials.User,
                Partials.Reaction,
                Partials.GuildMember,
                Partials.GuildScheduledEvent,
                Partials.ThreadMember,
            ],
        });

        this.clientGil = new Guilded.Client({
            token: gil,
            cache: {
                cacheCalendars: true,
                cacheCalendarsRsvps: true,
                cacheChannels: true,
                cacheForumTopics: true,
                cacheMemberBans: true,
                cacheMessageReactions: true,
                cacheMessages: true,
                cacheServers: true,
                cacheSocialLinks: true,
                cacheWebhooks: true,
                fetchMessageAuthorOnCreate: true,
                removeCalendarRsvpOnDelete: true,
                removeCalendarsOnDelete: true,
                removeChannelOnDelete: true,
                removeMemberBanOnUnban: true,
                removeMemberOnLeave: true,
            },
        });

        this.rest.setToken(token);

        return this;
    };
};