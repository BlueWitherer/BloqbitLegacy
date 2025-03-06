import SysAssets from '../assets.json' with { type: 'json' };

import SaveData from './SaveData.mjs';

import dotenv from 'dotenv';

import { Client, Collection, IntentsBitField, Partials } from 'discord.js';
import { REST } from '@discordjs/rest';

dotenv.config();

/**
 * @class Bot model.
 */
export default class BloqbitClient {
    /**
     * 
     * @param {string} token Bot token.
     * @param {string} secret Application secret.
     * @returns 
     */
    constructor(token, secret) {
        this.online = false;

        this.token = token;
        this.secret = secret;

        this.dev_wh = process.env.LOG_WH;

        this.db = new SaveData();

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