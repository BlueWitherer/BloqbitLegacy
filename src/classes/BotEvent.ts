import BloqbitClient from './BloqbitClient.js';

import { Events } from 'discord.js';

/**
 * Represents a log event in the system.
 */
export default class BotEvent {
    /**
     * Enum of the event type
     */
    public event: Events;

    /**
     * Function to execute for this log event type
     */
    public execute: (bot: BloqbitClient, ...args: unknown[]) => Promise<void>;

    /**
     * Creates a new instance
     * 
     * @param event - Enum of the event type.
     * @param exec - Function to execute for this event type.
     */
    constructor(event: Events, exec: (bot: BloqbitClient, ...args: unknown[]) => Promise<void>) {
        this.event = event;
        this.execute = exec;
    };
};