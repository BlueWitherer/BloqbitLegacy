import SaveDataClient from './SaveDataClient.js';

import SysAssets from '../assets.json' with { type: 'json' };

import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { REST } from '@discordjs/rest';

import * as Guilded from 'guilded.js';

import { Command } from '../classes.js';
import resolve from '../modules/resolve.mjs';

const parsedSysAssets = resolve.parseJson(resolve.stringJson(SysAssets));

/**
 * @class Bot model.
 */
export default class BloqbitClient {
    /**
     * Discord bot token
     */
    public token: string;

    /**
     * Discord bot secret
     */
    private secret: string;

    /**
     * Developer log Discord webhook URL
     */
    public dev_wh: string;

    /**
     * Database object
     */
    public db: SaveDataClient;

    /**
     * Array of commands
     */
    public commands: Array<import('discord.js').SlashCommandOptionsOnlyBuilder>;

    /**
     * Object of emote and color assets
     */
    public assets: typeof SysAssets;

    /**
     * REST client
     */
    public rest: REST;

    /**
     * Commands collection
     */
    public cmds: Collection<string, Command>;

    /**
     * Discord bot client
     */
    public client: Client;

    /**
     * Guilded bot token
     */
    public tokenGil: string;

    /**
     * Guilded bot client
     */
    public clientGil: Guilded.Client;

    /**
     * @param token Discord bot token
     * @param secret Discord application secret
     * @param web Developer logging Discord webhook URL
     * @param data MongoDB database URI
     * @param gil Guilded bot token
     */
    constructor(token: string, secret: string, web: string, data: string, gil: string) {
        this.token = token;
        this.secret = secret;

        this.dev_wh = web;

        this.db = new SaveDataClient(data);

        this.commands = [];

        this.assets = parsedSysAssets;

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

        this.rest.setToken(this.token);
    };
};