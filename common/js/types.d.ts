import { IObjectID } from "monk";
export interface CounterDocument {
    counterName: string;
    value: integer;
}
/**
 * IDStrings are an internal (ish) identifier used to identify
 * Game + Playtype combos. These are used because TypeScript cannot accurately
 * apply two levels of indexing to types, which makes writing generic interfaces
 * like the ScoreDocument (Especially the ScoreDocument) *very* hard!
 */
export declare type IDStrings = "iidx:SP" | "iidx:DP" | "popn:9B" | "sdvx:Single" | "usc:Single" | "ddr:SP" | "ddr:DP" | "maimai:Single" | "museca:Single" | "jubeat:Single" | "bms:7K" | "bms:14K" | "chunithm:Single" | "gitadora:Gita" | "gitadora:Dora";
export interface IDStringToPlaytype {
    "iidx:SP": "SP";
    "iidx:DP": "DP";
    "popn:9B": "9B";
    "sdvx:Single": "Single";
    "usc:Single": "Single";
    "ddr:SP": "SP";
    "ddr:DP": "DP";
    "maimai:Single": "Single";
    "jubeat:Single": "Single";
    "museca:Single": "Single";
    "bms:7K": "7K";
    "bms:14K": "14K";
    "chunithm:Single": "Single";
    "gitadora:Gita": "Gita";
    "gitadora:Dora": "Dora";
}
export interface IDStringToGame {
    "iidx:SP": "iidx";
    "iidx:DP": "iidx";
    "popn:9B": "popn";
    "sdvx:Single": "sdvx";
    "usc:Single": "usc";
    "ddr:SP": "ddr";
    "ddr:DP": "ddr";
    "maimai:Single": "maimai";
    "jubeat:Single": "jubeat";
    "museca:Single": "museca";
    "bms:7K": "bms";
    "bms:14K": "bms";
    "chunithm:Single": "chunithm";
    "gitadora:Gita": "gitadora";
    "gitadora:Dora": "gitadora";
}
/**
 * A utility type for creating an ID string given a game and playtype.
 * It should be noted that typescript refuses to assert that
 * IDString<G, P> is a member of IDStrings. You're free to attempt to
 * rewrite IDStrings to try and get this to work, I promise you it doesn't.
 */
/**
 * All MongoDB Documents require this field, or atleast they all have them in ktchi's DB.
 */
export interface MongoDBDocument {
    _id?: IObjectID;
}
export declare type Databases = "sessions" | "folders" | "scores" | "queries" | "rivals" | "notifications" | "imports" | "tierlistdata" | "tierlist" | "goals" | "user-goals" | "user-milestones" | "milestones" | "users";
export declare type ValidDatabases = Databases | `songs-${Game}` | `charts-${Game}`;
/**
 * Supported games by Kamaitachi.
 */
export declare type Game = "iidx" | "museca" | "maimai" | "jubeat" | "popn" | "sdvx" | "ddr" | "bms" | "chunithm" | "gitadora" | "usc";
/**
 * This is the generic response from the Kamaitachi API in event of a failure.
 */
export interface UnsuccessfulAPIResponse {
    success: false;
    description: string;
}
/**
 * In the event of a successful API request, body is attached onto the request, which contains
 * endpoint-defined information about the response, such as database data.
 */
