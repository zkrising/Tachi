import type { integer } from "../types";

/**
 * What game + playtypes does Tachi support? We typically shorten this concept
 * to a "GPT", or Game+Playtype.
 *
 * The keys on the left are the games Tachi supports. The value of those keys
 * are the playtypes that game has.
 *
 * A playtype is a way of splitting a game up into sub, completely separate games.
 * A good example is the difference between IIDX SP and IIDX DP. Although they share
 * songs and a *lot* of logic, they should be completely separate when it comes to
 * storing scores and user profiles.
 *
 * For games that don't really have a meaningful concept of "playtypes", "Single"
 * is the go-to.
 */
export interface Playtypes {
	iidx: "DP" | "SP";
	popn: "9B";
	sdvx: "Single";
	usc: "Controller" | "Keyboard";
	maimaidx: "Single";
	jubeat: "Single";
	museca: "Single";
	chunithm: "Single";
	bms: "7K" | "14K";
	gitadora: "Dora" | "Gita";
	wacca: "Single";
	pms: "Controller" | "Keyboard";
	itg: "Stamina";
}

/**
 * All supported games by Tachi.
 */
export type Game = keyof Playtypes;

/**
 * Expresses any playtype (for any game). Alias for Playtypes[Game].
 */
export type Playtype = Playtypes[Game];

/**
 * GPTStrings are an internal (ish) identifier used to identify Game + Playtype combos.
 *
 * These are used in places where we want to switch over all supported game + playtype
 * combos.
 *
 * The below type magic automatically creates all combinations like iidx:SP, iidx:DP...
 * using the `Playtypes` thing above.
 */
export type GPTStrings = keyof {
	[G in Game as `${G}:${Playtypes[G]}`]: never;
};

/**
 * Utility index type. Given an GPTString [I], return its playtype.
 */
