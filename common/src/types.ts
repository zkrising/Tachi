// Monk type-stub to avoid pulling the whole dep in
import type { AllClassSets, GameClasses, GameClassSets } from "./game-classes";
import type { FilterQuery } from "mongodb";

export interface IObjectID {
	readonly toHexString: () => string;
	readonly toString: () => string;
}

export interface CounterDocument {
	counterName: string;
	value: integer;
}

export type Playtype = Playtypes[Game];

/**
 * IDStrings are an internal (ish) identifier used to identify
 * Game + Playtype combos. These are used because TypeScript cannot accurately
 * apply two levels of indexing to types, which makes writing generic interfaces
 * like the ScoreDocument (Especially the ScoreDocument) *very* hard!
 */
export type IDStrings =
	| "bms:7K"
	| "bms:14K"
	| "chunithm:Single"
	| "ddr:DP"
	| "ddr:SP"
	| "gitadora:Dora"
	| "gitadora:Gita"
	| "iidx:DP"
	| "iidx:SP"
	| "itg:Stamina"
	| "jubeat:Single"
	| "maimai:Single"
	| "museca:Single"
	| "pms:Controller"
	| "pms:Keyboard"
	| "popn:9B"
	| "sdvx:Single"
	| "usc:Controller"
	| "usc:Keyboard"
	| "wacca:Single";

export interface IDStringToPlaytype {
	"iidx:SP": "SP";
	"iidx:DP": "DP";
	"popn:9B": "9B";
	"sdvx:Single": "Single";
	"usc:Keyboard": "Keyboard";
	"usc:Controller": "Controller";
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
	"wacca:Single": "Single";
	"pms:Keyboard": "Keyboard";
	"pms:Controller": "Controller";
	"itg:Stamina": "Stamina";
}

export interface IDStringToGame {
	"iidx:SP": "iidx";
	"iidx:DP": "iidx";
	"popn:9B": "popn";
	"sdvx:Single": "sdvx";
	"usc:Keyboard": "usc";
	"usc:Controller": "usc";
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
	"wacca:Single": "wacca";
	"pms:Keyboard": "pms";
	"pms:Controller": "pms";
	"itg:Stamina": "itg";
}

export interface GameToIDStrings {
	iidx: "iidx:DP" | "iidx:SP";
	sdvx: "sdvx:Single";
	usc: "usc:Controller" | "usc:Keyboard";
	ddr: "ddr:DP" | "ddr:SP";
	maimai: "maimai:Single";
	jubeat: "jubeat:Single";
	museca: "museca:Single";
	bms: "bms:7K" | "bms:14K";
	chunithm: "chunithm:Single";
	gitadora: "gitadora:Dora" | "gitadora:Gita";
	popn: "popn:9B";
	wacca: "wacca:Single";
	pms: "pms:Controller" | "pms:Keyboard";
	itg: "itg:Stamina";
}

/**
 * A utility type for creating an ID string given a game and playtype.
 * It should be noted that typescript refuses to assert that
 * IDString<G, P> is a member of IDStrings. You're free to attempt to
 * rewrite IDStrings to try and get this to work, I promise you it doesn't.
 */
// export type IDString<G extends Game, P extends Playtypes[G]> = `${G}:${P}`;

/**
 * All MongoDB Documents require this field, or atleast they all have them in ktchi's DB.
 */
export interface MongoDBDocument {
	_id?: IObjectID;
}

/**
 * All supported games by Tachi.
 */
export type Game =
	| "bms"
	| "chunithm"
	| "ddr"
	| "gitadora"
	| "iidx"
	| "itg"
	| "jubeat"
	| "maimai"
	| "museca"
	| "pms"
	| "popn"
	| "sdvx"
	| "usc"
	| "wacca";

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
export interface SuccessfulAPIResponse<T = unknown> {
	success: true;
	description: string;

	// This isn't ideal, but we need to restrict
	// this to only objects - Record<string, unknown>
	// mandates indexability of the type, which makes
	// it unusable for known objects.
	body: T;
}

export interface ChartFolderLookupDocument extends MongoDBDocument {
	chartID: string;
	folderID: string;
}

export interface Playtypes {
	iidx: "DP" | "SP";
	popn: "9B";
	sdvx: "Single";
	usc: "Controller" | "Keyboard";
	ddr: "DP" | "SP";
	maimai: "Single";
	jubeat: "Single";
	museca: "Single";
	chunithm: "Single";
	bms: "7K" | "14K";
	gitadora: "Dora" | "Gita";
	wacca: "Single";
	pms: "Controller" | "Keyboard";
	itg: "Stamina";
}

type IIDXGrades = "A" | "AA" | "AAA" | "B" | "C" | "D" | "E" | "F" | "MAX-" | "MAX";
type SDVXGrades = "A" | "A+" | "AA" | "AA+" | "AAA" | "AAA+" | "B" | "C" | "D" | "PUC" | "S";
type DDRGrades =
	| "A-"
	| "A"
	| "A+"
	| "AA-"
	| "AA"
	| "AA+"
	| "AAA"
	| "B-"
	| "B"
	| "B+"
	| "C-"
	| "C"
	| "C+"
	| "D"
	| "D+";

type GitadoraGrades = "A" | "B" | "C" | "MAX" | "S" | "SS";

export interface Grades {
	"iidx:SP": IIDXGrades;
	"iidx:DP": IIDXGrades;
	"popn:9B": "A" | "AA" | "AAA" | "B" | "C" | "D" | "E" | "S";
	"sdvx:Single": SDVXGrades;
	"usc:Keyboard": SDVXGrades;
	"usc:Controller": SDVXGrades;
	"ddr:SP": DDRGrades;
	"ddr:DP": DDRGrades;
	"maimai:Single":
		| "A"
		| "AA"
		| "AAA"
		| "B"
		| "C"
		| "D"
		| "E"
		| "F"
		| "S"
		| "S+"
		| "SS"
		| "SS+"
		| "SSS"
		| "SSS+";
	"jubeat:Single": "A" | "B" | "C" | "D" | "E" | "EXC" | "S" | "SS" | "SSS";
	"museca:Single": "佳" | "傑" | "傑G" | "優" | "凡" | "拙" | "没" | "秀" | "良";
	"bms:7K": IIDXGrades;
	"bms:14K": IIDXGrades;
	"chunithm:Single": "A" | "AA" | "AAA" | "B" | "BB" | "BBB" | "C" | "D" | "S" | "SS" | "SSS";
	"gitadora:Gita": GitadoraGrades;
	"gitadora:Dora": GitadoraGrades;
	"wacca:Single":
		| "A"
		| "AA"
		| "AAA"
		| "B"
		| "C"
		| "D"
		| "MASTER"
		| "S"
		| "S+"
		| "SS"
		| "SS+"
		| "SSS"
		| "SSS+";
	"pms:Controller": IIDXGrades;
	"pms:Keyboard": IIDXGrades;
	"itg:Stamina": "★" | "★★" | "★★★" | "★★★★" | "A" | "B" | "C" | "D" | "S-" | "S" | "S+";
}