export interface SuccessfulAPIResponse {
    success: true;
    description: string;
    body: Record<string, unknown>;
}
export interface ChartFolderLookupDocument extends MongoDBDocument {
    chartID: string;
    folderID: string;
}
export interface Playtypes {
    iidx: "SP" | "DP";
    popn: "9B";
    sdvx: "Single";
    usc: "Single";
    ddr: "SP" | "DP";
    maimai: "Single";
    jubeat: "Single";
    museca: "Single";
    chunithm: "Single";
    bms: "7K" | "14K";
    gitadora: "Gita" | "Dora";
}
declare type IIDXGrades = "F" | "E" | "D" | "C" | "B" | "A" | "AA" | "AAA" | "MAX-" | "MAX";
declare type SDVXGrades = "D" | "C" | "B" | "A" | "A+" | "AA" | "AA+" | "AAA" | "AAA+" | "S";
declare type DDRGrades = "D" | "D+" | "C-" | "C" | "C+" | "B-" | "B" | "B+" | "A-" | "A" | "A+" | "AA-" | "AA" | "AA+" | "AAA" | "MAX";
declare type GitadoraGrades = "C" | "B" | "A" | "S" | "SS" | "MAX";
export interface Grades {
    "iidx:SP": IIDXGrades;
    "iidx:DP": IIDXGrades;
    "popn:9B": "E" | "D" | "C" | "B" | "A" | "AA" | "AAA" | "S";
    "sdvx:Single": SDVXGrades;
    "usc:Single": SDVXGrades;
    "ddr:SP": DDRGrades;
    "ddr:DP": DDRGrades;
    "maimai:Single": "E" | "D" | "C" | "B" | "A" | "AA" | "AAA" | "S" | "S+" | "SS" | "SS+" | "SSS" | "SSS+";
    "jubeat:Single": "E" | "D" | "C" | "B" | "A" | "S" | "SS" | "SSS" | "EXC";
    "museca:Single": "没" | "拙" | "凡" | "佳" | "良" | "優" | "秀" | "傑" | "傑G";
    "bms:7K": IIDXGrades;
    "bms:14K": IIDXGrades;
    "chunithm:Single": "BASIC" | "ADVANCED" | "EXPERT" | "MASTER" | "WORLD'S END";
    "gitadora:Gita": GitadoraGrades;
    "gitadora:Dora": GitadoraGrades;
}
declare type IIDXLamps = "NO PLAY" | "FAILED" | "ASSIST CLEAR" | "EASY CLEAR" | "CLEAR" | "HARD CLEAR" | "EX HARD CLEAR" | "FULL COMBO";
declare type GitadoraLamps = "FAILED" | "CLEAR" | "FULL COMBO" | "EXCELLENT";
declare type SDVXLamps = "FAILED" | "CLEAR" | "EXCESSIVE CLEAR" | "ULTIMATE CHAIN" | "PERFECT ULTIMATE CHAIN";
declare type DDRLamps = "FAILED" | "CLEAR" | "LIFE4" | "FULL COMBO" | "GREAT FULL COMBO" | "PERFECT FULL COMBO" | "MARVELOUS FULL COMBO";
export interface Lamps {
    "iidx:SP": IIDXLamps;
    "iidx:DP": IIDXLamps;
    "popn:9B": "FAILED" | "CLEAR" | "FULL COMBO" | "PERFECT";
    "sdvx:Single": SDVXLamps;
    "usc:Single": SDVXLamps;
    "ddr:SP": DDRLamps;
    "ddr:DP": DDRLamps;
    "maimai:Single": "FAILED" | "CLEAR" | "FULL COMBO" | "ALL PERFECT" | "ALL PERFECT+";
    "jubeat:Single": "FAILED" | "CLEAR" | "FULL COMBO" | "EXCELLENT";
    "museca:Single": "FAILED" | "CLEAR" | "CONNECT ALL" | "PERFECT CONNECT ALL";
    "bms:7K": IIDXLamps;
    "bms:14K": IIDXLamps;
    "chunithm:Single": "FAILED" | "CLEAR" | "FULL COMBO" | "ALL JUSTICE" | "ALL JUSTICE CRITICAL";
    "gitadora:Gita": GitadoraLamps;
    "gitadora:Dora": GitadoraLamps;
}
export interface Difficulties {
    "iidx:SP": "BEGINNER" | "NORMAL" | "HYPER" | "ANOTHER" | "LEGGENDARIA";
    "iidx:DP": "NORMAL" | "HYPER" | "ANOTHER" | "LEGGENDARIA";
    "popn:9B": "Easy" | "Normal" | "Hyper" | "EX";
    "sdvx:Single": "NOV" | "ADV" | "EXH" | "MXM" | "INF" | "GRV" | "HVN" | "VVD";
    "usc:Single": "NOV" | "ADV" | "EXH" | "INF";
    "ddr:SP": "BEGINNER" | "BASIC" | "DIFFICULT" | "EXPERT" | "CHALLENGE";
    "ddr:DP": "BASIC" | "DIFFICULT" | "EXPERT" | "CHALLENGE";
    "maimai:Single": "Easy" | "Basic" | "Advanced" | "Expert" | "Master" | "Re:Master";
    "jubeat:Single": "BSC" | "ADV" | "EXT";
    "museca:Single": "Green" | "Yellow" | "Red";
    "bms:7K": "BEGINNER" | "NORMAL" | "HYPER" | "ANOTHER" | "INSANE" | "CUSTOM";
    "bms:14K": "BEGINNER" | "NORMAL" | "HYPER" | "ANOTHER" | "INSANE" | "CUSTOM";
    "chunithm:Single": "BASIC" | "ADVANCED" | "EXPERT" | "MASTER" | "WORLD'S END";
    "gitadora:Gita": "BASIC" | "ADVANCED" | "EXTREME" | "MASTER" | "BASS BASIC" | "BASS ADVANCED" | "BASS EXTREME" | "BASS MASTER";
    "gitadora:Dora": "BASIC" | "ADVANCED" | "EXTREME" | "MASTER";
}
export interface CustomRatings {
    iidx: {
        SP: {
            BPI: number;
            "K%": number;
        };
        DP: {
            BPI: number;
        };
    };
    popn: {
        "9B": Record<string, never>;
    };
    sdvx: {
        Single: {
            VF4: number;
            VF5: number;
        };
    };
    usc: {
        Single: {
            VF4: number;
            VF5: number;
        };
    };
    ddr: {
        SP: {
            MFCP: integer;
        };
        DP: {
            MFCP: integer;
        };
    };
    maimai: {
        Single: Record<string, never>;
    };
    jubeat: {
        Single: {
            jubility: number;
        };
    };
    museca: {
        Single: Record<string, never>;
    };
    bms: {
        "7K": Record<string, never>;
        "14K": Record<string, never>;
    };
    chunithm: {
        Single: Record<string, never>;
    };
    gitadora: {
        Single: Record<string, never>;
    };
}
/**
 * An alias for number, that makes part of the code self-documenting.
 * Note that if it were possible to enforce integer-y ness, then I would absolutely do so here
 * but i can not.
 */