export interface GPTStringToPlaytype {
	"iidx:SP": "SP";
	"iidx:DP": "DP";
	"popn:9B": "9B";
	"sdvx:Single": "Single";
	"usc:Keyboard": "Keyboard";
	"usc:Controller": "Controller";
	"maimaidx:Single": "Single";
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

/**
 * Utility index type. Given a GPTString [I], return its game.
 *
 * @example GPTStringToGame["iidx:SP"] -> "iidx"
 */
export interface GPTStringToGame {
	"iidx:SP": "iidx";
	"iidx:DP": "iidx";
	"popn:9B": "popn";
	"sdvx:Single": "sdvx";
	"usc:Keyboard": "usc";
	"usc:Controller": "usc";
	"maimaidx:Single": "maimaidx";
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

/**
 * Given a game, return all IDStrings this game has.
 */
export interface GameToIDStrings {
	iidx: "iidx:DP" | "iidx:SP";
	sdvx: "sdvx:Single";
	usc: "usc:Controller" | "usc:Keyboard";
	maimaidx: "maimaidx:Single";
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

type IIDXGrades = "A" | "AA" | "AAA" | "B" | "C" | "D" | "E" | "F" | "MAX-" | "MAX";
type SDVXGrades = "A" | "A+" | "AA" | "AA+" | "AAA" | "AAA+" | "B" | "C" | "D" | "PUC" | "S";

type GitadoraGrades = "A" | "B" | "C" | "MAX" | "S" | "SS";

/**
 * What grades do Tachi's supported GPTs have?
 * Grades are an ordered list of discrete values for a given game,
 * typically derived from score values.
 *
 * All GPTs **must** define a series of grades, as they are used frequently in the UI
 * for things like folder graphs and raise breakdowns.
 */
export interface Grades {
	"iidx:SP": IIDXGrades;
	"iidx:DP": IIDXGrades;
	"popn:9B": "A" | "AA" | "AAA" | "B" | "C" | "D" | "E" | "S";
	"sdvx:Single": SDVXGrades;
	"usc:Keyboard": SDVXGrades;
	"usc:Controller": SDVXGrades;
	"maimaidx:Single":
		| "A"
		| "AA"
		| "AAA"
		| "B"
		| "BB"
		| "BBB"
		| "C"
		| "D"
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

/**
 * What lamps do Tachi's supported GPTs have? Lamps are an ordered list of discrete
 * values, typically representing a "clear type" or something similar.
 *
 * Common examples of lamps include "FAILED", "CLEAR" and "FULL COMBO".
 *
 * All GPTs **must** define a series of lamps, as they're used frequently in the UI
 * for things like folder graphs and raise breakdowns.
 */
export interface Lamps {
	"iidx:SP": IIDXLamps;
	"iidx:DP": IIDXLamps;
	"popn:9B": "CLEAR" | "EASY CLEAR" | "FAILED" | "FULL COMBO" | "PERFECT";
	"sdvx:Single": SDVXLamps;
	"usc:Keyboard": SDVXLamps;
	"usc:Controller": SDVXLamps;
	"maimaidx:Single":
		| "ALL PERFECT"
		| "ALL PERFECT+"
		| "CLEAR"
		| "FAILED"
		| "FULL COMBO"
		| "FULL COMBO+";
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

type IIDX2DXTraSets = "All Scratch" | "Kichiku" | "Kiraku";
type IIDXSPDifficulties = "ANOTHER" | "BEGINNER" | "HYPER" | "LEGGENDARIA" | "NORMAL";
type IIDXDPDifficulties = "ANOTHER" | "HYPER" | "LEGGENDARIA" | "NORMAL";

/**
 * What difficulties do Tachi's supported GPTs have?
 *
 * A "difficulty" is a string attached onto a chart document. In the simplest terms,
 * this determines how many charts a given song can have, and how to distinguish
 * them.
 * A chart **must** be unique on songID + playtype + difficulty.
 * An example would be something like:
 * FREEDOM DiVE SP ANOTHER
 * FREEDOM DiVE DP ANOTHER
 * FREEDOM DiVE DP HYPER
 *
 * For most arcade games this is a fixed set of values, like "Easy", "Normal"
 * or "Hard". However, Tachi isn't limited to a fixed set of strings.
 * Some games - especially home games - tend to support any amount of difficulties
 * per song. For this case, you can set the supported difficulties to just `string`.
 * This will allow *any* string in that field, and therefore a song can have any
 * amount of charts.
 */
export interface Difficulties {
	"iidx:SP": `${"" | `${IIDX2DXTraSets} `}${IIDXSPDifficulties}`;
	"iidx:DP": `${"" | `${IIDX2DXTraSets} `}${IIDXDPDifficulties}`;
	"popn:9B": "Easy" | "EX" | "Hyper" | "Normal";
	"sdvx:Single": "ADV" | "EXH" | "GRV" | "HVN" | "INF" | "MXM" | "NOV" | "VVD" | "XCD";
	"usc:Controller": "ADV" | "EXH" | "INF" | "NOV";
	"usc:Keyboard": "ADV" | "EXH" | "INF" | "NOV";
	"maimaidx:Single":
		| "Advanced"
		| "Basic"
		| "DX Advanced"
		| "DX Basic"
		| "DX Expert"
		| "DX Master"
		| "DX Re:Master"
		| "Expert"
		| "Master"
		| "Re:Master";
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
 * What rating algorithms are ran on sessions for this GPT?
 *
 * Sessions may have data calculated about them and attached on.
 * For example, we may want to average the best 10 skill values this user got in
 * a session. Things like this allow us to sort a users sessions and display their
 * best.
 *
 * This type declares the names of those algorithms, and typesafety enforces that
 * all of them get an implementation.
 */
export interface SessionRatingAlgorithms {
	"iidx:SP": "BPI" | "ktLampRating";
	"iidx:DP": "BPI" | "ktLampRating";
	"popn:9B": "classPoints";
	"sdvx:Single": "ProfileVF6" | "VF6";
	"usc:Keyboard": "ProfileVF6" | "VF6";
	"usc:Controller": "ProfileVF6" | "VF6";
	"maimaidx:Single": "rate";
	"jubeat:Single": "jubility";
	"museca:Single": "curatorSkill";
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

/**
 * What rating algorithms apply to a users profile for this GPT?
 *
 * This should be self explanatory.
 */
export interface ProfileRatingAlgorithms {
	"iidx:SP": "BPI" | "ktLampRating";
	"iidx:DP": "BPI" | "ktLampRating";
	"popn:9B": "naiveClassPoints";
	"sdvx:Single": "VF6";
	"usc:Keyboard": "VF6";
	"usc:Controller": "VF6";
	"maimaidx:Single": "naiveRate" | "rate";
	"jubeat:Single": "jubility" | "naiveJubility";
	"museca:Single": "curatorSkill";
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

/**
 * What rating algorithms exist for scores in this GPT?
 *
 * Scores themselves may have calculated data attached onto them.
 * This type declares the names of those algorithms, and their implementation is
 * enforced by typesafety.
 */
export interface ScoreRatingAlgorithms {
	"iidx:SP": "BPI" | "ktLampRating";
	"iidx:DP": "BPI" | "ktLampRating";
	"popn:9B": "classPoints";
	"sdvx:Single": "VF6";
	"usc:Keyboard": "VF6";
	"usc:Controller": "VF6";
	"maimaidx:Single": "rate";
	"jubeat:Single": "jubility";
	"museca:Single": "curatorSkill";
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
	| "28"
	| "29-omni"
	| "29"
	| "30"
	| "bmus"
	| "inf";

/**
 * What "versions" does this GPT support?
 *
 * Versions are a series of strings that may be attached onto charts as part of their
 * `versions` array. These are used to resolve problems like when a chart is changed
 * between versions.
 *
 * These are also typically used to construct folders for the GPT, allowing things like
 * INFINITAS players to see only the charts they're able to play.
 */
export interface SupportedVersions {
	"iidx:SP": SupportedIIDXVersions;
	"iidx:DP": SupportedIIDXVersions;
	"popn:9B": "kaimei" | "peace";
	"sdvx:Single": "booth" | "exceed" | "gw" | "heaven" | "inf" | "konaste" | "vivid";
	"usc:Controller": never;
	"usc:Keyboard": never;
	"jubeat:Single":
		| "clan"
		| "copious"
		| "festo"
		| "jubeat"
		| "knit"
		| "prop"
		| "qubell"
		| "ripples"
		| "saucer";
	"maimaidx:Single": "universeplus";
	"museca:Single": "1.5-b" | "1.5";
	"bms:7K": never;
	"bms:14K": never;
	"chunithm:Single": "paradiselost";
	"gitadora:Gita": "konaste";
	"gitadora:Dora": "konaste";
	"wacca:Single": "reverse";
	"pms:Controller": never;
	"pms:Keyboard": never;
	"itg:Stamina": never;
}

interface ChartDataIIDX {
	notecount: integer;
	inGameID: Array<integer> | integer;
	hashSHA256: string | null;
	"2dxtraSet": string | null;
	kaidenAverage: integer | null;
	worldRecord: integer | null;
	bpiCoefficient: number | null;
}

interface ChartDataPMS {
	notecount: integer;
	hashMD5: string;
	hashSHA256: string;
	tableFolders: Array<{ table: string; level: string }>;
}

type ChartDataBMS = ChartDataPMS & {
	aiLevel?: string | null;
};

interface ChartDataUSC {
	hashSHA1: Array<string> | string;
	isOfficial: boolean;
	effector: string;
	tableFolders: Array<{ table: string; level: string }>;
}

/**
 * What GPT-Specific content is stored on each chart?
 *
 * All charts in Tachi get a `data` property where they can store GPT-specific content.
 * This allows us to store things like `kaidenAverage` for IIDX, but not make that
 * property exist on - say - pop'n, where it wouldn't make any sense.
 */
export interface ChartData {
	"iidx:SP": ChartDataIIDX;
	"iidx:DP": ChartDataIIDX;
	"popn:9B": { hashSHA256: Array<string> | string | null; inGameID: integer };
	"sdvx:Single": { inGameID: integer };
	"usc:Keyboard": ChartDataUSC;
	"usc:Controller": ChartDataUSC;
	"jubeat:Single": { inGameID: Array<integer> | integer; isHardMode: boolean };
	"maimaidx:Single": { isLatest: boolean };
	"museca:Single": { inGameID: integer };
	"bms:7K": ChartDataBMS;
	"bms:14K": ChartDataBMS;
	"chunithm:Single": { inGameID: integer };
	"gitadora:Gita": { inGameID: integer };
	"gitadora:Dora": { inGameID: integer };
	"wacca:Single": { isHot: boolean };
	"pms:Controller": ChartDataPMS;
	"pms:Keyboard": ChartDataPMS;
	"itg:Stamina": {
		hashGSV3: string;
		difficultyTag: "Beginner" | "Challenge" | "Easy" | "Edit" | "Hard" | "Medium";
		breakdown: {
			detailed: string;
			partiallySimplified: string;
			simplified: string;
			total: string;
			npsPerMeasure: Array<number>;
			notesPerMeasure: Array<number>;
		};
		length: number;
		charter: string;
		displayBPM: number;
	};
}

/**
 * What Game-Specific content is stored on each song?
 *
 * All songs in Tachi get a `data` field which allows them to store game-specific
 * fields. This allows us to have things like "genre" for some games, but not all.
 */
export interface SongData {
	iidx: { genre: string; displayVersion: string | null };
	museca: { titleJP: string; artistJP: string; displayVersion: string };
	maimaidx: { displayVersion: string };
	jubeat: { displayVersion: string };
	popn: {
		displayVersion: string | null;
		genre: string;
		genreEN: string | null;
	};
	sdvx: { displayVersion: string };
	usc: Record<string, never>;
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

/**
 * What tierlists does each GPT support?
 *
 * If the GPT has no tierlists, set this to `never`.
 */
export interface SupportedTierlists {
	"iidx:SP": "kt-EXHC" | "kt-HC" | "kt-NC";
	"iidx:DP": "dp-tier";
	"bms:7K": "sgl-EC" | "sgl-HC";
	"bms:14K": "sgl-EC" | "sgl-HC";
	"popn:9B": never;
	"sdvx:Single": "clear";
	"usc:Keyboard": never;
	"usc:Controller": never;
	"maimaidx:Single": never;
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

/**
 * What metadata should exist for scores on this GPT?
 *
 * This is *score* specific metadata and cannot **ever** exist on a PB.
 * That is to say, the datapoints here don't make sense to ever be merged.
 * You can't merge a NONRAN option with MIRROR!
 *
 * This is intended for things like modifiers or options.
 * (What RANDOM was the user using? etc.)
 */
export interface ScoreMeta {
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
	"maimaidx:Single": Record<string, never>;
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

interface BASE_ADDITIONAL_METRICS {
	fast: integer | null;
	slow: integer | null;
	maxCombo: integer | null;
}

type IIDXAdditionalMetrics = BASE_ADDITIONAL_METRICS & {
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

type BMSAdditionalMetrics = BASE_ADDITIONAL_METRICS & {
	[K in BMSJudgePermutations]: integer;
} & {
	bp: integer | null;
	gauge: number | null;
	gaugeHistory: Array<number> | null;
};

type USCAdditionalMetrics = BASE_ADDITIONAL_METRICS & {
	gauge: number | null;
};

/**
 * What GPT-Specific content exists for this score that isn't the actual score metrics?
 *
 * These are metrics like gauge values at the end of the score, etc. Things like
 * fast/slow and maxCombo can also be here.
 *
 * Everything here is generally optional or nullable, and does not *have* to be provided
 * by a score import.
 */
export interface AdditionalMetrics {
	"iidx:SP": IIDXAdditionalMetrics;
	"iidx:DP": IIDXAdditionalMetrics;
	"popn:9B": BASE_ADDITIONAL_METRICS & {
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
	"sdvx:Single": BASE_ADDITIONAL_METRICS & {
		gauge: number | null;
		exScore: number | null;
	};
	"usc:Controller": USCAdditionalMetrics;
	"usc:Keyboard": USCAdditionalMetrics;
	"maimaidx:Single": BASE_ADDITIONAL_METRICS;
	"jubeat:Single": BASE_ADDITIONAL_METRICS;
	"museca:Single": BASE_ADDITIONAL_METRICS;
	"bms:7K": BMSAdditionalMetrics;
	"bms:14K": BMSAdditionalMetrics;
	"chunithm:Single": BASE_ADDITIONAL_METRICS;
	"gitadora:Gita": BASE_ADDITIONAL_METRICS;
	"gitadora:Dora": BASE_ADDITIONAL_METRICS;
	"wacca:Single": BASE_ADDITIONAL_METRICS;
	"pms:Controller": BMSAdditionalMetrics;
	"pms:Keyboard": BMSAdditionalMetrics;
	"itg:Stamina": BASE_ADDITIONAL_METRICS & {
		gaugeHistory: Array<integer> | null;
		diedAt: integer | null;
	};
}

type IIDXJudges = "bad" | "good" | "great" | "pgreat" | "poor";
type GitadoraJudges = "good" | "great" | "miss" | "ok" | "perfect";

// judges might need to be changed here...
// @bug Known that sdvx calls misses errors. I, however, don't care.
type SDVXJudges = "critical" | "miss" | "near";

/**
 * What judgements exist for this GPT?
 *
 * Tachi mandates that a game has a concept of judgements (i.e. timing windows).
 * This type declares the names of those timing windows.
 */
export interface Judgements {
	"iidx:SP": IIDXJudges;
	"iidx:DP": IIDXJudges;
	"popn:9B": "bad" | "cool" | "good" | "great";
	"sdvx:Single": SDVXJudges;
	"usc:Controller": SDVXJudges;
	"usc:Keyboard": SDVXJudges;
	"maimaidx:Single": "good" | "great" | "miss" | "pcrit" | "perfect";
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

/**
 * If any, what preferences (settings) can users set for this GPT?
 *
 * This allows us to support GPT-Specific preferences, like a "BPI Target", which only
 * makes sense for IIDX.
 */
export interface UGPTSpecificPreferences {
	"iidx:SP": { display2DXTra: boolean; bpiTarget: number };
	"iidx:DP": { display2DXTra: boolean; bpiTarget: number };
	"popn:9B": Record<string, never>;
	"sdvx:Single": { vf6Target: number };
	"usc:Controller": { vf6Target: number };
	"usc:Keyboard": { vf6Target: number };
	"maimaidx:Single": Record<string, never>;
	"jubeat:Single": { jubilityTarget: number };
	"museca:Single": Record<string, never>;
	"bms:7K": { displayTables: Array<string> };
	"bms:14K": { displayTables: Array<string> };
	"chunithm:Single": Record<string, never>;
	"gitadora:Gita": Record<string, never>;
	"gitadora:Dora": Record<string, never>;
	"wacca:Single": Record<string, never>;
	"pms:Controller": Record<string, never>;
	"pms:Keyboard": Record<string, never>;
	"itg:Stamina": Record<string, never>;
}

/**
 * What classes does this GPT support?
 *
 * This type declares the names of class sets for a given GPT.
 *
 * A class is a *discrete* value from an ordered list of values. Common examples
 * would be dans, jubility colours, etc.
 *
 * You can think of these as discrete profile metrics.
 *
 * Note that the actual values for these classes are declared in each game's
 * configuration.
 */
export interface GameClassSets {
	"iidx:SP": "dan";
	"iidx:DP": "dan";
	"popn:9B": "class";
	"sdvx:Single": "dan" | "vfClass";
	"usc:Keyboard": never;
	"usc:Controller": never;
	"maimaidx:Single": "colour" | "dan";
	"jubeat:Single": "colour";
	"museca:Single": never;
	"bms:7K": "genocideDan" | "lnDan" | "scratchDan" | "stslDan";
	"bms:14K": "genocideDan" | "stslDan";
	"chunithm:Single": "colour";
	"gitadora:Gita": "colour";
	"gitadora:Dora": "colour";
	"wacca:Single": "colour" | "stageUp";
	"pms:Controller": "dan";
	"pms:Keyboard": "dan";
	"itg:Stamina": never;
}

export type AllClassSets = GameClassSets[GPTStrings];

export type GameClasses<GPT extends GPTStrings> = {
	[K in GameClassSets[GPT]]: integer;
};