type IIDXLamps =
	| "ASSIST CLEAR"
	| "CLEAR"
	| "EASY CLEAR"
	| "EX HARD CLEAR"
	| "FAILED"
	| "FULL COMBO"
	| "HARD CLEAR"
	| "NO PLAY";

type GitadoraLamps = "CLEAR" | "EXCELLENT" | "FAILED" | "FULL COMBO";

type SDVXLamps =
	| "CLEAR"
	| "EXCESSIVE CLEAR"
	| "FAILED"
	| "PERFECT ULTIMATE CHAIN"
	| "ULTIMATE CHAIN";

type DDRLamps =
	| "CLEAR"
	| "FAILED"
	| "FULL COMBO"
	| "GREAT FULL COMBO"
	| "LIFE4"
	| "MARVELOUS FULL COMBO"
	| "PERFECT FULL COMBO";

export interface Lamps {
	"iidx:SP": IIDXLamps;
	"iidx:DP": IIDXLamps;
	"popn:9B": "CLEAR" | "EASY CLEAR" | "FAILED" | "FULL COMBO" | "PERFECT";
	"sdvx:Single": SDVXLamps;
	"usc:Keyboard": SDVXLamps;
	"usc:Controller": SDVXLamps;
	"ddr:SP": DDRLamps;
	"ddr:DP": DDRLamps;
	"maimai:Single": "ALL PERFECT" | "ALL PERFECT+" | "CLEAR" | "FAILED" | "FULL COMBO";
	"jubeat:Single": "CLEAR" | "EXCELLENT" | "FAILED" | "FULL COMBO";
	"museca:Single": "CLEAR" | "CONNECT ALL" | "FAILED" | "PERFECT CONNECT ALL";
	"bms:7K": IIDXLamps;
	"bms:14K": IIDXLamps;
	"chunithm:Single": "ALL JUSTICE CRITICAL" | "ALL JUSTICE" | "CLEAR" | "FAILED" | "FULL COMBO";
	"gitadora:Gita": GitadoraLamps;
	"gitadora:Dora": GitadoraLamps;
	"wacca:Single": "ALL MARVELOUS" | "CLEAR" | "FAILED" | "FULL COMBO" | "MISSLESS";
	"pms:Controller": IIDXLamps;
	"pms:Keyboard": IIDXLamps;
	"itg:Stamina": "CLEAR" | "FAILED" | "FULL COMBO" | "FULL EXCELLENT COMBO" | "QUAD";
}

export type IIDX2DXTraSets = "All Scratch" | "Kichiku" | "Kiraku";
export type IIDXSPDifficulties = "ANOTHER" | "BEGINNER" | "HYPER" | "LEGGENDARIA" | "NORMAL";
export type IIDXDPDifficulties = "ANOTHER" | "HYPER" | "LEGGENDARIA" | "NORMAL";

export interface Difficulties {
	"iidx:SP": `${"" | `${IIDX2DXTraSets} `}${IIDXSPDifficulties}`;
	"iidx:DP": `${"" | `${IIDX2DXTraSets} `}${IIDXDPDifficulties}`;
	"popn:9B": "Easy" | "EX" | "Hyper" | "Normal";
	"sdvx:Single": "ADV" | "EXH" | "GRV" | "HVN" | "INF" | "MXM" | "NOV" | "VVD" | "XCD";
	"usc:Controller": "ADV" | "EXH" | "INF" | "NOV";
	"usc:Keyboard": "ADV" | "EXH" | "INF" | "NOV";
	"ddr:SP": "BASIC" | "BEGINNER" | "CHALLENGE" | "DIFFICULT" | "EXPERT";
	"ddr:DP": "BASIC" | "CHALLENGE" | "DIFFICULT" | "EXPERT";
	"maimai:Single": "Advanced" | "Basic" | "Easy" | "Expert" | "Master" | "Re:Master";
	"jubeat:Single": "ADV" | "BSC" | "EXT" | "HARD ADV" | "HARD BSC" | "HARD EXT";
	"museca:Single": "Green" | "Red" | "Yellow";
	"bms:7K": "CHART";
	"bms:14K": "CHART";
	"chunithm:Single": "ADVANCED" | "BASIC" | "EXPERT" | "MASTER";
	"gitadora:Gita":
		| "ADVANCED"
		| "BASIC"
		| "BASS ADVANCED"
		| "BASS BASIC"
		| "BASS EXTREME"
		| "BASS MASTER"
		| "EXTREME"
		| "MASTER";
	"gitadora:Dora": "ADVANCED" | "BASIC" | "EXTREME" | "MASTER";
	"wacca:Single": "EXPERT" | "HARD" | "INFERNO" | "NORMAL";
	"pms:Controller": "CHART";
	"pms:Keyboard": "CHART";
	"itg:Stamina": string;
}

/**
 * An alias for number, that makes part of the code self-documenting.
 * Note that if it were possible to enforce integer-y ness, then I would absolutely do so here
 * but i can not.
 */
export type integer = number;

export type Ratings = Record<Game, Record<Playtype, number>>;

export interface BaseGoalDocument extends MongoDBDocument {
	game: Game;
	playtype: Playtype;
	timeAdded: integer;
	name: string;
	goalID: string;
	criteria: GoalCountCriteria | GoalSingleCriteria;
}

interface GoalCriteria {
	key: "scoreData.gradeIndex" | "scoreData.lampIndex" | "scoreData.percent" | "scoreData.score";
	value: number;
}

