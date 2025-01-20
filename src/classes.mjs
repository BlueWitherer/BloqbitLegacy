import ClientModel from './classes/ClientModel.mjs';
import BotDatabase from './classes/BotDatabase.mjs';

import MessageHandler from './classes/handlers/MessageHandler.mjs';
import UserHandler from './classes/handlers/UserHandler.mjs';
import ServerHandler from './classes/handlers/ServerHandler.mjs';

import CommandCategory from './classes/enum/CommandCategory.mjs';
import ModActionType from './classes/enum/ModActionType.mjs';
import LogEventType from './classes/enum/LogEventType.mjs';
import FilterClass from './classes/enum/FilterClass.mjs';
import FilterMode from './classes/enum/FilterMode.mjs';

export default class Classes {
    static ClientModel = ClientModel;
    static BotDatabase = BotDatabase;

    static MessageHandler = MessageHandler;
    static UserHandler = UserHandler;
    static ServerHandler = ServerHandler;

    static CommandCategory = CommandCategory;
    static ModActionType = ModActionType;
    static LogEventType = LogEventType;
    static FilterClass = FilterClass;
    static FilterMode = FilterMode;
};