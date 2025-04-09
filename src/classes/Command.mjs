import Discord, { ChatInputCommandInteraction } from 'discord.js';

import SysAssets from '../assets.json' with { type: 'json' };
import { Config, SaveDataClient } from 'classes.mjs';

class Command {
    /**
     * @type {Discord.SlashCommandOptionsOnlyBuilder}
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
     * @param {Discord.SlashCommandOptionsOnlyBuilder} dat Data of the command
     * @param {ExecuteCommand} exec Function to execute for this command
     * @param {boolean} prem Whether this command is reserved for supporters
     * @param {boolean} dv Whether this command is reserved for developers
     */
    constructor(dat, exec, prem, dv) {
        this.data = dat;
        this.execute = exec;
        this.premium = prem || false;
        this.dev = dv || false;

        return this;
    };
};

export default Command;