export interface GoalSingleCriteria extends GoalCriteria {
	mode: "single";
}

/**
 * Criteria for a score to match this criteria - this is a "count" mode, which means that
 * atleast N scores have to match this criteria. This is for things like folders.
 */
export interface GoalCountCriteria extends GoalCriteria {
	mode: "absolute" | "proportion";
	countNum: number;
}

/**
 * Goal Document - Single. A goal document that is only for one specific chart.
 */
export interface GoalDocumentSingle extends BaseGoalDocument {
	charts: {
		type: "single";
		data: string;
	};
}

/**
 * Goal Document - Multi. A goal document whos set of charts is the array of
 * chartIDs inside "charts".
 */
export interface GoalDocumentMulti extends BaseGoalDocument {
	charts: {
		type: "multi";
		data: Array<string>;
	};
}

/**
 * Goal Document - Folder. A goal document whos set of charts is derived from
 * the folderID inside "charts".
 */
export interface GoalDocumentFolder extends BaseGoalDocument {
	charts: {
		type: "folder";
		data: string;
	};
}

/**
 * Goal Document - Any. A goal document whos set of charts is not bound.
 */
export interface GoalDocumentAny extends BaseGoalDocument {
	charts: {
		type: "any";
	};
}

export type GoalDocument =
	| GoalDocumentAny
	| GoalDocumentFolder
	| GoalDocumentMulti
	| GoalDocumentSingle;

interface BaseInviteCodeDocument extends MongoDBDocument {
	createdBy: integer;
	code: string;
	createdAt: number;
}

export type InviteCodeDocument = BaseInviteCodeDocument &
	(
		| { consumed: false; consumedBy: null; consumedAt: null }
		| { consumed: true; consumedBy: integer; consumedAt: number }
	);

export interface SessionInfoReturn {
	sessionID: string;
	type: "Appended" | "Created";
}

interface SessionScorePBInfo {
	scoreID: string;
	isNewScore: false;
	scoreDelta: number;
	gradeDelta: integer;
	lampDelta: integer;
	percentDelta: number;
}

interface SessionScoreNewInfo {
	scoreID: string;
	isNewScore: true;
}

export type SessionScoreInfo = SessionScoreNewInfo | SessionScorePBInfo;

export interface SessionCalculatedDataLookup {
	"iidx:SP": "BPI" | "ktLampRating";
	"iidx:DP": "BPI" | "ktLampRating";
	"popn:9B": "classPoints";
	"sdvx:Single": "ProfileVF6" | "VF6";
	"usc:Keyboard": "ProfileVF6" | "VF6";
	"usc:Controller": "ProfileVF6" | "VF6";
	"ddr:SP": "ktRating" | "MFCP";
	"ddr:DP": "ktRating" | "MFCP";
	"maimai:Single": "ktRating";
	"jubeat:Single": "jubility";
	"museca:Single": "ktRating";
	"bms:7K": "sieglinde";
	"bms:14K": "sieglinde";
	"chunithm:Single": "naiveRating";
	"gitadora:Gita": "skill";
	"gitadora:Dora": "skill";
	"wacca:Single": "rate";
	"pms:Controller": "sieglinde";
	"pms:Keyboard": "sieglinde";
	"itg:Stamina": "average32Speed" | "blockRating";
}

export interface SessionDocument<I extends IDStrings = IDStrings> extends MongoDBDocument {
	userID: integer;
	sessionID: string;
	scoreInfo: Array<SessionScoreInfo>;
	name: string;
	desc: string | null;
	game: Game;
	playtype: Playtype;

	// This field is allowed to be null for compatibility with kamaitachi1 sessions, where import types didn't exist.
	importType: ImportTypes | null;
	timeInserted: integer;
	timeEnded: integer;
	timeStarted: integer;
	calculatedData: Partial<Record<SessionCalculatedDataLookup[I], number | null>>;
	highlight: boolean;
	views: integer;
}

export interface SessionViewDocument extends MongoDBDocument {
	sessionID: string;
	ip: string;
	timestamp: number;
}

interface ImportErrContent {
	type: string;
	message: string;
}

export interface ClassDelta {
	game: Game;
	set: AllClassSets;
	playtype: Playtype;
	old: integer | null;
	new: integer;
}

export interface ImportDocument extends MongoDBDocument {
	userID: integer;
	timeStarted: number;
	timeFinished: number;

	// Contains an array of IDStrings, which dictates what (game:playtype)s were involved in this import.
	idStrings: Array<IDStrings>;
	importID: string;
	scoreIDs: Array<string>;
	game: Game;
	playtypes: Array<Playtypes[Game]>;
	errors: Array<ImportErrContent>;

	// For performance reasons, imports only show what sessions they created, rather than what sessions they didn't.
	// This is just an array of sessionIDs, to keep things normalised. May be empty.
	createdSessions: Array<SessionInfoReturn>;
	importType: ImportTypes;
	classDeltas: Array<ClassDelta>;
	goalInfo: Array<GoalImportInfo>;
	milestoneInfo: Array<MilestoneImportInfo>;

	/**
	 * Whether the user deliberately imported this through an action (i.e. uploaded a file personally) [true]
	 * or was imported on their behalf through a service (i.e. fervidex)
	 */
	userIntent: boolean;
}

export interface ImportTimingsDocument {
	importID: string;
	timestamp: number;
	total: number;

	/**
	 * Relative times - these are the times for each section
	 * divided by how much data they had to process.
	 */
	rel: Omit<ImportTimingSections, "goal" | "milestone" | "parse" | "ugs">;

	/**
	 * Absolute times - these are the times for each section.
	 */
	abs: ImportTimingSections;
}

interface ImportTimingSections {
	parse: number;
	import: number;
	importParse: number;
	session: number;
	pb: number;
	ugs: number;
	goal: number;
	milestone: number;
}

export type GoalImportStat = Pick<
	GoalSubscriptionDocument,
	"achieved" | "outOf" | "outOfHuman" | "progress" | "progressHuman"
>;

export interface GoalImportInfo {
	goalID: string;
	old: GoalImportStat;
	new: GoalImportStat;
}

export type MilestoneImportStat = Pick<MilestoneSubscriptionDocument, "achieved" | "progress">;

