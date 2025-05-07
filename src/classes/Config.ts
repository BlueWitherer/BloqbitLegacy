export class Filter {
    enabled: boolean;
    roles: string[];
    channels: string[];
    filterMode: number;
    permFilterMode: number;
    punishment: number;
    keywords: string[];
    logs: string;

    constructor({ enabled = false, roles = [], channels = [], filterMode = 0, permFilterMode = 0, punishment = 0, keywords = [], logs = "" }: Partial<Filter>) {
        this.enabled = enabled;
        this.roles = roles;
        this.channels = channels;
        this.filterMode = filterMode;
        this.permFilterMode = permFilterMode;
        this.punishment = punishment;
        this.keywords = keywords;
        this.logs = logs;

        return this;
    };
};

/**
 * Immune, anti-ping, blacklist, and mute roles configuration
 */
export class Roles {
    immune: string[];
    noPing: string[];
    blacklist: string;
    mute: string;

    constructor({ immune = [], noPing = [], blacklist = "", mute = "" }: Partial<Roles>) {
        this.immune = immune;
        this.noPing = noPing;
        this.blacklist = blacklist;
        this.mute = mute;

        return this;
    };
};

/**
 * @memberof Welcome
 */
export class WelcomeMessage {
    content: string;

    constructor({ content = "Welcome, %user%!" }: Partial<WelcomeMessage>) {
        this.content = content;

        return this;
    };
};

/**
 * Welcomer configuration
 * 
 * Uses:
 * - {@link WelcomeMessage}
 */
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
        this.message = new WelcomeMessage(message);

        return this;
    };
};

/**
 * Announcement auto-publisher configuration
 */
export class AutoPublish {
    enabled: boolean;
    channels: string[];
    bots: boolean;

    constructor({ enabled = false, channels = [], bots = false }: Partial<AutoPublish>) {
        this.enabled = enabled;
        this.channels = channels;
        this.bots = bots;

        return;
    };
};

/**
 * @memberof AntiRaid
 */
export class Alts {
    enabled: boolean;
    punishment: number;
    untilPunish: number;
    timeThreshold: number;

    constructor({ enabled = false, punishment = 0, untilPunish = 10, timeThreshold = 5 }: Partial<Alts>) {
        this.enabled = enabled;
        this.punishment = punishment;
        this.untilPunish = untilPunish;
        this.timeThreshold = timeThreshold;

        return this;
    };
};

/**
 * User anti-raid configuration
 * 
 * Uses:
 * - {@link Alts}
 */
export class AntiRaid {
    text: Filter;
    alts: Alts;

    constructor({ text = new Filter({}), alts = new Alts({}) }: Partial<AntiRaid>) {
        this.text = new Filter(text);
        this.alts = new Alts(alts);

        return this;
    };
};

export class AutoMod {
    enabled: boolean;
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
        antiping = new Filter({}),
    }: Partial<AutoMod>) {
        this.enabled = enabled;
        this.swearFilter = new Filter(swearFilter);
        this.linkFilter = new Filter(linkFilter);
        this.inviteFilter = new Filter(inviteFilter);
        this.dupetextFilter = new Filter(dupetextFilter);
        this.massmentionFilter = new Filter(massmentionFilter);
        this.nicknameFilter = new Filter(nicknameFilter);
        this.antispam = new Filter(antispam);
        this.antiraid = new AntiRaid(antiraid);
        this.antialt = new Filter(antialt);
        this.antichain = new Filter(antichain);
        this.antiping = new Filter(antiping);
    };
};

/**
 * @memberof Logs
 */
export class LogsActions {
    autoMod: boolean;
    moderator: boolean;
    invites: boolean;
    ban: boolean;
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
    channelDel: boolean;
    channelAdd: boolean;
    vcJoin: boolean;
    vcMove: boolean;
    vcLeave: boolean;

