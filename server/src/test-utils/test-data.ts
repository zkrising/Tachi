import db from "external/mongo/db";
import fs from "fs";
import {
	USC_DEFAULT_HOLD,
	USC_DEFAULT_MISS,
	USC_DEFAULT_NEAR,
	USC_DEFAULT_PERFECT,
	USC_DEFAULT_SLAM,
} from "lib/constants/usc-ir";
import { DryScore } from "lib/score-import/framework/common/types";
import { BarbatosScore } from "lib/score-import/import-types/ir/barbatos/types";
import { KsHookSV6CScore } from "lib/score-import/import-types/ir/kshook-sv6c/types";
import { LR2HookScore } from "lib/score-import/import-types/ir/lr2hook/types";
import path from "path";
import { USCClientScore } from "server/router/ir/usc/_playtype/types";
import {
	ChartDocument,
	FolderDocument,
	GoalDocument,
	MilestoneDocument,
	PBScoreDocument,
	ScoreDocument,
	SongDocument,
	UserGoalDocument,
} from "tachi-common";
import { ApplyNTimes, RFA } from "utils/misc";

const file = (name: string) => path.join(__dirname, "/test-data", name);

export const GetKTDataJSON = (name: string) => JSON.parse(fs.readFileSync(file(name), "utf-8"));
export const GetKTDataBuffer = (name: string) => fs.readFileSync(file(name));

export const TestingIIDXSPDryScore: DryScore<"iidx:SP"> = {
	service: "e-amusement",
	game: "iidx",
	scoreData: {
		score: 786,
		lamp: "CLEAR",
		percent: 50,
		grade: "C",
		judgements: {
			pgreat: 50,
			great: 10,
		},
		hitMeta: {},
	},
	scoreMeta: {},
	timeAchieved: null,
	comment: null,
	importType: "file/eamusement-iidx-csv",
};

export const TestingIIDXSPScorePB: PBScoreDocument<"iidx:SP"> = {
	chartID: "c2311194e3897ddb5745b1760d2c0141f933e683",
	userID: 1,
	calculatedData: {
		ktLampRating: 0,
		BPI: 10.1,
	},
	composedFrom: {
		scorePB: "TESTING_SCORE_ID",
		lampPB: "TESTING_SCORE_ID",
	},
	highlight: false,
	isPrimary: true,
	scoreData: {
		score: 1479,
		percent: 94.08396946564885,
		esd: 10.64453125,
		grade: "AAA",
		gradeIndex: 7,
		lamp: "EX HARD CLEAR",
		lampIndex: 6,
		judgements: {
			pgreat: 697,
			great: 85,
		},
		hitMeta: {
			bp: 2,
		},
	},
	rankingData: {
		rank: 1,
		outOf: 2,
	},
	songID: 1,
	game: "iidx",
	playtype: "SP",
	timeAchieved: 10000,
};

export const TestingIIDXSPScore: ScoreDocument<"iidx:SP"> = {
	service: "foo (DIRECT-MANUAL)",
	game: "iidx",
	playtype: "SP",
	userID: 1,
	scoreData: {
		score: 786,
		lamp: "CLEAR",
		percent: 50,
		grade: "C",
		esd: 30,
		gradeIndex: 3,
		lampIndex: 4,
		judgements: {
			pgreat: 50,
			great: 10,
		},
		hitMeta: {},
	},
	scoreMeta: {},
	calculatedData: {
		ktLampRating: 5,
	},
	timeAchieved: 1619454485988,
	songID: 1,
	chartID: "c2311194e3897ddb5745b1760d2c0141f933e683",
	highlight: false,
	isPrimary: true,
	comment: null,
	timeAdded: 1,
	scoreID: "TESTING_SCORE_ID",
	importType: "ir/direct-manual",
};