export interface MilestoneImportInfo {
	milestoneID: string;
	old: MilestoneImportStat;
	new: MilestoneImportStat;
}

export type GoalSubscriptionDocument = MongoDBDocument & {
	goalID: string;
	userID: integer;
	game: Game;
	playtype: Playtype;
	timeSet: integer;
	lastInteraction: integer | null;
	progress: number | null;
	progressHuman: string;
	outOf: number;
	outOfHuman: string;
	wasInstantlyAchieved: boolean;
} & (
		| {
				achieved: false;
				timeAchieved: null;
		  }
		| {
				achieved: true;
				timeAchieved: integer;
		  }
	);

interface MilestoneGoalReference {
	goalID: string;
	note?: string;
}

interface MilestoneSection {
	title: string;
	desc: string;
	goals: Array<MilestoneGoalReference>;
}

export interface MilestoneDocument extends MongoDBDocument {
	game: Game;
	playtype: Playtype;

	/**
	 * all: All goals must be achieved in order for the milestone to be complete
	 * abs: Goals achieved must be greater than or equal to criteria.value.
	 * proportion: Goals achieved must be greater than or equal to criteria.value * total_goals.
	 */
	criteria: MilestoneAbsPropCriteria | MilestoneAllCriteria;
	name: string;
	desc: string;
	milestoneData: Array<MilestoneSection>;
	milestoneID: string;
}

interface MilestoneAllCriteria {
	type: "all";
}

interface MilestoneAbsPropCriteria {
	type: "total";
	value: number;
}

export interface MilestoneSetDocument extends MongoDBDocument {
	setID: string;
	name: string;
	desc: string;
	game: Game;
	playtype: Playtype;
	milestones: Array<string>;
}

export type UserBadges = "alpha" | "beta" | "contributor" | "dev-team" | "significant-contributor";

export enum UserAuthLevels {
	BANNED = 0,
	USER = 1,
	MOD = 2,
	ADMIN = 3,
}

export interface PublicUserDocument extends MongoDBDocument {
	username: string;
	usernameLowercase: string;
	id: integer;
	socialMedia: {
		discord?: string | null;
		twitter?: string | null;
		github?: string | null;
		steam?: string | null;
		youtube?: string | null;
		twitch?: string | null;
	};
	joinDate: integer;
	lastSeen: integer;
	about: string;
	status: string | null;
	customPfpLocation: string | null;
	customBannerLocation: string | null;
	clan: string | null; // todo
	badges: Array<UserBadges>;
	authLevel: UserAuthLevels;
}

export interface UGSRatingsLookup {
	"iidx:SP": "BPI" | "ktLampRating";
	"iidx:DP": "BPI" | "ktLampRating";
	"popn:9B": "naiveClassPoints";
	"sdvx:Single": "VF6";
	"usc:Keyboard": "VF6";
	"usc:Controller": "VF6";
	"ddr:SP": "ktRating" | "MFCP";
	"ddr:DP": "ktRating" | "MFCP";
	"maimai:Single": "ktRating";
	"jubeat:Single": "jubility" | "naiveJubility";
	"museca:Single": "ktRating";
	"bms:7K": "sieglinde";
	"bms:14K": "sieglinde";
	"chunithm:Single": "naiveRating";
	"gitadora:Gita": "naiveSkill" | "skill";
	"gitadora:Dora": "naiveSkill" | "skill";
	"wacca:Single": "naiveRate" | "rate";
	"pms:Controller": "sieglinde";
	"pms:Keyboard": "sieglinde";
	"itg:Stamina": "highest32" | "highest256" | "highestBlock";
}

export interface UserGameStats<I extends IDStrings = IDStrings> extends MongoDBDocument {
	userID: integer;
	game: IDStringToGame[I];
	playtype: IDStringToPlaytype[I];
	ratings: Partial<Record<UGSRatingsLookup[I], number | null>>;
	classes: Partial<GameClasses<I>>;
}

type SupportedIIDXVersions =
	| "3-cs"
	| "4-cs"
	| "5-cs"
	| "6-cs"
	| "7-cs"
	| "8-cs"
	| "9-cs"
	| "10-cs"
	| "11-cs"
	| "12-cs"
	| "13-cs"
	| "14-cs"
	| "15-cs"
	| "16-cs"
	| "20"
	| "21"
	| "22"
	| "23"
	| "24"
	| "25"
	| "26-omni"
	| "26"
	| "27-2dxtra"
	| "27-omni"
	| "27"
	| "28-2dxtra"
	| "28-omni"
	| "28-omni"
	| "28"
	| "29"
	| "bmus"
	| "inf";

export interface GPTSupportedVersions {
	"iidx:SP": SupportedIIDXVersions;
	"iidx:DP": SupportedIIDXVersions;
	"popn:9B": "kaimei" | "peace";
	"sdvx:Single": "booth" | "exceed" | "gw" | "heaven" | "inf" | "konaste" | "vivid";
	"usc:Controller": never;
	"usc:Keyboard": never;
	"ddr:SP": "a20";
	"ddr:DP": "a20";
	"maimai:Single": "finale";
	"jubeat:Single": "clan" | "festo" | "qubell";
	"museca:Single": "1.5-b" | "1.5";
	"bms:7K": never;
	"bms:14K": never;
	"chunithm:Single": "paradiselost";
	"gitadora:Gita": "nextage";
	"gitadora:Dora": "nextage";
	"wacca:Single": "reverse";
	"pms:Controller": never;
	"pms:Keyboard": never;
	"itg:Stamina": never;
}

interface CDDataIIDXSP {
	notecount: integer;
	inGameID: Array<integer> | integer;
	arcChartID: string | null;
	hashSHA256: string | null;
	"2dxtraSet": string | null;
	kaidenAverage: integer | null;
	worldRecord: integer | null;
	bpiCoefficient: number | null;
}

interface CDDataDDRSP {
	songHash: string;
	inGameID: string;
}

interface CDDataPMS {
	notecount: integer;
	hashMD5: string;
	hashSHA256: string;
	tableFolders: Array<{ table: string; level: string }>;
}

type CDDataBMS = CDDataPMS & {
	aiLevel: string | null;
};

interface CDDataUSC {
	hashSHA1: Array<string> | string;
	isOfficial: boolean;
	effector: string;
	tableFolders: Array<{ table: string; level: string }>;
}

