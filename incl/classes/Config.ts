export class Filter {
    public enabled: boolean;
    public roles: string[];
    public channels: string[];
    public filterMode: number;
    public permFilterMode: number;
    public punishment: number;
    public keywords: string[];
    public logs: string;

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
 * @memberof Roles
 */
export class RolesToggles {
    public immune: boolean;
    public noPing: boolean;
    public streaming: boolean;
    public mute: boolean;

    constructor({ immune = false, noPing = false, streaming = false, mute = false }: Partial<RolesToggles>) {
        this.immune = immune;
        this.noPing = noPing;
        this.streaming = streaming;
        this.mute = mute;

        return this;
    };
};

/**
 * Immune, anti-ping, and mute roles configuration
 *
 * **Uses:**
 * - {@link RolesToggles}
 */
export class Roles {
    public settings: RolesToggles;
    public immune: string[];
    public noPing: string[];
    public streaming: string;
    public mute: string;

    constructor({ settings = new RolesToggles({}), immune = [], noPing = [], streaming = "", mute = "" }: Partial<Roles>) {
        this.settings = new RolesToggles(settings);
        this.immune = immune;
        this.noPing = noPing;
        this.streaming = streaming;
        this.mute = mute;

        return this;
    };
};

/**
 * @memberof Welcome
 */
export class WelcomeMessage {
    public content: string;

    constructor({ content = "Welcome, %user%!" }: Partial<WelcomeMessage>) {
        this.content = content;

        return this;
    };
};

/**
 * Welcomer configuration
 * 
 * **Uses:**
 * - {@link WelcomeMessage}
 */
export class Welcome {
    public enabled: boolean;
    public webhookEnabled: boolean;
    public channel: string;
    public webhook: string;
    public message: WelcomeMessage;

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
 * @memberof GhostPing
 */
export class DeletedPings {
    public users: boolean;
    public bots: boolean;
    public roles: boolean;
    public everyone: boolean;

    constructor({ users = true, bots = false, roles = true, everyone = true }: Partial<DeletedPings>) {
        this.users = users;
        this.bots = bots;
        this.roles = roles;
        this.everyone = everyone;

        return this;
    };
};

/**
 * Anti ghost ping configuration
 * 
 * **Uses:**
 * - {@link DeletedPings}
 */
export class GhostPing {
    public enabled: boolean;
    public settings: DeletedPings;
    public noMods: boolean;

    constructor({ enabled = false, settings = new DeletedPings({}), noMods = false }: Partial<GhostPing>) {
        this.enabled = enabled;
        this.settings = new DeletedPings(settings);
        this.noMods = noMods;

        return this;
    };
};

/**
 * Announcement auto-publisher configuration
 */
export class AutoPublish {
    public enabled: boolean;
    public channels: string[];
    public bots: boolean;

    constructor({ enabled = false, channels = [], bots = false }: Partial<AutoPublish>) {
        this.enabled = enabled;
        this.channels = channels;
        this.bots = bots;

        return;
    };
};

export class AutoMod {
    public enabled: boolean;
    public swearFilter: Filter;
    public linkFilter: Filter;
    public inviteFilter: Filter;
    public dupetextFilter: Filter;
    public massmentionFilter: Filter;
    public nicknameFilter: Filter;
    public antispam: Filter;
    public antialt: Filter;
    public antichain: Filter;
    public antiping: Filter;

    constructor({
        enabled = false,
        swearFilter = new Filter({}),
        linkFilter = new Filter({}),
        inviteFilter = new Filter({}),
        dupetextFilter = new Filter({}),
        massmentionFilter = new Filter({}),
        nicknameFilter = new Filter({}),
        antispam = new Filter({}),
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
        this.antialt = new Filter(antialt);
        this.antichain = new Filter(antichain);
        this.antiping = new Filter(antiping);
    };
};

/**
 * @memberof Logs
 */
export class LogsActions {
    public autoMod: boolean;
    public moderator: boolean;
    public invites: boolean;
    public ban: boolean;
    public join: boolean;
    public leave: boolean;
    public nickname: boolean;
    public timeout: boolean;
    public msgDel: boolean;
    public msgUpd: boolean;
    public msgPin: boolean;
    public msgBulkDel: boolean;
    public remAllReact: boolean;
    public rolesAdd: boolean;
    public rolesRem: boolean;
    public rolesAssign: boolean;
    public rolesUnassign: boolean;
    public channelDel: boolean;
    public channelAdd: boolean;
    public vcJoin: boolean;
    public vcMove: boolean;
    public vcLeave: boolean;

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
 * **Uses:**
 * - {@link LogsActions}
 */
export class Logs {
    public enabled: boolean;
    public webhookEnabled: boolean;
    public channel: string;
    public webhook: string;
    public inbox: string;
    public actions: LogsActions;

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
    public min: number;
    public max: number;
    public roles: string[];
    public channels: string[];
    public filterMode: number;

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
 * **Uses:**
 * - {@link XP}
 */
export class Leveling {
    public enabled: boolean;
    public xp: XP;
    public levelMax: number;
    public levelRewarding: boolean;

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
    public name: string;
    public namePlural: string;
    public symbol: string;
    public image: string;
    public useImg: boolean;

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
    public enabled: boolean;
    public min: number;
    public max: number;

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
    public enabled: boolean;
    public channels: string[];
    public filterMode: number;

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
 * **Uses:**
 * - {@link Currency}
 * - {@link Gambling}
 * - {@link Drops}
 */
export class Economy {
    public enabled: boolean;
    public currency: Currency;
    public gambling: Gambling;
    public drops: Drops;

    constructor({ enabled = false, currency = new Currency({}), gambling = new Gambling({}), drops = new Drops({}) }: Partial<Economy>) {
        this.enabled = enabled;
        this.currency = new Currency(currency);
        this.gambling = new Gambling(gambling);
        this.drops = new Drops(drops);

        return this;
    };
};

/**
 * Full server configuration
 */
export default class Config {
    public server: string;
    public automod: AutoMod;
    public ghostping: GhostPing;
    public autopublish: AutoPublish;
    public logs: Logs;
    public roles: Roles;
    public welcome: Welcome;
    public leveling: Leveling;
    public economy: Economy;

    constructor({
        server = "",
        automod = new AutoMod({}),
        ghostping = new GhostPing({}),
        autopublish = new AutoPublish({}),
        logs = new Logs({}),
        roles = new Roles({}),
        welcome = new Welcome({}),
        leveling = new Leveling({}),
        economy = new Economy({}),
    }: Partial<Config>) {
        this.server = server;
        this.automod = new AutoMod(automod);
        this.ghostping = new GhostPing(ghostping);
        this.autopublish = new AutoPublish(autopublish);
        this.logs = new Logs(logs);
        this.roles = new Roles(roles);
        this.welcome = new Welcome(welcome);
        this.leveling = new Leveling(leveling);
        this.economy = new Economy(economy);

        return this;
    };
};