import { BloqbitClient } from '../classes.mjs';
import { Events } from 'discord.js';

class LogEvent {
    /**
     * Enum of the event type
     * @type {Events}
     */
    event;

    /**
     * @callback ExecuteLog Function to execute for this log event type
     * 
     * @param {BloqbitClient} bot
     * @param {...any} args
     * 
     * @returns {Promise<void>}
     */

    /**
     * @type {ExecuteLog}
     */
    execute;

    /**
     * 
     * @param {Events} event Enum of the event type
     * @param {ExecuteLog} exec Function to execute for this event type
     */
    constructor(event, exec) {
        this.event = event;
        this.execute = exec;

        return this;
    };
};

export default LogEvent;