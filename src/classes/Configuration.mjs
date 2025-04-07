export class Roles {
    constructor({ immune = [], pingFree = [], blacklist = "", mute = "", member = "" }) {
        this.immune = immune;
        this.pingFree = pingFree;
        this.blacklist = blacklist;
        this.mute = mute;
        this.member = member;
    };
};

export class WelcomeMessage {
    constructor({ content = "" }) {
        this.content = content;
    };
};

export class Welcome {
    constructor({ enabled = false, webhookEnabled = false, channel = "", webhook = "", message = new WelcomeMessage({}) }) {
        this.enabled = enabled;
        this.webhookEnabled = webhookEnabled;
        this.channel = channel;
        this.webhook = webhook;
        this.message = message;
    };
};

export class Filter {
    constructor({ enabled = false, roles = [], channels = [], filterMode = 0, permFilterMode = 0, punishment = 0, keywords = [], keywordsSuper = [], logs = "" }) {
        this.enabled = enabled;
        this.roles = roles;
        this.channels = channels;
        this.filterMode = filterMode;
        this.permFilterMode = permFilterMode;
        this.punishment = punishment;
        this.keywords = keywords;
        this.keywordsSuper = keywordsSuper;
        this.logs = logs;
    };
};

export class Verification {
    constructor({ enabled = false, channel = "", logs = "" }) {
        this.enabled = enabled;
        this.channel = channel;
        this.logs = logs;
    };
};

export class AntiRaid {
    constructor({ text = new Filter({}), alts = { enabled: false, punishment: 0, untilPunish: 0, timeThreshold: 0 }, logs = "" }) {
        this.text = text;
        this.alts = {
            enabled: alts.enabled,
            punishment: alts.punishment,
            untilPunish: alts.untilPunish,
            timeThreshold: alts.timeThreshold,
        };
        this.logs = logs;
    };
};

export class AutoMod {
    constructor({
        enabled = false,
        verification = new Verification({}),
        swearFilter = new Filter({}),
        linkFilter = new Filter({}),
        inviteFilter = new Filter({}),
        dupetextFilter = new Filter({}),
        massmentionFilter = new Filter({}),
        nicknameFilter = new Filter({}),
        antispam = new Filter({}),
        antiraid = new AntiRaid({}),
        antialt = new Filter({}),
        antichain = new Filter({}),
        antiping = new Filter({})
    }) {
        this.enabled = enabled;
        this.verification = verification;
        this.swearFilter = swearFilter;
        this.linkFilter = linkFilter;
        this.inviteFilter = inviteFilter;
        this.dupetextFilter = dupetextFilter;
        this.massmentionFilter = massmentionFilter;
        this.nicknameFilter = nicknameFilter;
        this.antispam = antispam;
        this.antiraid = antiraid;
        this.antialt = antialt;
        this.antichain = antichain;
        this.antiping = antiping;
    };
};

export class LogsActions {
    constructor({
        autoMod = true,
        moderator = true,
        invites = false,
        ban = false,
        kick = false,
        join = false,
        leave = false,
        nickname = false,
        timeout = false,
        msgDel = false,
        msgUpd = false,
        msgPin = false,
        msgBulkDel = false,
        remAllReact = false,
        rolesAdd = false,
        rolesRem = false,
        rolesAssign = false,
        rolesUnassign = false,
        serverUpd = false,
        channelDel = false,
        channelUpd = false,
        channelAdd = false
    }) {
        this.autoMod = autoMod;
        this.moderator = moderator;
        this.invites = invites;
        this.ban = ban;
        this.kick = kick;
        this.join = join;
        this.leave = leave;
        this.nickname = nickname;
        this.timeout = timeout;
        this.msgDel = msgDel;
        this.msgUpd = msgUpd;
        this.msgPin = msgPin;
        this.msgBulkDel = msgBulkDel;
        this.remAllReact = remAllReact;
        this.rolesAdd = rolesAdd;
        this.rolesRem = rolesRem;
        this.rolesAssign = rolesAssign;
        this.rolesUnassign = rolesUnassign;
        this.serverUpd = serverUpd;
        this.channelDel = channelDel;
        this.channelUpd = channelUpd;
        this.channelAdd = channelAdd;
    };
};

export class Logs {
    constructor({ enabled = false, webhookEnabled = false, channel = "", webhook = "", inbox = "", actions = new LogsActions({}) }) {
        this.enabled = enabled;
        this.webhookEnabled = webhookEnabled;
        this.channel = channel;
        this.webhook = webhook;
        this.inbox = inbox;
        this.actions = actions;
    };
};

export class Leveling {
    constructor({ enabled = true, chat = { min: 1, max: 25, roles: [], channels: [], filterMode: 0 }, levelMax = 100, levelRewarding = true }) {
        this.enabled = enabled;
        this.chat = {
            min: chat.min,
            max: chat.max,
            roles: chat.roles,
            channels: chat.channels,
            filterMode: chat.filterMode,
        };
        this.levelMax = levelMax;
        this.levelRewarding = levelRewarding;
    };
};

export class Economy {
    constructor({ enabled = false, currency = { name: "Cash", namePlural: "Cash", symbol: "$", image: "" }, gambling = { enabled: false, min: 5, max: 100 }, drops = { enabled: true, channels: [], filterMode: 1 } }) {
        this.enabled = enabled;
        this.currency = {
            name: currency.name,
            namePlural: currency.namePlural,
            symbol: currency.symbol,
            image: currency.image,
        };
        this.gambling = {
            enabled: gambling.enabled,
            min: gambling.min,
            max: gambling.max,
        };
        this.drops = {
            enabled: drops.enabled,
            channels: drops.channels,
            filterMode: drops.filterMode,
        };
    };
};

export class Cleverbot {
    constructor({ enabled = false, personality = "", channels = [], roles = [], filterMode = 0, permFilterMode = 0 }) {
        this.enabled = enabled;
        this.personality = personality;
        this.channels = channels;
        this.roles = roles;
        this.filterMode = filterMode;
        this.permFilterMode = permFilterMode;
    };
};

export default class Config {
    constructor({
        version = 1,
        server = "",
        active = false,
        activeCode = "",
        activeExpiry = 1,
        customActive = false,
        customBotToken = "",
        roles = new Roles({}),
        welcome = new Welcome({}),
        automod = new AutoMod({}),
        logs = new Logs({}),
        leveling = new Leveling({}),
        economy = new Economy({}),
        cleverbot = new Cleverbot({})
    }) {
        this.version = version;
        this.server = server;
        this.active = active;
        this.activeCode = activeCode;
        this.activeExpiry = activeExpiry;
        this.customActive = customActive;
        this.customBotToken = customBotToken;
        this.roles = roles;
        this.welcome = welcome;
        this.automod = automod;
        this.logs = logs;
        this.leveling = leveling;
        this.economy = economy;
        this.cleverbot = cleverbot;
    };

    toObject() {
        return { ...this };
    };
};