export const TestingKsHookSV6CScore: KsHookSV6CScore = {
	clear: "CLEAR_EXCESSIVE",
	critical: 1184,
	difficulty: "DIFFICULTY_ADVANCED",
	error: 30,
	gauge: 71,
	grade: "GRADE_AA_PLUS",
	max_chain: 158,
	music_id: 1,
	near: 46,
	rate: "RATE_EXCESSIVE",
	score: 9579365,
	track_no: 0,
	ex_score: 1334,
	retry_count: 0,
};
export const TestingBMS7KScore: ScoreDocument<"bms:7K"> = {
	calculatedData: {
		sieglinde: 20,
	},
	chartID: "88eb6cc5683e2740cbd07f588a5f3db1db8d467b",
	songID: 27339,
	comment: null,
	game: "bms",
	highlight: false,
	importType: "ir/beatoraja",
	isPrimary: true,
	playtype: "7K",
	scoreData: {
		esd: null,
		grade: "A",
		gradeIndex: 5,
		hitMeta: {},
		judgements: {},
		lamp: "HARD CLEAR",
		lampIndex: 4,
		percent: 40,
		score: 1030,
	},
	scoreID: "test_bms_score",
	scoreMeta: {},
	service: "foo",
	timeAchieved: null,
	timeAdded: 100,
	userID: 1,
};

export const TestingLR2HookScore: LR2HookScore = {
	md5: "38616b85332037cc12924f2ae2840262",
	playerData: {
		autoScr: 0,
		gameMode: "7K",
		random: "RAN",
		gauge: "GROOVE",
	},
	scoreData: {
		pgreat: 1000,
		great: 500,
		good: 100,
		bad: 50,
		poor: 25,
		exScore: 2500,
		maxCombo: 50,
		moneyScore: 150_000,
		notesTotal: 2256,
		notesPlayed: 2256,
		lamp: "HARD",
		hpGraph: ApplyNTimes(1000, () => RFA([100, 50, 80, 0])),
	},
};

export const TestingJubeatChart: ChartDocument<"jubeat:Single"> = {
	chartID: "b90a319f18d1a746b330b8f4cd6f74874f664421",
	rgcID: null,
	songID: 1,
	level: "6",
	levelNum: 6,
	difficulty: "ADV",
	isPrimary: true,
	playtype: "Single",
	data: {
		inGameID: 10000001,
		isHardMode: false,
	},
	tierlistInfo: {},
	versions: ["festo"],
};

export const Testing511SPA: ChartDocument<"iidx:SP"> = {
	rgcID: null,
	chartID: "c2311194e3897ddb5745b1760d2c0141f933e683",
	difficulty: "ANOTHER",
	songID: 1,
	playtype: "SP",
	levelNum: 10,
	level: "10",
	data: {
		inGameID: 1000,
		notecount: 786,
		arcChartID: "CYjwAuz7Yq9",
		"2dxtraSet": null,
		hashSHA256: null,
		bpiCoefficient: null,
		kaidenAverage: null,
		worldRecord: null,
	},
	tierlistInfo: {},
	isPrimary: true,
	versions: [
		"27-omni",
		"26-omni",
		"27",
		"26",
		"inf",
		"16-cs",
		"12-cs",
		"10-cs",
		"8-cs",
		"7-cs",
		"bmus",
	],
};

export const Testing511Song: SongDocument<"iidx"> = {
	title: "5.1.1.",
	artist: "dj nagureo",
	id: 1,
	altTitles: [],
	searchTerms: [],
	data: {
		genre: "PIANO AMBIENT",
		displayVersion: "1",
	},
};

export const TestingAlbidaADV: ChartDocument<"sdvx:Single"> = {
	rgcID: null,
	chartID: "5088a4d0e1ee9d0cc2f625934306e45b1a60699b",
	difficulty: "ADV",
	songID: 1,
	playtype: "Single",
	levelNum: 10,
	level: "10",
	data: {
		inGameID: 1,
		arcChartID: "EOZ7FixCDpv",
	},
	isPrimary: true,
	versions: ["booth", "inf", "gw", "heaven", "vivid", "exceed", "konaste"],
	tierlistInfo: {},
};

