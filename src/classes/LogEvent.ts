import { BloqbitClient } from '../classes.js';
import { Events } from 'discord.js';

/**
 * Represents a log event in the system.
 */
class LogEvent {
    /**
     * Enum of the event type.
     */
    event: Events;

    /**
     * Function to execute for this log event type.
     */
    execute: (bot: BloqbitClient, ...args: unknown[]) => Promise<void>;

    /**
     * Creates a new LogEvent instance.
     * @param event - Enum of the event type.
     * @param exec - Function to execute for this event type.
     */
    constructor(event: Events, exec: (bot: BloqbitClient, ...args: unknown[]) => Promise<void>) {
        this.event = event;
        this.execute = exec;
    }
}

export default LogEvent;