interface ChartDocumentData {
	"iidx:SP": CDDataIIDXSP;
	"iidx:DP": CDDataIIDXSP;
	"popn:9B": { hashSHA256: Array<string> | string | null; inGameID: integer };
	"sdvx:Single": { inGameID: integer; arcChartID: string | null };
	"usc:Keyboard": CDDataUSC;
	"usc:Controller": CDDataUSC;
	"ddr:SP": CDDataDDRSP;
	"ddr:DP": CDDataDDRSP;
	"maimai:Single": {
		maxPercent: number;
		inGameID: number;
		inGameStrID: string;
	};
	"jubeat:Single": { inGameID: integer; isHardMode: boolean };
	"museca:Single": { inGameID: integer };
	"bms:7K": CDDataBMS;
	"bms:14K": CDDataBMS;
	"chunithm:Single": { inGameID: integer };
	"gitadora:Gita": { inGameID: integer };
	"gitadora:Dora": { inGameID: integer };
	"wacca:Single": { isHot: boolean };
	"pms:Controller": CDDataPMS;
	"pms:Keyboard": CDDataPMS;
	"itg:Stamina": {
		chartHash: string;
		difficultyTag: "Beginner" | "Challenge" | "Easy" | "Hard" | "Medium";
		breakdown: {
			detailed: string;
			partiallySimplified: string;
			simplified: string;
			total: string;
			npsPerMeasure: Array<number>;
			notesPerMeasure: Array<number>;
		};
		tech: {
			crossovers: integer;
			jacks: integer;
			brackets: integer;
			footswitches: integer;
			sideswitches: integer;
		};
		length: number;
		charter: string;
		displayBPM: number;
	};
}

export interface GPTTierlists {
	"iidx:SP": "kt-EXHC" | "kt-HC" | "kt-NC";
	"iidx:DP": "dp-tier";
	"bms:7K": "sgl-EC" | "sgl-HC";
	"bms:14K": "sgl-EC" | "sgl-HC";
	"popn:9B": never;
	"sdvx:Single": "clear";
	"usc:Keyboard": never;
	"usc:Controller": never;
	"ddr:SP": never;
	"ddr:DP": never;
	"maimai:Single": never;
	"jubeat:Single": never;
	"museca:Single": never;
	"chunithm:Single": never;
	"gitadora:Gita": never;
	"gitadora:Dora": never;
	"wacca:Single": never;
	"pms:Controller": "sgl-EC" | "sgl-HC";
	"pms:Keyboard": "sgl-EC" | "sgl-HC";
	"itg:Stamina": never;
}

export interface ChartTierlistInfo {
	text: string;
	value: number;
	individualDifference?: boolean;
}

export interface ChartDocument<I extends IDStrings = IDStrings> extends MongoDBDocument {
	chartID: string;
	rgcID: string | null; // ID to perform backbeat lookup in future.
	songID: integer;
	level: string;
	levelNum: number;
	isPrimary: boolean;
	difficulty: Difficulties[I];
	playtype: IDStringToPlaytype[I];
	data: ChartDocumentData[I];
	tierlistInfo: Partial<Record<GPTTierlists[I], ChartTierlistInfo>>;
	versions: Array<GPTSupportedVersions[I]>;
}

interface SongDocumentData {
	iidx: { genre: string; displayVersion: string | null };
	museca: { titleJP: string; artistJP: string; displayVersion: string };
	maimai: { titleJP: string; artistJP: string; displayVersion: string };
	jubeat: { displayVersion: string };
	popn: {
		displayVersion: string | null;
		genre: string;
		genreEN: string | null;
	};
	sdvx: { displayVersion: string };
	usc: Record<string, never>;
	ddr: { displayVersion: string };
	bms: {
		genre: string | null;
		subtitle: string | null;
		subartist: string | null;
		tableString: string | null;
	};
	chunithm: { genre: string; displayVersion: string };
	gitadora: { isHot: boolean; displayVersion: string };
	wacca: {
		titleJP: string;
		artistJP: string;
		genre: string;
		displayVersion: string | null;
	};
	pms: {
		genre: string | null;
		subtitle: string | null;
		subartist: string | null;
		tableString: string | null;
	};
	itg: {
		subtitle: string;
		banner: string | null;
	};
}

export interface SongDocument<G extends Game = Game> extends MongoDBDocument {
	id: integer;
	title: string;
	artist: string;
	searchTerms: Array<string>;
	altTitles: Array<string>;
	data: SongDocumentData[G];
}

export interface TableDocument extends MongoDBDocument {
	tableID: string;
	game: Game;
	playtype: Playtype;
	title: string;
	description: string;
	folders: Array<string>;
	inactive: boolean;
	default: boolean;
}

export interface BaseFolderDocument extends MongoDBDocument {
	title: string;
	game: Game;
	playtype: Playtype;
	folderID: string;

	/**
	 * This folder has been superceded by another folder,
	 * such as one on a more modern version of the game.
	 */
	inactive: boolean;
	searchTerms: Array<string>;
}

export interface FolderSongsDocument extends BaseFolderDocument {
	type: "songs";
	data: FilterQuery<SongDocument>;
}

export interface FolderChartsDocument extends BaseFolderDocument {
	type: "charts";
	data: FilterQuery<ChartDocument>;
}

export interface FolderStaticDocument extends BaseFolderDocument {
	type: "static";
	data: Array<string>;
}

export type FolderDocument = FolderChartsDocument | FolderSongsDocument | FolderStaticDocument;

export interface FolderChartLookup extends MongoDBDocument {
	chartID: string;
	folderID: string;
}

export type MilestoneSubscriptionDocument = MongoDBDocument & {
	milestoneID: string;
	userID: integer;
	game: Game;
	playtype: Playtype;
	timeSet: integer;
	progress: integer;
	lastInteraction: integer | null;
	wasInstantlyAchieved: boolean;
} & (
		| {
				achieved: false;
				timeAchieved: null;
		  }
		| {
				achieved: true;
				timeAchieved: integer;
		  }
	);

type RanOptions = "MIRROR" | "NONRAN" | "R-RANDOM" | "RANDOM" | "S-RANDOM";

