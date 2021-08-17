import { IObjectID } from "monk";
import { FilterQuery } from "mongodb";
import { AllClassSets, GameClasses, GameClassSets } from "./game-classes";

export interface CounterDocument {
	counterName: string;
	value: integer;
}

export type AnyPlaytype = Playtypes[Game];

/**
 * IDStrings are an internal (ish) identifier used to identify
 * Game + Playtype combos. These are used because TypeScript cannot accurately
 * apply two levels of indexing to types, which makes writing generic interfaces
 * like the ScoreDocument (Especially the ScoreDocument) *very* hard!
 */
export type IDStrings =
	| "iidx:SP"
	| "iidx:DP"
	// | "popn:9B"
	| "sdvx:Single"
	| "usc:Single"
	| "ddr:SP"
	| "ddr:DP"
	| "maimai:Single"
	| "museca:Single"
	// | "jubeat:Single"
	| "bms:7K"
	| "bms:14K"
	| "chunithm:Single"
	| "gitadora:Gita"
	| "gitadora:Dora";

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

export interface GameToIDStrings {
	iidx: "iidx:SP" | "iidx:DP";
	sdvx: "sdvx:Single";
	usc: "usc:Single";
	ddr: "ddr:SP" | "ddr:DP";
	maimai: "maimai:Single";
	jubeat: "jubeat:Single";
	museca: "museca:Single";
	bms: "bms:7K" | "bms:14K";
	chunithm: "chunithm:Single";
	gitadora: "gitadora:Gita" | "gitadora:Dora";
	popn: "popn:9B";
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

export type Databases =
	| "sessions"
	| "session-view-cache"
	| "folders"
	| "folder-chart-lookup"
	| "scores"
	| "personal-bests"
	| "imports"
	| "import-timings"
	| "tierlist-data"
	| "tierlists"
	| "goals"
	| "user-goals"
	| "user-milestones"
	| "milestones"
	| "game-stats"
	| "game-settings"
	| "users"
	| "kai-auth-tokens"
	| "bms-course-lookup"
	| "api-tokens"
	| "import-locks"
	| "tables"
	| "game-stats-snapshots"
	| "arc-saved-profiles";

export type ValidDatabases = Databases | `songs-${Game}` | `charts-${Game}`;

/**
 * Supported games by Kamaitachi.
 */
export type Game =
	| "iidx"
	| "museca"
	| "maimai"
	// | "jubeat"
	// | "popn"
	| "sdvx"
	| "ddr"
	| "bms"
	| "chunithm"
	| "gitadora"
	| "usc";

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
	// eslint-disable-next-line @typescript-eslint/ban-types
	body: T;
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

type IIDXGrades = "F" | "E" | "D" | "C" | "B" | "A" | "AA" | "AAA" | "MAX-" | "MAX";
type SDVXGrades = "D" | "C" | "B" | "A" | "A+" | "AA" | "AA+" | "AAA" | "AAA+" | "S";
type DDRGrades =
	| "D"
	| "D+"
	| "C-"
	| "C"
	| "C+"
	| "B-"
	| "B"
	| "B+"
	| "A-"
	| "A"
	| "A+"
	| "AA-"
	| "AA"
	| "AA+"
	| "AAA";

type GitadoraGrades = "C" | "B" | "A" | "S" | "SS" | "MAX";

export interface Grades {
	"iidx:SP": IIDXGrades;
	"iidx:DP": IIDXGrades;
	"popn:9B": "E" | "D" | "C" | "B" | "A" | "AA" | "AAA" | "S";
	"sdvx:Single": SDVXGrades;
	"usc:Single": SDVXGrades;
	"ddr:SP": DDRGrades;
	"ddr:DP": DDRGrades;
	"maimai:Single":
		| "F"
		| "E"
		| "D"
		| "C"
		| "B"
		| "A"
		| "AA"
		| "AAA"
		| "S"
		| "S+"
		| "SS"
		| "SS+"
		| "SSS"
		| "SSS+";
	"jubeat:Single": "E" | "D" | "C" | "B" | "A" | "S" | "SS" | "SSS" | "EXC";
	"museca:Single": "没" | "拙" | "凡" | "佳" | "良" | "優" | "秀" | "傑" | "傑G";
	"bms:7K": IIDXGrades;
	"bms:14K": IIDXGrades;
	"chunithm:Single": "D" | "C" | "B" | "BB" | "BBB" | "A" | "AA" | "AAA" | "S" | "SS" | "SSS";
	"gitadora:Gita": GitadoraGrades;
	"gitadora:Dora": GitadoraGrades;
}

type IIDXLamps =
	| "NO PLAY"
	| "FAILED"
	| "ASSIST CLEAR"
	| "EASY CLEAR"
	| "CLEAR"
	| "HARD CLEAR"
	| "EX HARD CLEAR"
	| "FULL COMBO";

type GitadoraLamps = "FAILED" | "CLEAR" | "FULL COMBO" | "EXCELLENT";

type SDVXLamps =
	| "FAILED"
	| "CLEAR"
	| "EXCESSIVE CLEAR"
	| "ULTIMATE CHAIN"
	| "PERFECT ULTIMATE CHAIN";

type DDRLamps =
	| "FAILED"
	| "CLEAR"
	| "LIFE4"
	| "FULL COMBO"
	| "GREAT FULL COMBO"
	| "PERFECT FULL COMBO"
	| "MARVELOUS FULL COMBO";

export interface Lamps {
	"iidx:SP": IIDXLamps;
	"iidx:DP": IIDXLamps;
	// THIS ONE IS WRONG!
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
	"bms:7K": "CHART";
	"bms:14K": "CHART";
	"chunithm:Single": "BASIC" | "ADVANCED" | "EXPERT" | "MASTER" | "WORLD'S END";
	"gitadora:Gita":
		| "BASIC"
		| "ADVANCED"
		| "EXTREME"
		| "MASTER"
		| "BASS BASIC"
		| "BASS ADVANCED"
		| "BASS EXTREME"
		| "BASS MASTER";
	"gitadora:Dora": "BASIC" | "ADVANCED" | "EXTREME" | "MASTER";
}

/**
 * An alias for number, that makes part of the code self-documenting.
 * Note that if it were possible to enforce integer-y ness, then I would absolutely do so here
 * but i can not.
 */
export type integer = number;

export type Ratings = Record<Game, Record<AnyPlaytype, number>>;

export interface BaseGoalDocument extends MongoDBDocument {
	game: Game;
	playtype: AnyPlaytype;
	timeAdded: integer;
	createdBy: integer;
	title: string;
	goalID: string;
	criteria: GoalSingleCriteria | GoalCountCriteria;
}

interface GoalCriteria {
	key: "scoreData.percent" | "scoreData.lampIndex" | "scoreData.gradeIndex" | "scoreData.score";
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
	mode: "abs" | "proportion";
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
		data: string[];
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
	| GoalDocumentFolder
	| GoalDocumentMulti
	| GoalDocumentSingle
	| GoalDocumentAny;

export interface RivalGroupDocument extends MongoDBDocument {
	name: string;
	desc: string;
	founderID: integer;
	members: integer[];
	mutualGroup: boolean;
	isDefault: boolean;
	game: Game;
	playtype: AnyPlaytype;
	settings: {
		scoreCompareMode: "relevant" | "folder";
		strictness: number;
		boundary: number;
		scoreCompareFolderID: string | null;
		cellShading: "grade" | "lamp";
	};
	rivalGroupID: string;
}

export type MRGChallengeModes = "goal" | "lamp" | "score";
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

export type MRGFolderTargetFieldNames =
	| "scoreData.percent"
	| "scoreData.gradeIndex"
	| "scoreData.lampIndex"
	| "calculatedData.gameSpecific.BPI";

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
	playtype: AnyPlaytype;
	folders: MRGFolderInformation[];
	settings: Record<string, never>;
	mrgID: string;
}

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
	type: "Created" | "Appended";
}

