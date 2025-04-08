import SysAssets from '../assets.json' with { type: 'json' };

import SaveDataClient from './SaveDataClient.mjs';

import { Client, Collection, IntentsBitField, Partials } from 'discord.js';
import { REST } from '@discordjs/rest';

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
     */
    constructor(token, secret, web, db) {
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
                IntentsBitField.Flags.GuildExpressions,
                IntentsBitField.Flags.GuildPresences,
                IntentsBitField.Flags.GuildVoiceStates,
                IntentsBitField.Flags.GuildIntegrations,
                IntentsBitField.Flags.GuildMembers,
                IntentsBitField.Flags.GuildWebhooks,
                IntentsBitField.Flags.GuildModeration,
                IntentsBitField.Flags.GuildMessageReactions,
                IntentsBitField.Flags.GuildMessageTyping,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.MessageContent,
                IntentsBitField.Flags.DirectMessages,
            ],
            partials: [
                Partials.Channel,
                Partials.Message,
                Partials.User,
                Partials.GuildMember,
                Partials.GuildScheduledEvent,
                Partials.Reaction,
                Partials.ThreadMember,
            ],
        });

        return this;
    };
};