interface IIDXSPScoreMeta {
	random: RanOptions | null;
	assist: "AUTO SCRATCH" | "FULL ASSIST" | "LEGACY NOTE" | "NO ASSIST" | null;
	range: "HIDDEN+" | "LIFT SUD+" | "LIFT" | "NONE" | "SUD+ HID+" | "SUDDEN+" | null;
	gauge: "ASSISTED EASY" | "EASY" | "EX-HARD" | "HARD" | "NORMAL" | null;
}

interface BMS7KScoreMeta {
	random: RanOptions | null;
	inputDevice: "BM_CONTROLLER" | "KEYBOARD" | null;
	client: "LR2" | "lr2oraja" | null;
	gauge: "EASY" | "EX-HARD" | "HARD" | "NORMAL" | null;
}

interface PMSScoreMeta {
	random: RanOptions | null;
	client: "beatoraja" | null;
	gauge: "EASY" | "EX-HARD" | "HARD" | "NORMAL" | null;
}

interface USCScoreMeta {
	noteMod: "MIR-RAN" | "MIRROR" | "NORMAL" | "RANDOM" | null;
	gaugeMod: "HARD" | "NORMAL" | "PERMISSIVE" | null;
}

interface ScoreMetaLookup {
	"iidx:SP": IIDXSPScoreMeta;
	"iidx:DP": IIDXSPScoreMeta & {
		random: { left: RanOptions; right: RanOptions } | null;
	};
	"popn:9B": {
		hiSpeed: number | null;
		hidden: integer | null;
		sudden: integer | null;
		random: "MIRROR" | "NONRAN" | "RANDOM" | "S-RANDOM" | null;
		gauge: "DANGER" | "EASY" | "HARD" | "NORMAL" | null;
	};
	"sdvx:Single": { inSkillAnalyser: boolean | null };
	"usc:Controller": USCScoreMeta;
	"usc:Keyboard": USCScoreMeta;
	"ddr:SP": Record<string, never>;
	"ddr:DP": Record<string, never>;
	"maimai:Single": Record<string, never>;
	"jubeat:Single": Record<string, never>;
	"museca:Single": Record<string, never>;
	"bms:7K": BMS7KScoreMeta;
	"bms:14K": BMS7KScoreMeta & {
		random: { left: RanOptions; right: RanOptions } | null;
	};
	"chunithm:Single": Record<string, never>;
	"gitadora:Gita": Record<string, never>;
	"gitadora:Dora": Record<string, never>;
	"wacca:Single": { mirror: boolean | null };
	"pms:Controller": PMSScoreMeta;
	"pms:Keyboard": PMSScoreMeta;
	"itg:Stamina": Record<string, never>;
}

interface BASE_VALID_HIT_META {
	fast: integer | null;
	slow: integer | null;
	maxCombo: integer | null;
}

type IIDXHitMeta = BASE_VALID_HIT_META & {
	bp: integer | null;
	gauge: number | null;
	gaugeHistory: Array<number | null> | null;
	scoreHistory: Array<number> | null;
	comboBreak: integer | null;
	gsm: {
		EASY: Array<number | null>;
		NORMAL: Array<number | null>;
		HARD: Array<number | null>;
		EX_HARD: Array<number | null>;
	} | null;
};

type BMSJudgePermutations = `${"e" | "l"}${"bd" | "gd" | "gr" | "pg" | "pr"}`;

type BMSHitMeta = BASE_VALID_HIT_META & {
	[K in BMSJudgePermutations]: integer;
} & {
	bp: integer | null;
	gauge: number | null;
	gaugeHistory: Array<number> | null;
};

export type USCHitMeta = BASE_VALID_HIT_META & {
	gauge: number | null;
};

export interface HitMetaLookup {
	"iidx:SP": IIDXHitMeta;
	"iidx:DP": IIDXHitMeta;
	"popn:9B": BASE_VALID_HIT_META & {
		gauge: number | null;
		specificClearType:
			| "clearCircle"
			| "clearDiamond"
			| "clearStar"
			| "easyClear"
			| "failedCircle"
			| "failedDiamond"
			| "failedStar"
			| "fullComboCircle"
			| "fullComboDiamond"
			| "fullComboStar"
			| "perfect"
			| null;
	};
	"sdvx:Single": BASE_VALID_HIT_META & {
		gauge: number | null;
		exScore: number | null;
	};
	"usc:Controller": USCHitMeta;
	"usc:Keyboard": USCHitMeta;
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
	"wacca:Single": BASE_VALID_HIT_META;
	"pms:Controller": BMSHitMeta;
	"pms:Keyboard": BMSHitMeta;
	"itg:Stamina": BASE_VALID_HIT_META & {
		gaugeHistory: Array<integer> | null;
		diedAt: integer | null;
	};
}

type IIDXJudges = "bad" | "good" | "great" | "pgreat" | "poor";
type DDRJudges = "boo" | "good" | "great" | "marvelous" | "miss" | "ng" | "ok" | "perfect";
type GitadoraJudges = "good" | "great" | "miss" | "ok" | "perfect";

// judges might need to be changed here...
// @bug Known that sdvx calls misses errors. I, however, don't care.
type SDVXJudges = "critical" | "miss" | "near";

export interface JudgementLookup {
	"iidx:SP": IIDXJudges;
	"iidx:DP": IIDXJudges;
	"popn:9B": "bad" | "cool" | "good" | "great";
	"sdvx:Single": SDVXJudges;
	"usc:Controller": SDVXJudges;
	"usc:Keyboard": SDVXJudges;
	"ddr:SP": DDRJudges;
	"ddr:DP": DDRJudges;
	"maimai:Single": "good" | "great" | "miss" | "perfect";
	"jubeat:Single": "good" | "great" | "miss" | "perfect" | "poor";
	"museca:Single": "critical" | "miss" | "near";
	"bms:7K": IIDXJudges;
	"bms:14K": IIDXJudges;
	"chunithm:Single": "attack" | "jcrit" | "justice" | "miss";
	"gitadora:Gita": GitadoraJudges;
	"gitadora:Dora": GitadoraJudges;
	"wacca:Single": "good" | "great" | "marvelous" | "miss";
	"pms:Controller": "bad" | "cool" | "good" | "great" | "poor";
	"pms:Keyboard": "bad" | "cool" | "good" | "great" | "poor";
	"itg:Stamina": "decent" | "excellent" | "fantastic" | "great" | "miss" | "wayoff";
}