interface SessionScorePBInfo {
	scoreID: string;
	isNewScore: false;
	scoreDelta: number;
	gradeDelta: integer;
	lampDelta: integer;
	percentDelta: integer;
}

interface SessionScoreNewInfo {
	scoreID: string;
	isNewScore: true;
}

export type SessionScoreInfo = SessionScorePBInfo | SessionScoreNewInfo;

export interface SessionCalculatedDataLookup {
	"iidx:SP": "BPI" | "ktRating" | "ktLampRating";
	"iidx:DP": "BPI" | "ktRating" | "ktLampRating";
	"popn:9B": never; // @todo
	"sdvx:Single": "VF6" | "ProfileVF6";
	"usc:Single": "VF6" | "ProfileVF6";
	"ddr:SP": "MFCP" | "ktRating";
	"ddr:DP": "MFCP" | "ktRating";
	"maimai:Single": "ktRating";
	"jubeat:Single": "jubility";
	"museca:Single": "ktRating";
	"bms:7K": "sieglinde";
	"bms:14K": "sieglinde";
	"chunithm:Single": "naiveRating";
	"gitadora:Gita": "skill";
	"gitadora:Dora": "skill";
}

export interface SessionDocument<I extends IDStrings = IDStrings> extends MongoDBDocument {
	userID: integer;
	sessionID: string;
	scoreInfo: SessionScoreInfo[];
	name: string;
	desc: string | null;
	game: Game;
	playtype: AnyPlaytype;
	importType: ImportTypes;
	timeInserted: integer;
	timeEnded: integer;
	timeStarted: integer;
	calculatedData: Partial<Record<SessionCalculatedDataLookup[I], number | null>>;
	highlight: boolean;
	views: number;
}

