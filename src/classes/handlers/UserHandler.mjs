import { SaveDataClient } from '../../classes.mjs';
import { Client } from 'discord.js';

class UserHandler {
    /**
     * 
     * @param {Client} client Discord bot client.
     * @param {SaveDataClient} db Database settings.
     */
    constructor(client, db) {
        console.debug("Initiating global user handler...");
    };
};

export default UserHandler;