export declare type integer = number;
export declare type Ratings = Record<Game, Record<Playtypes[Game], number>>;
export interface GoalChartQuery {
    collection: ValidDatabases;
    query: Record<string, unknown>;
}
export interface GoalDocument extends MongoDBDocument {
    directChartID: string | null;
    directChartIDs?: string[] | null;
    chartQuery: GoalChartQuery | null;
    scoreQuery: Record<string, unknown>;
    criteria: {
        type: "gte" | "lte" | "lt" | "gt" | "anyMatch" | "all";
        value: number | null;
        mode?: "proportion" | null;
    };
    title: string;
    goalID: string;
    timeAdded: integer;
    createdBy: integer;
    game: Game;
    playtype: Playtypes[Game];
}
export interface RivalGroupDocument extends MongoDBDocument {
    name: string;
    desc: string;
    founderID: integer;
    members: integer[];
    mutualGroup: boolean;
    isDefault: boolean;
    game: Game;
    playtype: Playtypes[Game];
    settings: {
        scoreCompareMode: "relevant" | "folder";
        strictness: number;
        boundary: number;
        scoreCompareFolderID: string | null;
        cellShading: "grade" | "lamp";
    };
    rivalGroupID: string;
}
export declare type MRGChallengeModes = "goal" | "lamp" | "score";
export interface MutualRivalGroupChallenge extends MongoDBDocument {
    challengeID: string;
    derivedScoreID: string | null;
    mode: MRGChallengeModes;
    name: string;
    postedBy: integer;
    goalID: string;
    mrgID: string;
    postedAt: integer;
}
export declare type MRGFolderTargetFieldNames = "scoreData.percent" | "scoreData.gradeIndex" | "scoreData.lampIndex" | "calculatedData.gameSpecific.BPI";
export interface MRGFolderTarget {
    field: MRGFolderTargetFieldNames;
    target: number;
}
export interface MRGFolderInformation<I extends IDStrings = IDStrings> {
    folderID: string;
    difficulty: Difficulties[I][] | null;
    datapoints: MRGFolderTarget[];
}
export interface MutualRivalGroupDocument extends MongoDBDocument {
    name: string;
    about: string;
    founderID: integer;
    members: integer[];
    outgoingInvites: integer[];
    game: Game;
    playtype: Playtypes[Game];
    folders: MRGFolderInformation[];
    settings: Record<string, never>;
    mrgID: string;
}
interface SessionScoreInfo {
    pbInfo: {
        isGeneralPB: boolean;
        isGradePB: boolean;
        isScorePB: boolean;
        isLampPB: boolean;
        isNewScore: boolean;
        lampDelta: integer;
        percentDelta: number;
        gradeDelta: integer;
        scoreDelta: number;
    };
    scoreID: string;
}
export interface SessionDocument extends MongoDBDocument {
    performance: number;
    userID: integer;
    sessionID: string;
    name: string;
    desc: string;
    service: string;
    game: Game;
    playtype: Playtypes[Game];
    timestamp: integer;
    timeEnded: integer;
    timeStarted: integer;
    lampPerformance: number;
    scorePerformance: number;
    scores: SessionScoreInfo[];
    highlight: boolean;
}
export interface ImportSessionInfo {
    sessionID: string;
    name: string;
    scoreCount: integer;
    performance: number;
}
export interface ImportDocument extends MongoDBDocument {
    userID: integer;
    timeStarted: integer;
    timeFinished: integer;
    game: Game;
    skippedScores: integer;
    successfulScores: string[];
    service: string;
    sessionInfo: ImportSessionInfo[];
    importID: string;
    timeTaken: number;
    msPerScore: number;
}
interface ImportErrContent {
    type: string;
    message: string;
}
export interface KTBlackImportDocument extends MongoDBDocument {
    userID: integer;
    timeStarted: number;
    timeFinished: number;
    idStrings: IDStrings[];
    importID: string;
    scoreIDs: string[];
    errors: ImportErrContent[];
    createdSessions: string[];
    importType: ImportTypes;
}
export interface UserGoalDocument extends MongoDBDocument {
    goalID: string;
    userID: integer;
    game: Game;
    playtype: Playtypes[Game];
    achieved: boolean;
    timeSet: integer;
    timeAchieved: integer | null;
    lastInteraction: integer | null;
    progress: number;
    progressHuman: string;
    outOf: number;
    outOfHuman: string;
}
interface MilestoneGoalReference {
    goalID: string;
    note: string | null;
}
interface MilestoneSection {
    title: string;
    desc: string;
    goals: MilestoneGoalReference[];
}
export interface MilestoneDocument extends MongoDBDocument {
    game: Game;
    playtype: Playtypes[Game];
    criteria: {
        /**
         * All: All goals must be achieved in order for the milestone to be complete
         * Count: Goals achieved must be greater than or equal to criteria.value.
         */
        type: "all" | "count" | "percent";
        value: number | null;
    };
    createdBy: integer;
    title: string;
    desc: string;
    milestoneData: MilestoneSection[];
    milestoneID: string;
    group: string | null;
}
export interface QueryDocument extends MongoDBDocument {
    query: Record<string, string>;
    queryID: string;
    name: string;
    desc: string;
    byUser: integer;
    timeAdded: integer;
    timesUsed: integer;
    forDatabase: "scores";
}
export declare type NotificationType = "clandisband" | "claninvite" | "goals" | "import" | "milestone" | "mrginvite" | "mrgkicked" | "mrgdisband" | "mrginviterejected";
export interface NotificationDocument extends MongoDBDocument {
    notifID: string;
    title: string;
    read: boolean;
    body: string;
    toUserID: integer;
    fromUserID: integer;
    type: NotificationType;
    data: Record<string, unknown>;
}
export interface FunFactDocument extends MongoDBDocument {
    text: string;
    nsfw: boolean;
    anonymous: boolean;
    userID: integer;
    funfactID: string;
    timestamp: integer;
}
/**
 * PublicUserDocument: These are the public values returned from GetUser functions.
 * Note that the private fields: password, email and integrations, are not present in this document.
 */
