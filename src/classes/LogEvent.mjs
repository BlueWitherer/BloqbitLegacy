import { Events } from 'discord.js';

class LogEvent {
    /**
     * Enum of the event type
     * @type {Events}
     */
    event;

    /**
     * Function to execute for this event type
     * @type {Function}
     */
    execute;

    /**
     * 
     * @param {Events} event Enum of the event type
     * @param {Function} exec Function to execute for this event type
     */
    constructor(event, exec) {
        this.event = event;
        this.execute = exec;

        return this;
    };
};

export default LogEvent;