export interface SessionViewDocument extends MongoDBDocument {
	sessionID: string;
	ip: string;
	timestamp: number;
}

interface ImportErrContent {
	type: string;
	message: string | null;
}

export interface ClassDelta {
	set: AllClassSets;
	playtype: AnyPlaytype;
	old: integer | null;
	new: integer;
}

export interface ImportDocument extends MongoDBDocument {
	userID: integer;
	timeStarted: number;
	timeFinished: number;
	// Contains an array of IDStrings, which dictates what (game:playtype)s were involved in this import.
	idStrings: IDStrings[];
	importID: string;
	scoreIDs: string[];
	errors: ImportErrContent[];
	// For performance reasons, imports only show what sessions they created, rather than what sessions they didn't.
	// This is just an array of sessionIDs, to keep things normalised. May be empty.
	createdSessions: SessionInfoReturn[];
	importType: ImportTypes;
	classDeltas: ClassDelta[];
	goalInfo: GoalImportInfo[];
	milestoneInfo: MilestoneImportInfo[];
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
	rel: Omit<ImportTimingSections, "parse" | "ugs" | "goal" | "milestone">;
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
	UserGoalDocument,
	"progress" | "progressHuman" | "outOf" | "outOfHuman" | "achieved"
>;

export interface GoalImportInfo {
	goalID: string;
	old: GoalImportStat;
	new: GoalImportStat;
}

export type MilestoneImportStat = Pick<UserMilestoneDocument, "progress" | "achieved">;

export interface MilestoneImportInfo {
	milestoneID: string;
	old: MilestoneImportStat;
	new: MilestoneImportStat;
}

export interface UserGoalDocument extends MongoDBDocument {
	goalID: string;
	userID: integer;
	game: Game;
	playtype: AnyPlaytype;
	achieved: boolean;
	timeSet: integer;
	timeAchieved: integer | null;
	lastInteraction: integer | null;
	progress: number | null;
	progressHuman: string;
	outOf: number;
	outOfHuman: string;
}

interface MilestoneGoalReference {
	goalID: string;
	note?: string;
}

interface MilestoneSection {
	title: string;
	desc: string;
	goals: MilestoneGoalReference[];
}

export interface MilestoneDocument extends MongoDBDocument {
	game: Game;
	playtype: AnyPlaytype;
	/**
	 * all: All goals must be achieved in order for the milestone to be complete
	 * abs: Goals achieved must be greater than or equal to criteria.value.
	 * proportion: Goals achieved must be greater than or equal to criteria.value * total_goals.
	 */
	criteria: MilestoneAllCriteria | MilestoneAbsPropCriteria;
	createdBy: integer;
	name: string;
	desc: string;
	milestoneData: MilestoneSection[];
	milestoneID: string;
	group: string | null;
	groupIndex: number | null;
}

interface MilestoneAllCriteria {
	type: "all";
}

interface MilestoneAbsPropCriteria {
	type: "abs" | "proportion";
	value: number;
}

export interface MilestoneGroupDocument extends MongoDBDocument {
	game: Game;
	playtype: AnyPlaytype;
	isDefault: boolean;
	createdBy: integer;
	groupName: string;
	name: string;
	desc: string;
}

export interface FunFactDocument extends MongoDBDocument {
	text: string;
	nsfw: boolean;
	anonymous: boolean;
	userID: integer;
	funfactID: string;
	timestamp: integer;
}

export type UserBadges = "alpha" | "beta" | "devTeam" | "contributor" | "significant-contributor";

/**
 * PublicUserDocument: These are the public values returned from GetUser functions.
 * Note that the private fields: password, email and integrations, are not present in this document.
 */
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
	customPfp: boolean;
	customBanner: boolean;
	clan: string | null; // todo
	badges: UserBadges[];
	authLevel: "banned" | "user" | "mod" | "admin";
}

