import Config from './Config.js';
import SaveDataClient from './SaveDataClient.js';

import SysAssets from "#assets" with { type: 'json' };

import { CacheType, ContextMenuCommandBuilder, MessageContextMenuCommandInteraction, UserContextMenuCommandInteraction } from 'discord.js';

/**
 * Type definition for the execute function of a command.
 */
export type ExecuteContextButton = (
    interaction: MessageContextMenuCommandInteraction<CacheType> | UserContextMenuCommandInteraction<CacheType>,
    assets: typeof SysAssets,
    system: Config,
    db: SaveDataClient,
) => Promise<void>;

/**
 * Context menu button class for defining bot commands.
 */
export default class ContextButton {
    /**
     * Data of the command.
     */
    public data: ContextMenuCommandBuilder;

    /**
     * Function to execute for this command.
     */
    public execute: ExecuteContextButton;

    /**
     * Constructor for the Command class.
     * 
     * @param data Data of the context menu button.
     * @param execute Function to execute for this command
     */
    constructor(
        data: ContextMenuCommandBuilder,
        execute: ExecuteContextButton,
    ) {
        this.data = data;
        this.execute = execute;
    };
};