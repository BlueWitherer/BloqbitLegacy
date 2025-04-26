export class Roles {
    immune: string[];
    pingFree: string[];
    blacklist: string;
    mute: string;
    member: string;

    constructor({ immune = [], pingFree = [], blacklist = "", mute = "", member = "" }: Partial<Roles>) {
        this.immune = immune;
        this.pingFree = pingFree;
        this.blacklist = blacklist;
        this.mute = mute;
        this.member = member;
    }
}

export class WelcomeMessage {
    content: string;

    constructor({ content = "" }: Partial<WelcomeMessage>) {
        this.content = content;
    }
}

export class Welcome {
    enabled: boolean;
    webhookEnabled: boolean;
    channel: string;
    webhook: string;
    message: WelcomeMessage;

    constructor({ enabled = false, webhookEnabled = false, channel = "", webhook = "", message = new WelcomeMessage({}) }: Partial<Welcome>) {
        this.enabled = enabled;
        this.webhookEnabled = webhookEnabled;
        this.channel = channel;
        this.webhook = webhook;
        this.message = message;
    }
}

export class Filter {
    enabled: boolean;
    roles: string[];
    channels: string[];
    filterMode: number;
    permFilterMode: number;
    punishment: number;
    keywords: string[];
    keywordsSuper: string[];
    logs: string;

    constructor({ enabled = false, roles = [], channels = [], filterMode = 0, permFilterMode = 0, punishment = 0, keywords = [], keywordsSuper = [], logs = "" }: Partial<Filter>) {
        this.enabled = enabled;
        this.roles = roles;
        this.channels = channels;
        this.filterMode = filterMode;
        this.permFilterMode = permFilterMode;
        this.punishment = punishment;
        this.keywords = keywords;
        this.keywordsSuper = keywordsSuper;
        this.logs = logs;
    }
}

export class Verification {
    enabled: boolean;
    channel: string;
    logs: string;

    constructor({ enabled = false, channel = "", logs = "" }: Partial<Verification>) {
        this.enabled = enabled;
        this.channel = channel;
        this.logs = logs;
    }
}

export class AntiRaid {
    text: Filter;
    alts: { enabled: boolean; punishment: number; untilPunish: number; timeThreshold: number };
    logs: string;

    constructor({ text = new Filter({}), alts = { enabled: false, punishment: 0, untilPunish: 0, timeThreshold: 0 }, logs = "" }: Partial<AntiRaid>) {
        this.text = text;
        this.alts = alts;
        this.logs = logs;
    }
}

export class AutoMod {
    enabled: boolean;
    verification: Verification;
    swearFilter: Filter;
    linkFilter: Filter;
    inviteFilter: Filter;
    dupetextFilter: Filter;
    massmentionFilter: Filter;
    nicknameFilter: Filter;
    antispam: Filter;
    antiraid: AntiRaid;
    antialt: Filter;
    antichain: Filter;
    antiping: Filter;

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
    }: Partial<AutoMod>) {
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
    }
}

export class LogsActions {
    autoMod: boolean;
    moderator: boolean;
    invites: boolean;
    ban: boolean;
    kick: boolean;
    join: boolean;
    leave: boolean;
    nickname: boolean;
    timeout: boolean;
    msgDel: boolean;
    msgUpd: boolean;
    msgPin: boolean;
    msgBulkDel: boolean;
    remAllReact: boolean;
    rolesAdd: boolean;
    rolesRem: boolean;
    rolesAssign: boolean;
    rolesUnassign: boolean;
    serverUpd: boolean;
    channelDel: boolean;
    channelUpd: boolean;
    channelAdd: boolean;
    vcJoin: boolean;
    vcMove: boolean;
    vcLeave: boolean;
    rolesUpd: boolean;

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
        channelAdd = false,
        vcJoin = false,
        vcMove = false,
        vcLeave = false,
        rolesUpd = false
    }: Partial<LogsActions>) {
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
        this.vcJoin = vcJoin;
        this.vcMove = vcMove;
        this.vcLeave = vcLeave;
        this.rolesUpd = rolesUpd;
    }
}

export class Logs {
    enabled: boolean;
    webhookEnabled: boolean;
    channel: string;
    webhook: string;
    inbox: string;
    actions: LogsActions;

    constructor({ enabled = false, webhookEnabled = true, channel = "", webhook = "", inbox = "", actions = new LogsActions({}) }: Partial<Logs>) {
        this.enabled = enabled;
        this.webhookEnabled = webhookEnabled;
        this.channel = channel;
        this.webhook = webhook;
        this.inbox = inbox;
        this.actions = actions;
    }
}

export class Leveling {
    enabled: boolean;
    chat: { min: number; max: number; roles: string[]; channels: string[]; filterMode: number };
    levelMax: number;
    levelRewarding: boolean;

    constructor({ enabled = true, chat = { min: 1, max: 25, roles: [], channels: [], filterMode: 0 }, levelMax = 100, levelRewarding = true }: Partial<Leveling>) {
        this.enabled = enabled;
        this.chat = chat;
        this.levelMax = levelMax;
        this.levelRewarding = levelRewarding;
    }
}

export class Economy {
    enabled: boolean;
    currency: { name: string; namePlural: string; symbol: string; image: string };
    gambling: { enabled: boolean; min: number; max: number };
    drops: { enabled: boolean; channels: string[]; filterMode: number };

    constructor({ enabled = false, currency = { name: "Cash", namePlural: "Cash", symbol: "$", image: "" }, gambling = { enabled: false, min: 5, max: 100 }, drops = { enabled: true, channels: [], filterMode: 1 } }: Partial<Economy>) {
        this.enabled = enabled;
        this.currency = currency;
        this.gambling = gambling;
        this.drops = drops;
    }
}

export class Cleverbot {
    enabled: boolean;
    personality: string;
    channels: string[];
    roles: string[];
    filterMode: number;
    permFilterMode: number;

    constructor({ enabled = false, personality = "", channels = [], roles = [], filterMode = 0, permFilterMode = 0 }: Partial<Cleverbot>) {
        this.enabled = enabled;
        this.personality = personality;
        this.channels = channels;
        this.roles = roles;
        this.filterMode = filterMode;
        this.permFilterMode = permFilterMode;
    }
}

export default class Config {
    version: number;
    server: string;
    active: boolean;
    activeCode: string;
    activeExpiry: number;
    customActive: boolean;
    customBotToken: string;
    roles: Roles;
    welcome: Welcome;
    automod: AutoMod;
    logs: Logs;
    leveling: Leveling;
    economy: Economy;
    cleverbot: Cleverbot;

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
    }: Partial<Config>) {
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
    }
}