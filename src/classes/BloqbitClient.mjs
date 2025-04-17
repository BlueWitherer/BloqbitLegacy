import SysAssets from '../assets.json' with { type: 'json' };

import SaveDataClient from './SaveDataClient.mjs';

import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { REST } from '@discordjs/rest';

import Guilded from 'guilded.js';

import { Command } from '../classes.mjs';

/**
 * @class Bot model.
 */
export default class BloqbitClient {
    /**
     * If the bot is done loading and is fully online
     * @type {boolean}
     */
    online = false;

    /**
     * Discord bot token
     * @type {string}
     */
    token;

    /**
     * Discord bot secret
     * @type {string}
     */
    secret;

    /**
     * Developer log Discord webhook URL
     * @type {string}
     */
    dev_wh;

    /**
     * Database object
     * @type {SaveDataClient}
     */
    db;

    /**
     * Array of commands
     * @type {Array<import('discord.js').SlashCommandOptionsOnlyBuilder>}
     */
    commands;

    /**
     * @type {Array}
     */
    moderation;

    /**
     * Object of emote and color assets
     * @type {typeof SysAssets}
     */
    assets;

    /**
     * REST client
     * @type {REST}
     */
    rest;

    /**
     * Commands collection
     * @type {Collection<string, Command>}
     */
    cmds;

    /**
     * Discord bot client
     * @type {Client<boolean>}
     */
    client;

    /**
     * Guilded bot token
     * @type {string}
     */
    tokenGil;

    /**
     * Guilded bot client
     * @type {Guilded.Client}
     */
    clientGil;

    /**
     * 
     * @param {string} token Discord bot token
     * @param {string} secret Discord application secret
     * @param {string} web Developer log Discord webhook URL
     * @param {string} data MongoDB database URI
     * @param {string} gil Guilded bot token
     */
    constructor(token, secret, web, data, gil) {
        this.online = false;

        this.token = token;
        this.secret = secret;

        this.dev_wh = web;

        this.db = new SaveDataClient(data);

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

        this.tokenGil = gil;

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