export interface UGSRatingsLookup {
	"iidx:SP": "BPI" | "ktRating" | "ktLampRating";
	"iidx:DP": "BPI" | "ktRating" | "ktLampRating";
	"popn:9B": never; // @todo
	"sdvx:Single": "VF6";
	"usc:Single": "VF6";
	"ddr:SP": "MFCP" | "ktRating";
	"ddr:DP": "MFCP" | "ktRating";
	"maimai:Single": "ktRating";
	"jubeat:Single": "jubility";
	"museca:Single": "ktRating";
	"bms:7K": "sieglinde";
	"bms:14K": "sieglinde";
	"chunithm:Single": "naiveRating";
	"gitadora:Gita": "skill";
	"gitadora:Dora": "skill";
}

export interface UserGameStats<I extends IDStrings = IDStrings> extends MongoDBDocument {
	userID: integer;
	game: IDStringToGame[I];
	playtype: IDStringToPlaytype[I];
	ratings: Partial<Record<UGSRatingsLookup[I], number>>;
	classes: Partial<GameClasses<I>>;
}

/**
 * PrivateUserDocument is the document indicating that we've returned everything about the user
 * from the DB - including their private information.
 */
export interface PrivateUserDocument extends PublicUserDocument {
	password: string;
	email: string;
}

type SupportedIIDXVersions =
	| "26"
	| "27"
	| "28"
	| "27-omni"
	| "28-omni"
	| "inf"
	| "2dxtra"
	| "bmus"
	| "26-omni"
	| "16-cs"
	| "15-cs"
	| "14-cs"
	| "13-cs"
	| "12-cs"
	| "11-cs"
	| "10-cs"
	| "9-cs"
	| "8-cs"
	| "7-cs"
	| "6-cs"
	| "5-cs"
	| "4-cs"
	| "3-cs";

export interface GPTSupportedVersions {
	"iidx:SP": SupportedIIDXVersions;
	"iidx:DP": SupportedIIDXVersions;
	"popn:9B": never;
	"sdvx:Single": "heaven" | "vivid";
	"usc:Single": never;
	"ddr:SP": "a20";
	"ddr:DP": "a20";
	"maimai:Single": "finale";
	"jubeat:Single": never;
	"museca:Single": "1+1/2";
	"bms:7K": never;
	"bms:14K": never;
	"chunithm:Single": "paradise";
	"gitadora:Gita": "nextage";
	"gitadora:Dora": "nextage";
}

interface CDDataIIDXSP {
	notecount: integer;
	inGameID: integer;
	arcChartID: string | null;
	hashSHA256: string | null;
	"2dxtraSet": string | null;
}

interface CDDataDDRSP {
	songHash: string;
	inGameID: string;
}

interface CDDataBMS {
	notecount: integer;
	hashMD5: string;
	hashSHA256: string;
	tableFolders: { table: string; level: string }[];
}

interface ChartDocumentData {
	"iidx:SP": CDDataIIDXSP;
	"iidx:DP": CDDataIIDXSP;
	"popn:9B": Record<string, never>;
	"sdvx:Single": { inGameID: integer; arcChartID: string | null };
	"usc:Single": { hashSHA1: string | string[]; isOfficial: boolean };
	"ddr:SP": CDDataDDRSP;
	"ddr:DP": CDDataDDRSP;
	"maimai:Single": { maxPercent: number; inGameID: string };
	"jubeat:Single": { arcChartID: string | null };
	"museca:Single": Record<string, never>;
	"bms:7K": CDDataBMS;
	"bms:14K": CDDataBMS;
	"chunithm:Single": { inGameID: integer };
	"gitadora:Gita": { inGameID: integer };
	"gitadora:Dora": { inGameID: integer };
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
	versions: GPTSupportedVersions[I][];
}