export interface PublicUserDocument extends MongoDBDocument {
    username: string;
    usernameLowercase: string;
    id: integer;
    settings: {
        nsfwSplashes: boolean;
        invisible: boolean;
    };
    friends: integer[];
    socialMedia: {
        discord?: string | null;
        twitter?: string | null;
        github?: string | null;
        steam?: string | null;
        youtube?: string | null;
        twitch?: string | null;
    };
    lastSeen: integer;
    about: string;
    customPfp: boolean;
    customBanner: boolean;
    permissions: {
        admin?: boolean;
    };
    clan: string | null;
}
export interface UserGameStats<T extends Game> extends MongoDBDocument {
    userID: integer;
    game: T;
    playtype: Playtypes[T];
    rating: number;
    lampRating: number;
    customRatings: Record<string, number>;
    classes: Record<string, string>;
}
/**
 * PrivateUserDocument is the document indicating that we've returned everything about the user
 * from the DB - including their private information.
 */
export interface PrivateUserDocument extends PublicUserDocument {
    password: string;
    email: string;
}
export interface PublicAPIPermissions {
    selfkey: boolean;
    admin: boolean;
}
export interface PublicAPIKeyDocument extends MongoDBDocument {
    assignedTo: integer;
    expireTime: integer;
    apiKey: string;
    permissions: PublicAPIPermissions;
}
export interface InviteCodeDocument extends MongoDBDocument {
    createdBy: integer;
    code: string;
    createdOn: number;
    consumed: boolean;
}
export interface PublicAPIRequestDocument extends MongoDBDocument {
    key: PublicAPIKeyDocument;
    location: string;
    timestamp: integer;
    ip: string;
}
export interface IIDXEamusementScoreDocument extends MongoDBDocument {
    chartID: string;
    lamp: Lamps["iidx:SP" | "iidx:DP"];
    score: integer;
    ranking: integer;
}
interface ChartDocumentFlags {
    "iidx:SP": "IN BASE GAME" | "OMNIMIX" | "N-1";
    "iidx:DP": "IN BASE GAME" | "OMNIMIX" | "N-1";
    "popn:9B": "IN BASE GAME" | "OMNIMIX";
    "sdvx:Single": "IN BASE GAME" | "OMNIMIX" | "N-1";
    "usc:Single": "CUSTOM";
    "ddr:SP": "IN BASE GAME" | "N-1";
    "ddr:DP": "IN BASE GAME" | "N-1";
    "maimai:Single": "IN BASE GAME";
    "jubeat:Single": "IN BASE GAME";
    "museca:Single": "IN BASE GAME" | "OMNIMIX";
    "bms:7K": never;
    "bms:14K": never;
    "chunithm:Single": "IN BASE GAME" | "OMNIMIX";
    "gitadora:Gita": "IN BASE GAME" | "OMNIMIX";
    "gitadora:Dora": "IN BASE GAME" | "OMNIMIX";
}
interface CDDataIIDXSP {
    notecount: integer;
    inGameID: integer;
}
interface CDDataDDRSP {
    songHash: string;
    inGameID: string;
}
interface ChartDocumentData {
    "iidx:SP": CDDataIIDXSP;
    "iidx:DP": CDDataIIDXSP;
    "popn:9B": Record<string, never>;
    "sdvx:Single": {
        inGameID: integer;
    };
    "usc:Single": {
        hashSHA256: string;
    };
    "ddr:SP": CDDataDDRSP;
    "ddr:DP": CDDataDDRSP;
    "maimai:Single": {
        maxPercent: number;
        inGameID: string;
    };
    "jubeat:Single": Record<string, never>;
    "museca:Single": Record<string, never>;
    "bms:7K": {
        hashMD5: string;
        hashSHA256: string;
    };
    "bms:14K": {
        hashMD5: string;
        hashSHA256: string;
    };
    "chunithm:Single": {
        inGameID: integer;
    };
    "gitadora:Gita": {
        inGameID: integer;
    };
    "gitadora:Dora": {
        inGameID: integer;
    };
}
export interface AnyChartDocument extends MongoDBDocument {
    chartID: string;
    rgcID: string | null;
    songID: integer;
    level: string;
    levelNum: number;
    length: string | null;
    bpmString: string | null;
    difficulty: Difficulties[IDStrings];
    playtype: Playtypes[Game];
    isRemoved: boolean;
}
export interface ChartDocument<I extends IDStrings> extends AnyChartDocument {
    difficulty: Difficulties[I];
    playtype: IDStringToPlaytype[I];
    flags: Record<ChartDocumentFlags[I], boolean>;
    data: ChartDocumentData[I];
}
export interface TierlistDocument extends MongoDBDocument {
    game: Game;
    title: string;
    isDefault: boolean;
    tierlistID: string;
    playtype: Playtypes[Game];
    config: {
        usePrefix?: boolean;
        grades?: [string, number][];
    };
}
export interface TierlistDataDocument<I extends IDStrings = IDStrings> extends MongoDBDocument {
    playtype: IDStringToPlaytype[I];
    songID: integer;
    difficulty: Difficulties[I];
    tierlistID: string;
    tiers: Record<string, number>;
    chartID: string;
}
interface TierlistPermissions {
    edit: boolean;
    submit: boolean;
    vote: boolean;
}
export interface TierlistV2Parent<F extends string, G extends Game = Game> extends MongoDBDocument {
    game: G;
    playtype: Playtypes[G];
    name: string;
    isDefault: boolean;
    tierlistID: string;
    createdBy: integer;
    createdAt: number;
    permissions: Record<integer, TierlistPermissions> & {
        anyPlayer: TierlistPermissions;
    };
    description: string;
    lastUpdated: number;
    config: {
        autoHumanise: boolean;
        flags: F[];
    };
}
export interface TierlistV2DataDocument<F extends string> extends MongoDBDocument {
    chartID: string;
    tierlistID: string;
    type: "grade" | "lamp" | "score";
    data: {
        key: string;
        value: number;
        humanised: string;
        flags: {
            [flag in F]: boolean;
        };
    };
    tierlistDataID: string;
}
interface SongDocumentData {
    iidx: {
        genre: string;
    };
    museca: {
        titleJP: string;
        artistJP: string;
    };
    maimai: {
        titleJP: string;
        artistJP: string;
        genre: string;
    };
    jubeat: Record<string, never>;
    popn: Record<string, never>;
    sdvx: {
        uscEquiv: integer | null;
    };
    usc: {
        sdvxEquiv: integer | null;
    };
    ddr: Record<string, never>;
    bms: {
        genre: string;
    };
    chunithm: {
        genre: string;
    };
    gitadora: Record<string, never>;
}
export interface AnySongDocument extends MongoDBDocument {
    id: integer;
    title: string;
    artist: string;
    isAvailable: boolean;
    firstVersion: string | null;
    /**
     * Alternative names for this song, to be used while searching.
     */
    "search-titles": string[];
    /**
     * Alternative titles for this song, to be used whenever the song is
     * requested.
     */
    "alt-titles": string[];
    /**
     * Contains the versions this song appeared in. This is used for
     * disambiguation in some games.
     */
    versions: string[];
}
export interface SongDocument<G extends Game> extends AnySongDocument {
    data: SongDocumentData[G];
}
export interface FolderDocument extends MongoDBDocument {
    title: string;
    game: Game;
    custom: boolean;
    byUser: integer;
    views: integer;
    type: "query";
    query: {
        collection: string;
        query: Record<string, unknown>;
    };
    folderID: string;
    table: string;
}
export interface UserMilestoneDocument extends MongoDBDocument {
    milestoneID: string;
    userID: integer;
    game: Game;
    playtype: Playtypes[Game];
    timeSet: integer;
    achieved: boolean;
    timeAchieved: integer | null;
    progress: integer;
}
declare type RanOptions = "NONRAN" | "RANDOM" | "R-RANDOM" | "S-RANDOM" | "MIRROR";
interface IIDXSPScoreMeta {
    random: RanOptions | null;
    assist: "NO ASSIST" | "AUTO SCRATCH" | "5KEYS" | "LEGACY NOTE" | "ASCR + 5KEY" | "ASCR + LEGACY" | "5KEYS + LEGACY" | "FULL ASSIST" | null;
    range: "NONE" | "SUDDEN+" | "HIDDEN+" | "SUD+ HID+" | "LIFT" | "LIFT SUD+" | null;
    gauge: "ASSISTED EASY" | "EASY" | "NORMAL" | "HARD" | "EX-HARD" | null;
    pacemaker: "NO GRAPH" | "MY BEST" | "RIVAL 1" | "RIVAL 2" | "RIVAL 3" | "RIVAL 4" | "RIVAL 5" | "RIVAL NEXT" | "RIVAL BEST" | "RIVAL AVERAGE" | "NATIONAL BEST" | "NATIONAL AVERAGE" | "PREFECTURE BEST" | "PREFECTURE AVERAGE" | "CLASS BEST" | "CLASS AVERAGE" | "VENUE BEST" | "VENUE NEXT" | "PREVIOUS GHOST" | "PACEMAKER AAA" | "PACEMAKER AA" | "PACEMAKER A" | "PACEMAKER" | /* ??? */ "PACEMAKER NEXT" | "PACEMAKER NEXT+" | "PLAYER 1" | "PLAYER 2" | null;
    pacemakerName: string | null;
    pacemakerTarget: integer | null;
}
interface BMS7KScoreMeta {
    random: RanOptions | null;
    inputDevice: "KEYBOARD" | "BM_CONTROLLER" | "MIDI" | null;
}
interface ScoreMetaLookup {
    "iidx:SP": IIDXSPScoreMeta;
    "iidx:DP": IIDXSPScoreMeta & {
        random: [RanOptions, RanOptions] | null;
    };
    "popn:9B": Record<string, never>;
    "sdvx:Single": Record<string, never>;
    "usc:Single": Record<string, never>;
    "ddr:SP": Record<string, never>;
    "ddr:DP": Record<string, never>;
    "maimai:Single": Record<string, never>;
    "jubeat:Single": Record<string, never>;
    "museca:Single": Record<string, never>;
    "bms:7K": BMS7KScoreMeta;
    "bms:14K": BMS7KScoreMeta & {
        random: [RanOptions, RanOptions] | null;
    };
    "chunithm:Single": Record<string, never>;
    "gitadora:Gita": Record<string, never>;
    "gitadora:Dora": Record<string, never>;
}
interface BASE_VALID_HIT_META {
    fast: integer | null;
    slow: integer | null;
    maxCombo: integer | null;
}
declare type IIDXHitMeta = BASE_VALID_HIT_META & {
    bp: integer | null;
    gauge: number | null;
    gaugeHistory: number[] | null;
    comboBreak: integer | null;
};
declare type BMSJudgePermutations = `${"e" | "l"}${"bd" | "pr" | "gd" | "gr" | "pg"}`;
declare type BMSHitMeta = BASE_VALID_HIT_META & {
    [K in BMSJudgePermutations]: integer;
} & {
    bp: integer | null;
    gauge: number | null;
    diedAt: integer | null;
};
declare type SDVXHitMeta = BASE_VALID_HIT_META & {
    gauge: number | null;
    btnRate: number | null;
    holdRate: number | null;
    laserRate: number | null;
};
export interface HitMetaLookup {
    "iidx:SP": IIDXHitMeta;
    "iidx:DP": IIDXHitMeta;
    "popn:9B": BASE_VALID_HIT_META & {
        gauge: number;
    };
    "sdvx:Single": SDVXHitMeta;
    "usc:Single": SDVXHitMeta;
    "ddr:SP": BASE_VALID_HIT_META;
    "ddr:DP": BASE_VALID_HIT_META;
    "maimai:Single": BASE_VALID_HIT_META;
    "jubeat:Single": BASE_VALID_HIT_META;
    "museca:Single": BASE_VALID_HIT_META;
    "bms:7K": BMSHitMeta;
    "bms:14K": BMSHitMeta;
    "chunithm:Single": BASE_VALID_HIT_META;
    "gitadora:Gita": BASE_VALID_HIT_META;
    "gitadora:Dora": BASE_VALID_HIT_META;
}
declare type IIDXJudges = "pgreat" | "great" | "good" | "bad" | "poor";
declare type DDRJudges = "marvelous" | "perfect" | "great" | "good" | "boo" | "miss" | "ok" | "ng";
declare type GitadoraJudges = "perfect" | "great" | "good" | "ok" | "miss";
declare type SDVXJudges = "critical" | "near" | "miss";
export interface JudgementLookup {
    "iidx:SP": IIDXJudges;
    "iidx:DP": IIDXJudges;
    "popn:9B": "cool" | "great" | "good" | "miss";
    "sdvx:Single": SDVXJudges;
    "usc:Single": SDVXJudges;
    "ddr:SP": DDRJudges;
    "ddr:DP": DDRJudges;
    "maimai:Single": "perfect" | "great" | "good" | "miss";
    "jubeat:Single": "perfect" | "great" | "good" | "bad" | "miss";
    "museca:Single": "critical" | "near" | "miss";
    "bms:7K": IIDXJudges;
    "bms:14K": IIDXJudges;
    "chunithm:Single": "jcrit" | "justice" | "attack" | "miss";
    "gitadora:Gita": GitadoraJudges;
    "gitadora:Dora": GitadoraJudges;
}
export interface GameSpecificCalcLookup {
    "iidx:SP": "BPI" | "K%";
    "iidx:DP": "BPI";
    "popn:9B": never;
    "sdvx:Single": "VF4" | "VF5";
    "usc:Single": "VF4" | "VF5";
    "ddr:SP": "MFCP";
    "ddr:DP": "MFCP";
    "maimai:Single": never;
    "jubeat:Single": never;
    "museca:Single": never;
    "bms:7K": never;
    "bms:14K": never;
    "chunithm:Single": never;
    "gitadora:Gita": never;
    "gitadora:Dora": never;
}
export interface ScoreDocument<I extends IDStrings = IDStrings> extends MongoDBDocument {
    service: string;
    game: IDStringToGame[I];
    playtype: IDStringToPlaytype[I];
    userID: integer;
    scoreData: {
        score: number;
        lamp: Lamps[I];
        percent: number;
        grade: Grades[I];
        lampIndex: integer;
        gradeIndex: integer;
        esd: number | null;
        hitData: Partial<Record<JudgementLookup[I], integer>>;
        hitMeta: Partial<HitMetaLookup[I]>;
    };
    scoreMeta: Partial<ScoreMetaLookup[I]>;
    calculatedData: {
        rating: number;
        lampRating: number;
        gameSpecific: Partial<Record<GameSpecificCalcLookup[I], number | null>>;
        ranking: integer | null;
        outOf: integer | null;
    };
    timeAchieved: integer | null;
    songID: integer;
    chartID: string;
    highlight: boolean;
    comment: string | null;
    timeAdded: integer;
    isScorePB: boolean;
    isLampPB: boolean;
    scoreID: string;
    importType: ImportTypes | null;
}
export declare type FileUploadImportTypes = "file/csv:eamusement-iidx";
export declare type ImportTypes = FileUploadImportTypes;
export interface ImportProcessInfoKTDataNotFound {
    success: false;
    type: "KTDataNotFound";
    message: string | null;
    content: {
        data: unknown;
        context: unknown;
    };
}
export interface ImportProcessInfoScoreExists {
    success: false;
    type: "ScoreExists";
    message: string | null;
    content: {
        scoreID: string;
    };
}
export interface ImportProcessInfoInvalidDatapoint {
    success: false;
    type: "InvalidDatapoint";
    message: string | null;
    content: {
        field?: string;
    };
}
export interface ImportProcessInfoScoreImported<I extends IDStrings = IDStrings> {
    success: true;
    type: "ScoreImported";
    message: string | null;
    content: {
        score: ScoreDocument<I>;
    };
}
export interface ImportProcessInfoInternalError {
    success: false;
    type: "InternalError";
    message: string | null;
    content: Record<string, never>;
}
export declare type ImportProcessingInfo<I extends IDStrings = IDStrings> = ImportProcessInfoKTDataNotFound | ImportProcessInfoScoreExists | ImportProcessInfoScoreImported<I> | ImportProcessInfoInvalidDatapoint | ImportProcessInfoInternalError;
export interface IIDXBPIData {
    chartID: string;
    kavg: integer;
    wr: integer;
    kesd: number;
    coef: number | null;
}
export {};
