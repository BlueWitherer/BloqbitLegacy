import Command from './Command.js';
import ContextButton from './ContextButton.js';
import SaveDataClient from './SaveDataClient.js';

import SysAssets from "#assets" with { type: 'json' };

import { Client, Collection, GatewayIntentBits, Partials, } from 'discord.js';
import { RESTPostAPIChatInputApplicationCommandsJSONBody, RESTPostAPIContextMenuApplicationCommandsJSONBody } from 'discord-api-types/rest/v10';
import { REST } from '@discordjs/rest';

const parsedSysAssets = JSON.parse(JSON.stringify(SysAssets));

/**
 * @class Bot model.
 */
export default class BloqbitClient {
    /**
     * Discord bot token
     */
    public token: string;

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
    public commands: RESTPostAPIChatInputApplicationCommandsJSONBody[];

    /**
     * Array of context buttons
     */
    public buttons: RESTPostAPIContextMenuApplicationCommandsJSONBody[];

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
     * Context buttons collection
     */
    public btns: Collection<string, ContextButton>;

    /**
     * Discord bot client
     */
    public client: Client;

    /**
     * Discord bot secret
     */
    public secret: string | undefined;

    /**
     * @param token Discord bot token
     * @param secret Discord application secret
     * @param web Developer logging Discord webhook URL
     * @param data MongoDB database URI
     * @param gil Guilded bot token
     */
    constructor(token: string, web: string, data: string, secret: string | undefined = undefined) {
        const noEnv = (env: string): never => { throw new Error(`Environment variable '${env}' is not defined!`); };

        this.token = token || noEnv('MAIN_TOKEN');

        this.dev_wh = web || noEnv('MAIN_LOG_WH');

        this.db = new SaveDataClient(data || noEnv('MONGO_URI'));

        this.commands = [];
        this.buttons = [];

        this.assets = parsedSysAssets;

        this.rest = new REST();

        this.cmds = new Collection();
        this.btns = new Collection();

        this.client = new Client({
            "intents": [
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
                GatewayIntentBits.AutoModerationExecution,
            ],
            "partials": [
                Partials.Channel,
                Partials.Message,
                Partials.User,
                Partials.Reaction,
                Partials.GuildMember,
                Partials.GuildScheduledEvent,
                Partials.ThreadMember,
            ],
        });

        this.secret = secret;

        this.rest.setToken(this.token);
    };
};