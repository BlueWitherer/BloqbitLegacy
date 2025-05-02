import SaveDataClient from '../SaveDataClient.js';

import { Client } from 'discord.js';

class ServerHandler {
    /**
     * Creates a new instance of ServerHandler.
     * @param _client - Discord bot client.
     * @param _db - Database settings.
     */
    constructor(_client: Client, _db: SaveDataClient) {
        console.debug("Initiating global server handler...");
        console.warn("User handler not implemented yet");
    };
};

export default ServerHandler;