interface TierlistPermissions {
	// all permission values are as follows:
	// 0 -> cannot do this
	// 1 -> can do this, but can be overrode by requireState
	// 2 -> can do this, and cannot be overrode.
	edit: integer;
	submit: integer;
	vote: integer;
}

export interface TierlistParent<G extends Game = Game> extends MongoDBDocument {
	game: G;
	playtype: Playtypes[G];
	name: string;
	isDefault: boolean;
	tierlistID: string;
	createdBy: integer;
	createdAt: number;
	permissions: Record<integer, TierlistPermissions> & { anyPlayer: TierlistPermissions };
	description: string;
	lastUpdated: number;
	config: {
		// Automatically update TierlistDataDocuments with humanised strings. idk how this will work yet.
		autoHumanise: boolean;
		// No matter what, users have a permission of 000 if they have not cleared/played the chart
		requireState: null | "clear" | "play";
		// the list of flags that can appear in TierlistDataDocuments
		flags: string[];
	};
}

export interface TierlistDataDocument<F extends string = never> extends MongoDBDocument {
	chartID: string;
	tierlistID: string;
	// lamp -> same, but for the lamp
	// score -> A generic, single value that determines how hard it is to "score" on this song. This is not
	// useful, to be honest, but is still used in generic rating calculations.
	type: "lamp" | "score";
	// null if type is "score", else, the grade or lamp this corresponds to.
	key: string | null;
	// used as primary key - is a hash of this data.
	tierlistDataID: string;
	data: {
		value: number;
		humanised: string;
		flags: {
			[flag in F]: boolean;
		};
	};
}

interface SongDocumentData {
	iidx: { genre: string };
	museca: { titleJP: string; artistJP: string };
	maimai: { titleJP: string; artistJP: string; genre: string };
	jubeat: Record<string, never>;
	popn: Record<string, never>;
	sdvx: { uscEquiv: integer | null };
	usc: { sdvxEquiv: integer | null };
	ddr: Record<string, never>;
	bms: { genre: string | null; subtitle: string | null; subartist: string | null };
	chunithm: { genre: string };
	gitadora: { isHot: boolean };
}

export interface SongDocument<G extends Game = Game> extends MongoDBDocument {
	id: integer;
	title: string;
	artist: string;
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
	data: SongDocumentData[G];
}

export interface TableDocument extends MongoDBDocument {
	tableID: string;
	game: Game;
	playtype: AnyPlaytype;
	title: string;
	description: string;
	folders: string[];
}

export interface BaseFolderDocument extends MongoDBDocument {
	title: string;
	game: Game;
	playtype: AnyPlaytype;
	folderID: string;
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
	data: string[];
}

export type FolderDocument = FolderStaticDocument | FolderChartsDocument | FolderSongsDocument;

export interface FolderChartLookup extends MongoDBDocument {
	chartID: string;
	folderID: string;
}

export interface UserMilestoneDocument extends MongoDBDocument {
	milestoneID: string;
	userID: integer;
	game: Game;
	playtype: AnyPlaytype;
	timeSet: integer;
	achieved: boolean;
	timeAchieved: integer | null;
	progress: integer;
}

type RanOptions = "NONRAN" | "RANDOM" | "R-RANDOM" | "S-RANDOM" | "MIRROR";

interface IIDXSPScoreMeta {
	random: RanOptions | null;
	assist: "NO ASSIST" | "AUTO SCRATCH" | "LEGACY NOTE" | "FULL ASSIST" | null;
	range: "NONE" | "SUDDEN+" | "HIDDEN+" | "SUD+ HID+" | "LIFT" | "LIFT SUD+" | null;
	gauge: "ASSISTED EASY" | "EASY" | "NORMAL" | "HARD" | "EX HARD" | null;
}

