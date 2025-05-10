import Config from './Config.js';
import SaveDataClient from './SaveDataClient.js';

import SysAssets from '../assets.json' with { type: 'json' };

import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder, SlashCommandOptionsOnlyBuilder } from 'discord.js';

/**
 * Type definition for the execute function of a command.
 */
export type ExecuteCommand = (
    interaction: ChatInputCommandInteraction,
    assets: typeof SysAssets,
    system: Config,
    db: SaveDataClient
) => Promise<void>;

/**
 * Command class for defining bot commands.
 */
export default class Command {
    /**
     * Data of the command.
     */
    public data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder;

    /**
     * Function to execute for this command.
     */
    public execute: ExecuteCommand;

    /**
     * Constructor for the Command class.
     * @param data Data of the command.
     * @param execute Function to execute for this command.
     * @param premium Whether this command is reserved for supporters.
     * @param dev Whether this command is reserved for developers.
     */
    constructor(
        data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder,
        execute: ExecuteCommand,
    ) {
        this.data = data;
        this.execute = execute;
    };
};