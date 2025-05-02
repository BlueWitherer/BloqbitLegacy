import SaveDataClient from '../SaveDataClient.js';

import { Client } from 'discord.js';

class UserHandler {
    /**
     * Creates a new instance of UserHandler.
     * @param _client - Discord bot client.
     * @param _db - Database settings.
     */
    constructor(_client: Client, _db: SaveDataClient) {
        console.debug("Initiating global user handler...");
        console.warn("User handler not implemented yet");
    };
};

export default UserHandler;