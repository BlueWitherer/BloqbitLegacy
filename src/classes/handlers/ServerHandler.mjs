import { SaveDataClient } from '../../classes.mjs';
import { Client } from 'discord.js';

class ServerHandler {
    /**
     * 
     * @param {Client} client Discord bot client.
     * @param {SaveDataClient} db Database settings.
     */
    constructor(client, db) {
        console.debug("Initiating global server handler...");
    };
};

export default ServerHandler;