interface BMS7KScoreMeta {
	random: RanOptions | null;
	inputDevice: "KEYBOARD" | "BM_CONTROLLER" | null;
	client: "LR2" | "beatoraja" | "lr2oraja";
	lnType: null | "LN" | "CN";
}

interface ScoreMetaLookup {
	"iidx:SP": IIDXSPScoreMeta;
	"iidx:DP": IIDXSPScoreMeta & { random: [RanOptions, RanOptions] | null };
	"popn:9B": Record<string, never>;
	"sdvx:Single": { inSkillAnalyser: boolean | null };
	"usc:Single": {
		noteMod: "NORMAL" | "MIRROR" | "RANDOM" | "MIR-RAN" | null;
		gaugeMod: "NORMAL" | "HARD" | null;
	};
	"ddr:SP": Record<string, never>;
	"ddr:DP": Record<string, never>;
	"maimai:Single": Record<string, never>;
	"jubeat:Single": Record<string, never>;
	"museca:Single": Record<string, never>;
	"bms:7K": BMS7KScoreMeta;
	"bms:14K": BMS7KScoreMeta & { random: [RanOptions, RanOptions] | null };
	"chunithm:Single": Record<string, never>;
	"gitadora:Gita": Record<string, never>;
	"gitadora:Dora": Record<string, never>;
}

interface BASE_VALID_HIT_META {
	fast: integer | null;
	slow: integer | null;
	maxCombo: integer | null;
}

type IIDXHitMeta = BASE_VALID_HIT_META & {
	bp: integer | null;
	gauge: number | null;
	gaugeHistory: (number | null)[] | null;
	scoreHistory: number[] | null;
	comboBreak: integer | null;
	gsm: {
		EASY: (number | null)[];
		NORMAL: (number | null)[];
		HARD: (number | null)[];
		EX_HARD: (number | null)[];
	} | null;
};

type BMSJudgePermutations = `${"e" | "l"}${"bd" | "pr" | "gd" | "gr" | "pg"}`;

type BMSHitMeta = BASE_VALID_HIT_META &
	{
		[K in BMSJudgePermutations]: integer;
	} & {
		bp: integer | null;
		gauge: number | null;
	};

type SDVXHitMeta = BASE_VALID_HIT_META & {
	gauge: number | null;
	btnRate: number | null;
	holdRate: number | null;
	laserRate: number | null;
};