export const BMSGazerChart: ChartDocument<"bms:7K"> = {
	songID: 27339,
	chartID: "88eb6cc5683e2740cbd07f588a5f3db1db8d467b",
	rgcID: null,
	data: {
		notecount: 2256,
		hashMD5: "38616b85332037cc12924f2ae2840262",
		hashSHA256: "195fe1be5c3e74fccd04dc426e05f8a9cfa8a1059c339d0a23e99f63661f0b7d",
		tableFolders: [
			{
				level: "17",
				table: "★",
			},
		],
	},
	level: "?",
	levelNum: 0,
	difficulty: "CHART",
	playtype: "7K",
	isPrimary: true,
	versions: [],
	tierlistInfo: {},
};

export const CHUNITHMBBKKChart: ChartDocument<"chunithm:Single"> = {
	rgcID: null,
	chartID: "192b96bdb6150f80ba6412ce02df1249e16c0cb0",
	difficulty: "BASIC",
	songID: 3,
	playtype: "Single",
	levelNum: 3,
	level: "3",
	data: {
		inGameID: 3,
	},
	tierlistInfo: {},
	isPrimary: true,
	versions: ["paradiselost"],
};

export const TestingSDVXAlbidaSong: SongDocument<"sdvx"> = {
	title: "ALBIDA Powerless Mix",
	artist: "無力P",
	id: 1,
	altTitles: [],
	searchTerms: ["albida_muryoku", "ｱﾙﾋﾞﾀﾞﾊﾟﾜｰﾚｽﾐｯｸｽ"],
	data: {
		displayVersion: "booth",
	},
};

export const TestingDoraChart: ChartDocument<"gitadora:Dora"> = {
	songID: 0,
	chartID: "29f0bfab357ba54e3fd0176fb3cbc578c9ec8df5",
	difficulty: "BASIC",
	playtype: "Dora",
	levelNum: 1.6,
	level: "1.60",
	data: {
		inGameID: 0,
	},
	isPrimary: true,
	rgcID: null,
	tierlistInfo: {},
	versions: ["nextage"],
};

export const TestingSDVXSingleDryScore: DryScore<"sdvx:Single"> = {
	service: "e-amusement",
	game: "sdvx",
	scoreData: {
		score: 9_500_000,
		lamp: "EXCESSIVE CLEAR",
		percent: 95,
		grade: "AA+",
		judgements: {},
		hitMeta: {},
	},
	scoreMeta: {},
	timeAchieved: null,
	comment: null,
	importType: "file/batch-manual",
};

export const TestingGITADORADoraDryScore: DryScore<"gitadora:Dora"> = {
	service: "fake-service",
	game: "gitadora",
	scoreData: {
		score: 70.76,
		lamp: "CLEAR",
		percent: 70.76,
		grade: "B",
		judgements: {},
		hitMeta: {},
	},
	scoreMeta: {},
	timeAchieved: null,
	comment: null,
	importType: "file/batch-manual",
};

export const TestingIIDXEamusementCSV26 = GetKTDataBuffer(
	"./eamusement-iidx-csv/pre-leggendaria.csv"
);
export const TestingIIDXEamusementCSV27 = GetKTDataBuffer(
	"./eamusement-iidx-csv/post-leggendaria.csv"
);

export const TestingSDVXEamusementCSV = GetKTDataBuffer(
	"./eamusement-sdvx-csv/exceed-gear-score.csv"
);

export const TestingBarbatosScore: BarbatosScore = {
	difficulty: 1,
	level: 10,
	song_id: 1,
	max_chain: 50,
	critical: 50,
	near_total: 30,
	near_fast: 20,
	near_slow: 10,
	score: 9500000,
	error: 5,
	percent: 81,
	did_fail: false,
	clear_type: 2,
	gauge_type: 1,
	is_skill_analyzer: false,
};

