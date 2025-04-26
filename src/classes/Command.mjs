import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

import SysAssets from '../assets.json' with { type: 'json' };
import SaveDataClient from './SaveDataClient.mjs';
import Config from './Configuration.mjs';

class Command {
    /**
     * @type {SlashCommandBuilder | import('discord.js').SlashCommandSubcommandsOnlyBuilder | import('discord.js').SlashCommandOptionsOnlyBuilder}
     */
    data;

    /**
     * @callback ExecuteCommand Function to execute for this command
     * 
     * @param {ChatInputCommandInteraction} interaction The interaction for the slash command
     * @param {typeof SysAssets} assets The configuration of the client's visual assets.
     * @param {Config} system The settings model for the bot's configuration.
     * @param {SaveDataClient} db The database information.
     * 
     * @returns {Promise<void>}
     */

    /**
     * @type {ExecuteCommand}
     */
    execute;

    /**
     * @type {boolean}
     */
    premium = false;

    /**
     * @type {boolean}
     */
    dev = false;

    /**
     * @param {SlashCommandBuilder | import('discord.js').SlashCommandSubcommandsOnlyBuilder | import('discord.js').SlashCommandOptionsOnlyBuilder} dat Data of the command
     * @param {ExecuteCommand} exec Function to execute for this command
     * @param {boolean} prem Whether this command is reserved for supporters
     * @param {boolean} dv Whether this command is reserved for developers
     */
    constructor(dat, exec, prem = false, dv = false) {
        this.data = dat;
        this.execute = exec;
        this.premium = prem || false;
        this.dev = dv || false;

        return this;
    };
};

export default Command;