export interface HitMetaLookup {
	"iidx:SP": IIDXHitMeta;
	"iidx:DP": IIDXHitMeta;
	"popn:9B": BASE_VALID_HIT_META & { gauge: number };
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

type IIDXJudges = "pgreat" | "great" | "good" | "bad" | "poor";
type DDRJudges = "marvelous" | "perfect" | "great" | "good" | "boo" | "miss" | "ok" | "ng";
type GitadoraJudges = "perfect" | "great" | "good" | "ok" | "miss";

// judges might need to be changed here...
type SDVXJudges = "critical" | "near" | "miss";

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

export interface ScoreCalculatedDataLookup {
	"iidx:SP": "BPI" | "ktRating" | "ktLampRating";
	"iidx:DP": "BPI" | "ktRating" | "ktLampRating";
	// "popn:9B": never; // @todo
	"sdvx:Single": "VF6";
	"usc:Single": "VF6";
	"ddr:SP": "MFCP" | "ktRating";
	"ddr:DP": "MFCP" | "ktRating";
	"maimai:Single": "ktRating";
	// "jubeat:Single": "jubility";
	"museca:Single": "ktRating";
	"bms:7K": "sieglinde";
	"bms:14K": "sieglinde";
	"chunithm:Single": "rating";
	"gitadora:Gita": "skill";
	"gitadora:Dora": "skill";
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
		other?: PBScoreComposedReference[];
	};
	rankingData: {
		rank: integer;
		outOf: integer;
	};
	userID: integer;
	chartID: string;
	game: Game;
	playtype: AnyPlaytype;
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
	| "file/eamusement-iidx-csv"
	| "file/batch-manual"
	| "file/solid-state-squad"
	| "file/mer-iidx"
	| "file/pli-iidx-csv";

export type APIImportTypes =
	| "api/flo-iidx"
	| "api/flo-sdvx"
	| "api/eag-iidx"
	| "api/eag-sdvx"
	| "api/min-sdvx"
	| "api/arc-iidx"
	| "api/arc-sdvx";

export type IRImportTypes =
	| "ir/direct-manual"
	| "ir/barbatos"
	| "ir/fervidex"
	| "ir/usc"
	| "ir/chunitachi"
	| "ir/beatoraja"
	| "ir/fervidex-static";

export type ImportTypes = FileUploadImportTypes | IRImportTypes | APIImportTypes;

export interface ImportProcessInfoKTDataNotFound {
	success: false;
	type: "KTDataNotFound";
	message: string | null;
	content: {
		data: unknown;
		context: unknown; // TEMP
		orphanID: string;
	};
}

export interface ImportProcessInfoOrphanExists {
	success: false;
	type: "OrphanExists";
	message: string | null;
	content: {
		orphanID: string;
	};
}

export interface ImportProcessInfoInvalidDatapoint {
	success: false;
	type: "InvalidDatapoint";
	message: string | null;
	content: {
		field?: string; // optional, and probably temp
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

export type ImportProcessingInfo<I extends IDStrings = IDStrings> =
	| ImportProcessInfoKTDataNotFound
	| ImportProcessInfoOrphanExists
	| ImportProcessInfoScoreImported<I>
	| ImportProcessInfoInvalidDatapoint
	| ImportProcessInfoInternalError;

export interface IIDXBPIData {
	chartID: string;
	kavg: integer;
	wr: integer;
	kesd: number;
	coef: number | null;
}

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
	service: "FLO" | "EAG" | "MIN";
}

/**
 * Used to resolve beatoraja IR courses.
 */
export interface BMSCourseDocument {
	title: string;
	md5sums: string;
	set: "genocideDan" | "stslDan";
	playtype: "7K" | "14K";
	value: integer;
}

export type RedisIPCChannels = "class-update" | "goal-achieved" | "milestone-achieved";

export type RedisIPCData = {
	"class-update": {
		userID: integer;
		set: GameClassSets[IDStrings];
		old: integer | null;
		new: integer | null;
	};
	"goal-achieved": {
		userID: integer;
		goalID: string;
		old: GoalImportStat;
		new: GoalImportStat;
	};
	"milestone-achieved": {
		userID: integer;
		milestoneID: string;
		old: MilestoneImportStat;
		new: MilestoneImportStat;
	};
};

/**
 * All the permissions a token may have.
 */
export type APIPermissions =
	| "submit_score"
	| "customise_profile"
	| "customise_session"
	| "customise_score"
	| "delete_score";

/**
 * Information about the API Token used to make this request.
 */
export interface APITokenDocument extends MongoDBDocument {
	userID: integer | null;
	token: string | null;
	identifier: string;
	permissions: Partial<Record<APIPermissions, boolean>>;
}

export interface ImportLockDocument extends MongoDBDocument {
	userID: integer;
}

export type ShowcaseStatDetails = ShowcaseStatFolder | ShowcaseStatChart;

export interface ShowcaseStatFolder {
	mode: "folder";
	folderID: string | string[];
	property: "score" | "percent" | "grade" | "lamp";
	gte: number;
}

export interface ShowcaseStatChart {
	mode: "chart";
	chartID: string;
	property: "score" | "percent" | "grade" | "lamp" | "playcount";
}

export interface UGPTSettings<I extends IDStrings = IDStrings> extends MongoDBDocument {
	userID: integer;
	game: IDStringToGame[I];
	playtype: IDStringToPlaytype[I];
	preferences: {
		preferredScoreAlg: ScoreCalculatedDataLookup[I] | null;
		preferredSessionAlg: SessionCalculatedDataLookup[I] | null;
		preferredProfileAlg: UGSRatingsLookup[I] | null;
		stats: ShowcaseStatDetails[];
	};
}

export interface UserGameStatsSnapshot<I extends IDStrings = IDStrings>
	extends MongoDBDocument,
		UserGameStats<I> {
	ranking: integer;
	playcount: integer;
	timestamp: integer;
}

export interface ARCSavedProfileDocument extends MongoDBDocument {
	userID: integer;
	accountID: string;
	forImportType: "api/arc-iidx" | "api/arc-sdvx";
}