export interface ScoreCalculatedDataLookup {
	"iidx:SP": "BPI" | "ktLampRating";
	"iidx:DP": "BPI" | "ktLampRating";
	"popn:9B": "classPoints";
	"sdvx:Single": "VF6";
	"usc:Keyboard": "VF6";
	"usc:Controller": "VF6";
	"ddr:SP": "ktRating" | "MFCP";
	"ddr:DP": "ktRating" | "MFCP";
	"maimai:Single": "ktRating";
	"jubeat:Single": "jubility";
	"museca:Single": "ktRating";
	"bms:7K": "sieglinde";
	"bms:14K": "sieglinde";
	"chunithm:Single": "rating";
	"gitadora:Gita": "skill";
	"gitadora:Dora": "skill";
	"wacca:Single": "rate";
	"pms:Controller": "sieglinde";
	"pms:Keyboard": "sieglinde";
	"itg:Stamina": "blockRating" | "highest32" | "highest256";
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
		judgements: Partial<Record<JudgementLookup[I], integer | null>>;
		hitMeta: Partial<HitMetaLookup[I]>;
	};
	scoreMeta: Partial<ScoreMetaLookup[I]>;
	calculatedData: Partial<Record<ScoreCalculatedDataLookup[I], number | null>>;
	timeAchieved: integer | null;
	songID: integer;
	chartID: string;
	isPrimary: boolean;
	highlight: boolean;
	comment: string | null;
	timeAdded: integer;
	scoreID: string;
	importType: ImportTypes | null;
}

export interface PBScoreComposedReference {
	name: string;
	scoreID: string;
}

export interface PBScoreDocument<I extends IDStrings = IDStrings> extends MongoDBDocument {
	composedFrom: {
		scorePB: string;
		lampPB: string;
		other?: Array<PBScoreComposedReference>;
	};
	rankingData: {
		rank: integer;
		outOf: integer;
	};
	userID: integer;
	chartID: string;
	game: Game;
	playtype: Playtype;
	songID: integer;
	highlight: boolean;
	isPrimary: boolean;
	timeAchieved: number | null;
	scoreData: {
		score: number;
		lamp: Lamps[I];
		percent: number;
		grade: Grades[I];
		lampIndex: integer;
		gradeIndex: integer;
		esd: number | null;
		judgements: Partial<Record<JudgementLookup[I], integer | null>>;
		hitMeta: Partial<HitMetaLookup[I]>;
	};
	calculatedData: Partial<Record<ScoreCalculatedDataLookup[I], number | null>>;
}

export type FileUploadImportTypes =
	| "file/batch-manual"
	| "file/eamusement-iidx-csv"
	| "file/eamusement-sdvx-csv"
	| "file/mer-iidx"
	| "file/pli-iidx-csv"
	| "file/solid-state-squad";

export type APIImportTypes =
	| "api/arc-iidx"
	| "api/arc-sdvx"
	| "api/eag-iidx"
	| "api/eag-sdvx"
	| "api/flo-iidx"
	| "api/flo-sdvx"
	| "api/min-sdvx";

export type IRImportTypes =
	| "ir/barbatos"
	| "ir/beatoraja"
	| "ir/direct-manual"
	| "ir/fervidex-static"
	| "ir/fervidex"
	| "ir/kshook-sv6c"
	| "ir/lr2hook"
	| "ir/usc";

export type ImportTypes = APIImportTypes | FileUploadImportTypes | IRImportTypes;

export interface ImportProcessInfoKTDataNotFound {
	success: false;
	type: "KTDataNotFound";
	message: string;
	content: {
		data: unknown;
		context: unknown; // @TODO Type these properly.
		orphanID: string;
	};
}

export interface ImportProcessInfoOrphanExists {
	success: false;
	type: "OrphanExists";
	message: string;
	content: {
		orphanID: string;
	};
}

export interface ImportProcessInfoInvalidDatapoint {
	success: false;
	type: "InvalidDatapoint";
	message: string;
	content: Record<string, never>;
}

export interface ImportProcessInfoScoreImported<I extends IDStrings = IDStrings> {
	success: true;
	type: "ScoreImported";
	message: string;
	content: {
		score: ScoreDocument<I>;
	};
}

export interface ImportProcessInfoInternalError {
	success: false;
	type: "InternalError";
	message: string;
	content: Record<string, never>;
}

export type ImportProcessingInfo<I extends IDStrings = IDStrings> =
	| ImportProcessInfoInternalError
	| ImportProcessInfoInvalidDatapoint
	| ImportProcessInfoKTDataNotFound
	| ImportProcessInfoOrphanExists
	| ImportProcessInfoScoreImported<I>;

export interface ImportStatistics {
	scoreCount: integer;
	msPerScore: number;
	sessionCount: integer;
	msPerSession: number;
	ratingTime: number;
	importID: string;
}

export interface KaiAuthDocument {
	userID: integer;
	token: string;
	refreshToken: string;
	service: "EAG" | "FLO" | "MIN";
}

/**
 * Used to resolve beatoraja IR courses.
 */
export interface BMSCourseDocument {
	title: string;
	md5sums: string;
	set: "genocideDan" | "lnDan" | "scratchDan" | "stslDan";
	playtype: "7K" | "14K";
	value: integer;
}

/**
 * All the permissions a token may have.
 */
export type APIPermissions =
	| "customise_profile"
	| "customise_score"
	| "customise_session"
	| "delete_score"
	| "manage_challenges"
	| "manage_rivals"
	| "manage_targets"
	| "submit_score";

/**
 * Information about the API Token used to make this request.
 */
export interface APITokenDocument extends MongoDBDocument {
	userID: integer | null;
	token: string | null;
	identifier: string;
	permissions: Partial<Record<APIPermissions, boolean>>;

	// API Tokens may be created as a result of a Tachi Client flow. This prop optionally
	// stores that.
	fromAPIClient: string | null;
}

export interface ImportLockDocument extends MongoDBDocument {
	userID: integer;
}

export type ShowcaseStatDetails = ShowcaseStatChart | ShowcaseStatFolder;

export interface ShowcaseStatFolder {
	mode: "folder";
	folderID: string;
	property: "grade" | "lamp" | "percent" | "score";
	gte: number;
}