    constructor({
        autoMod = true,
        moderator = true,
        invites = false,
        ban = false,
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
        channelDel = false,
        channelAdd = false,
        vcJoin = false,
        vcMove = false,
        vcLeave = false,
    }: Partial<LogsActions>) {
        this.autoMod = autoMod;
        this.moderator = moderator;
        this.invites = invites;
        this.ban = ban;
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
        this.channelDel = channelDel;
        this.channelAdd = channelAdd;
        this.vcJoin = vcJoin;
        this.vcMove = vcMove;
        this.vcLeave = vcLeave;

        return this;
    };
};

/**
 * Logging configuration
 * 
 * Uses:
 * - {@link LogsActions}
 */
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
        this.actions = new LogsActions(actions);

        return this;
    };
};

/**
 * @memberof Leveling
 */
export class XP {
    min: number;
    max: number;
    roles: string[];
    channels: string[];
    filterMode: number;

    constructor({ min = 5, max = 25, roles = [], channels = [], filterMode = 0 }: Partial<XP>) {
        this.min = min;
        this.max = max;
        this.roles = roles;
        this.channels = channels;
        this.filterMode = filterMode;

        return this;
    };
};

/**
 * Leveling & XP configuration
 * 
 * Uses:
 * - {@link XP}
 */
export class Leveling {
    enabled: boolean;
    xp: XP;
    levelMax: number;
    levelRewarding: boolean;

    constructor({ enabled = true, xp = new XP({}), levelMax = 100, levelRewarding = true }: Partial<Leveling>) {
        this.enabled = enabled;
        this.xp = new XP(xp);
        this.levelMax = levelMax;
        this.levelRewarding = levelRewarding;

        return this;
    };
};

/**
 * @memberof Economy
 */
export class Currency {
    name: string;
    namePlural: string;
    symbol: string;
    image: string;
    useImg: boolean;

    constructor({ name = "Currency", namePlural = "Currency", symbol = "$", image = "", useImg = false }: Partial<Currency>) {
        this.name = name;
        this.namePlural = namePlural;
        this.symbol = symbol;
        this.image = image;
        this.useImg = useImg;

        return this;
    };
};

/**
 * @memberof Economy
 */
export class Gambling {
    enabled: boolean;
    min: number;
    max: number;

    constructor({ enabled = false, min = 5, max = 100 }: Partial<Gambling>) {
        this.enabled = enabled;
        this.min = min;
        this.max = max;

        return this;
    };
};

/**
 * @memberof Economy
 */
export class Drops {
    enabled: boolean;
    channels: string[];
    filterMode: number;

    constructor({ enabled = false, channels = [], filterMode = 0 }: Partial<Drops>) {
        this.enabled = enabled;
        this.channels = channels;
        this.filterMode = filterMode;

        return this;
    };
};

/**
 * Economy & gambling configuration
 * 
 * Uses:
 * - {@link Currency}
 * - {@link Gambling}
 * - {@link Drops}
 */
export class Economy {
    enabled: boolean;
    currency: Currency;
    gambling: Gambling;
    drops: Drops;

    constructor({ enabled = false, currency = new Currency({}), gambling = new Gambling({}), drops = new Drops({}) }: Partial<Economy>) {
        this.enabled = enabled;
        this.currency = new Currency(currency);
        this.gambling = new Gambling(gambling);
        this.drops = new Drops(drops);

        return this;
    };
};

/**
 * AI chat bot configuration
 */
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

        return this;
    };
};

/**
 * Full server configuration
 */
export default class Config {
    server: string;
    automod: AutoMod;
    logs: Logs;
    roles: Roles;
    welcome: Welcome;
    leveling: Leveling;
    economy: Economy;
    cleverbot: Cleverbot;

    constructor({
        server = "",
        automod = new AutoMod({}),
        logs = new Logs({}),
        roles = new Roles({}),
        welcome = new Welcome({}),
        leveling = new Leveling({}),
        economy = new Economy({}),
        cleverbot = new Cleverbot({})
    }: Partial<Config>) {
        this.server = server;
        this.automod = new AutoMod(automod);
        this.logs = new Logs(logs);
        this.roles = new Roles(roles);
        this.welcome = new Welcome(welcome);
        this.leveling = new Leveling(leveling);
        this.economy = new Economy(economy);
        this.cleverbot = new Cleverbot(cleverbot);

        return this;
    };
};