export const HC511Goal: GoalDocument = {
	charts: {
		type: "single",
		data: Testing511SPA.chartID,
	},
	createdBy: 1,
	game: "iidx",
	goalID: "mock_goalID",
	playtype: "SP",
	timeAdded: 0,
	title: "HC 5.1.1. SPA",
	criteria: {
		mode: "single",
		value: 5,
		key: "scoreData.lampIndex",
	},
};

export const HC511UserGoal: UserGoalDocument = {
	achieved: false,
	timeAchieved: null,
	game: "iidx",
	playtype: "SP",
	goalID: "mock_goalID",
	lastInteraction: null,
	outOf: 5,
	outOfHuman: "HARD CLEAR",
	progress: null,
	progressHuman: "NO DATA",
	timeSet: 0,
	userID: 1,
	from: {
		origin: "manual",
	},
};

export const TestingIIDXFolderSP10: FolderDocument = {
	title: "Level 10",
	game: "iidx",
	playtype: "SP",
	type: "charts",
	folderID: "ed9d8c734447ce67d7135c0067441a98cc81aeaf",
	data: {
		level: "10",
	},
	searchTerms: [],
	inactive: false,
};

export const TestingIIDXSPMilestone: MilestoneDocument = {
	criteria: {
		type: "all",
	},
	desc: "testing milestone",
	game: "iidx",
	playtype: "SP",
	milestoneID: "example_milestone_id",
	name: "Example Milestone",
	milestoneData: [
		{
			title: "Group1",
			desc: "Foo",
			goals: [
				{
					goalID: "eg_goal_1",
				},
				{
					goalID: "eg_goal_2",
				},
			],
		},
		{
			title: "Group2",
			desc: "Bar",
			goals: [
				{
					goalID: "eg_goal_3",
				},
				{
					goalID: "eg_goal_4",
				},
			],
		},
	],
};

let KTDATA_CACHE: { songs: unknown[]; charts: unknown[] } | undefined;

export async function LoadTachiIIDXData() {
	let songs;
	let charts;

	if (KTDATA_CACHE) {
		songs = KTDATA_CACHE.songs;
		charts = KTDATA_CACHE.charts;
	} else {
		songs = GetKTDataJSON("./tachi/tachi-songs-iidx.json");
		charts = GetKTDataJSON("./tachi/tachi-charts-iidx.json");
		KTDATA_CACHE = { songs, charts };
	}

	await db.songs.iidx.remove({});
	await db.songs.iidx.insert(songs);
	await db.charts.iidx.remove({});
	await db.charts.iidx.insert(charts);
}

export const barbScore: BarbatosScore = {
	clear_type: 2,
	did_fail: false,
	difficulty: 1,
	critical: 100,
	error: 5,
	near_total: 50,
	near_fast: 40,
	near_slow: 10,
	gauge_type: 1,
	is_skill_analyzer: false,
	level: 10,
	max_chain: 100,
	percent: 90,
	score: 9_000_000,
	song_id: 1,
};

export const uscChart: ChartDocument<"usc:Controller" | "usc:Keyboard"> = {
	rgcID: null,
	chartID: "USC_CHART_ID",
	difficulty: "NOV",
	songID: 1,
	playtype: "Keyboard",
	levelNum: 1,
	level: "1",
	data: {
		hashSHA1: "USC_CHART_HASH",
		isOfficial: false,
		effector: "foo",
	},
	tierlistInfo: {},
	isPrimary: true,
	versions: [],
};

export const uscScore: USCClientScore = {
	crit: 100,
	error: 5,
	near: 50,
	gauge: 0.8,
	early: 50,
	late: 20,
	combo: 5,
	options: {
		autoFlags: 0,
		gaugeOpt: 0,
		gaugeType: 1,
		mirror: true,
		random: false,
	},
	score: 9_000_000,
	timestamp: 0,
	windows: {
		good: USC_DEFAULT_NEAR,
		perfect: USC_DEFAULT_PERFECT,
		hold: USC_DEFAULT_HOLD,
		miss: USC_DEFAULT_MISS,
		slam: USC_DEFAULT_SLAM,
	},
};