export interface ShowcaseStatChart {
	mode: "chart";
	chartID: string;
	property: "grade" | "lamp" | "percent" | "playcount" | "score";
}

export interface UGPTSpecificPreferences {
	"iidx:SP": { display2DXTra: boolean; bpiTarget: number };
	"iidx:DP": { display2DXTra: boolean; bpiTarget: number };
	"popn:9B": Record<string, never>;
	"sdvx:Single": { vf6Target: number };
	"usc:Controller": { vf6Target: number };
	"usc:Keyboard": { vf6Target: number };
	"ddr:SP": Record<string, never>;
	"ddr:DP": Record<string, never>;
	"maimai:Single": Record<string, never>;
	"jubeat:Single": { jubilityTarget: number };
	"museca:Single": Record<string, never>;
	"bms:7K": Record<string, never>;
	"bms:14K": Record<string, never>;
	"chunithm:Single": Record<string, never>;
	"gitadora:Gita": Record<string, never>;
	"gitadora:Dora": Record<string, never>;
	"wacca:Single": Record<string, never>;
	"pms:Controller": Record<string, never>;
	"pms:Keyboard": Record<string, never>;
	"itg:Stamina": Record<string, never>;
}

export interface UGPTSettings<I extends IDStrings = IDStrings> extends MongoDBDocument {
	userID: integer;
	game: IDStringToGame[I];
	playtype: IDStringToPlaytype[I];
	preferences: {
		preferredScoreAlg: ScoreCalculatedDataLookup[I] | null;
		preferredSessionAlg: SessionCalculatedDataLookup[I] | null;
		preferredProfileAlg: UGSRatingsLookup[I] | null;
		stats: Array<ShowcaseStatDetails>;
		scoreBucket: "grade" | "lamp" | null;
		defaultTable: string | null;
		gameSpecific: UGPTSpecificPreferences[I];
	};
	rivals: Array<integer>;
}

export interface UserGameStatsSnapshot<I extends IDStrings = IDStrings>
	extends MongoDBDocument,
		UserGameStats<I> {
	rankings: Record<UGSRatingsLookup[I], { ranking: integer | null; outOf: integer }>;
	playcount: integer;
	timestamp: integer;
}

export interface ARCSavedProfileDocument extends MongoDBDocument {
	userID: integer;
	accountID: string;
	forImportType: "api/arc-iidx" | "api/arc-sdvx";
}

export type BatchManualScore<I extends IDStrings = IDStrings> = {
	score: number;
	lamp: Lamps[I];
	percent?: number;
	identifier: string;
	comment?: string | null;
	judgements?: Record<JudgementLookup[I], integer>;
	timeAchieved?: number | null;
	hitMeta?: Partial<HitMetaLookup[I]>;
	scoreMeta?: Partial<ScoreMetaLookup[I]>;
} & (
	| {
			matchType: "bmsChartHash" | "itgChartHash" | "popnChartHash" | "uscChartHash";
			difficulty?: undefined; // hack to stop ts from screaming when this is accessed sometimes
	  }
	| {
			matchType: "ddrSongHash" | "inGameID" | "sdvxInGameID" | "songTitle" | "tachiSongID";
			difficulty: Difficulties[I];
	  }
);

export interface BatchManual<I extends IDStrings = IDStrings> {
	meta: {
		game: IDStringToGame[I];
		playtype: IDStringToPlaytype[I];
		service: string;
		version?: GPTSupportedVersions[I];
	};
	scores: Array<BatchManualScore<I>>;
	classes?: Record<GameClassSets[I], string> | null;
}

export interface UserSettings {
	userID: integer;
	preferences: {
		invisible: boolean;
		developerMode: boolean;
		advancedMode: boolean;
		contentiousContent: boolean;
		deletableScores: boolean;
	};
}

export interface TachiAPIClientDocument {
	clientID: string;
	clientSecret: string;
	name: string;
	author: integer;
	requestedPermissions: Array<APIPermissions>;
	redirectUri: string | null;
	webhookUri: string | null;
	apiKeyTemplate: string | null;
	apiKeyFilename: string | null;
}

export interface FervidexSettingsDocument {
	userID: integer;
	cards: Array<string> | null;
	forceStaticImport: boolean;
}

export interface OrphanChart<I extends IDStrings = IDStrings> {
	idString: I;
	chartDoc: ChartDocument<I>;
	songDoc: SongDocument<IDStringToGame[I]>;
	userIDs: Array<integer>;
}

export interface ClassAchievementDocument<I extends IDStrings = IDStrings> extends MongoDBDocument {
	game: IDStringToGame[I];
	playtype: IDStringToPlaytype[I];
	classSet: AllClassSets;
	classOldValue: integer | null;
	classValue: integer;
	timeAchieved: number;
	userID: integer;
}

export interface RecentlyViewedFolderDocument {
	userID: integer;
	game: Game;
	playtype: Playtypes[Game];
	folderID: string;
	lastViewed: number;
}

interface BaseNotification {
	title: string;
	notifID: string;

	// The user this notification was sent to.
	sentTo: integer;
	sentAt: integer;
	read: boolean;
}

export type NotificationBody =
	| {
			type: "CHALLENGE_BEAT";
			content: {
				userID: integer;
				challenge: ChallengeWallDocument;
			};
	  }
	| {
			type: "CHALLENGE_RECEIVED";
			content: {
				challenge: ChallengeWallDocument;
			};
	  }
	| {
			type: "MILESTONE_CHANGED"; // Emitted when a milestone the user is subscribed to changed.
			content: {
				milestoneID: string;
			};
	  }
	| {
			type: "RIVALED_BY"; // Emitted when the user is rivalled by someone.
			content: {
				userID: integer;
				game: Game;
				playtype: Playtype;
			};
	  };

export type NotificationDocument = BaseNotification & {
	body: NotificationBody;
};

export interface ChallengeSubscriptionDocument {
	chartID: string;
	authorID: integer;
	type: "lamp" | "score";

	game: Game;
	playtype: Playtype;

	userID: integer;
	achieved: boolean;
	achievedAt: number | null;
}

export interface ChallengeWallDocument {
	chartID: string;
	authorID: integer;
	type: "lamp" | "score";

	game: Game;
	playtype: Playtype;
}
