import dm from "deepmerge";
import db from "external/mongo/db";
import {
	USC_DEFAULT_HOLD,
	USC_DEFAULT_MISS,
	USC_DEFAULT_NEAR,
	USC_DEFAULT_PERFECT,
	USC_DEFAULT_SLAM,
} from "lib/constants/usc-ir";
import { ApplyNTimes, RFA } from "utils/misc";
import fs from "fs";
import path from "path";
import type { DryScore } from "lib/score-import/framework/common/types";
import type { S3Score } from "lib/score-import/import-types/file/solid-state-squad/types";
import type {
	BarbatosScore,
	BarbatosSDVX6Score,
} from "lib/score-import/import-types/ir/barbatos/types";
import type { FervidexScore } from "lib/score-import/import-types/ir/fervidex/types";
import type { KsHookSV6CScore } from "lib/score-import/import-types/ir/kshook-sv6c/types";
import type { LR2HookScore } from "lib/score-import/import-types/ir/lr2hook/types";
import type { USCClientScore } from "server/router/ir/usc/_playtype/types";
import type {
	ChartDocument,
	FolderDocument,
	GoalDocument,
	GoalSubscriptionDocument,
	ImportDocument,
	MilestoneDocument,
	MilestoneSubscriptionDocument,
	NotificationDocument,
	PBScoreDocument,
	PublicUserDocument,
	ScoreDocument,
	SongDocument,
	UGPTSettings,
} from "tachi-common";

const file = (name: string) => path.join(__dirname, "/test-data", name);

export const GetKTDataJSON = (name: string) =>
	JSON.parse(fs.readFileSync(file(name), "utf-8")) as unknown;

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

export const TestingSDVXScore: ScoreDocument<"sdvx:Single"> = {
	service: "foo (DIRECT-MANUAL)",
	game: "sdvx",
	playtype: "Single",
	userID: 1,
	scoreData: {
		score: 786,
		lamp: "CLEAR",
		percent: 50,
		grade: "C",
		esd: 30,
		gradeIndex: 3,
		lampIndex: 4,
		judgements: {},
		hitMeta: {},
	},
	scoreMeta: {},
	calculatedData: {},
	timeAchieved: 1619454485988,
	songID: 1,

	// albida adv
	chartID: "5088a4d0e1ee9d0cc2f625934306e45b1a60699b",
	highlight: false,
	isPrimary: true,
	comment: null,
	timeAdded: 1,
	scoreID: "TESTING_SCORE_SDVX_ID",
	importType: "ir/direct-manual",
};

export const TestingSDVXAlbidaChart: ChartDocument<"sdvx:Single"> = {
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
		aiLevel: "0",
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

export const BMSGazerSong: SongDocument<"bms"> = {
	id: 27339,
	title: "gazer [MANIAQ]",
	artist: "scytheleg / obj.siokaze",
	data: {
		subtitle: null,
		subartist: null,
		genre: "ELECTRANCE",
		tableString: null,
	},
	searchTerms: [],
	altTitles: [],
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
	game: "iidx",
	goalID: "mock_goalID",
	playtype: "SP",
	timeAdded: 0,
	name: "HC 5.1.1. SPA",
	criteria: {
		mode: "single",
		value: 5,
		key: "scoreData.lampIndex",
	},
};

export const HC511UserGoal: GoalSubscriptionDocument = {
	achieved: false,
	wasInstantlyAchieved: false,
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

export const IIDXSPMilestoneGoals: Array<GoalDocument> = [
	dm(HC511Goal, { goalID: "eg_goal_1" }) as GoalDocument,
	dm(HC511Goal, { goalID: "eg_goal_2", criteria: { value: 2 } }),
	dm(HC511Goal, { goalID: "eg_goal_3", criteria: { key: "scoreData.score", value: 300 } }),
	dm(HC511Goal, { goalID: "eg_goal_4", criteria: { key: "scoreData.score", value: 1100 } }),
];

export const IIDXSPMilestoneGoalSubs: Array<GoalSubscriptionDocument> = [
	dm(HC511UserGoal, { goalID: "eg_goal_1" }) as GoalSubscriptionDocument,
	dm(HC511UserGoal, { goalID: "eg_goal_2" }) as GoalSubscriptionDocument,
	dm(HC511UserGoal, { goalID: "eg_goal_3" }) as GoalSubscriptionDocument,
	dm(HC511UserGoal, { goalID: "eg_goal_4" }) as GoalSubscriptionDocument,
];

export const TestingIIDXSPMilestoneSub: MilestoneSubscriptionDocument = {
	userID: 1,
	achieved: false,
	game: "iidx",
	playtype: "SP",
	lastInteraction: null,
	milestoneID: "example_milestone_id",
	progress: 4,
	timeAchieved: null,
	timeSet: 1900,
	wasInstantlyAchieved: false,
};

let KTDATA_CACHE:
	| { songs: Array<SongDocument<"iidx">>; charts: Array<ChartDocument<"iidx:DP" | "iidx:SP">> }
	| undefined;

export async function LoadTachiIIDXData() {
	let songs;
	let charts;

	if (KTDATA_CACHE) {
		songs = KTDATA_CACHE.songs;
		charts = KTDATA_CACHE.charts;
	} else {
		songs = GetKTDataJSON("./tachi/tachi-songs-iidx.json") as Array<SongDocument<"iidx">>;
		charts = GetKTDataJSON("./tachi/tachi-charts-iidx.json") as Array<
			ChartDocument<"iidx:DP" | "iidx:SP">
		>;

		KTDATA_CACHE = { songs, charts };
	}

	await db.songs.iidx.remove({});
	await db.songs.iidx.insert(songs);
	await db.charts.iidx.remove({});
	await db.charts.iidx.insert(charts);
}

export const MockBarbatosScore: BarbatosScore = {
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

export const MockBarbatosSDVX6Score: BarbatosSDVX6Score = {
	clear_type: 2,
	difficulty: 1,
	level: 10,
	max_chain: 100,
	percent: 90,
	score: 9_000_000,
	song_id: 1,

	chip_s_crit: 4,
	chip_crit: 3,
	chip_near: 2,
	chip_error: 1,

	early_crit: 5,
	early_near: 6,
	early_error: 7,

	ex_score: 1234,

	gauge_type: 1,

	grade: "whocares",

	late_crit: 8,
	late_near: 9,
	late_error: 10,

	long_crit: 11,
	long_error: 12,

	s_crit: 13,
	vol_crit: 14,
	vol_error: 15,
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
		tableFolders: [],
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

export const FakeOtherUser: PublicUserDocument = {
	id: 2,
	username: "other_user",
	about: "",
	authLevel: 0,
	badges: [],
	clan: null,
	customBannerLocation: null,
	customPfpLocation: null,
	joinDate: 0,
	lastSeen: 0,
	socialMedia: {},
	status: null,
	usernameLowercase: "other_user",
};

export const FakeGameSettings: UGPTSettings = {
	game: "iidx",
	playtype: "SP",
	preferences: {
		defaultTable: null,
		gameSpecific: {
			bpiTarget: 0,
			display2DXTra: false,
		},
		preferredProfileAlg: null,
		preferredScoreAlg: null,
		preferredSessionAlg: null,
		scoreBucket: null,
		stats: [],
	},
	rivals: [],
	userID: 1,
};

export const FakeImport: ImportDocument = {
	classDeltas: [],
	createdSessions: [],
	errors: [],
	game: "iidx",
	goalInfo: [],
	idStrings: ["iidx:SP"],
	importID: "fake_import",
	importType: "ir/direct-manual",
	milestoneInfo: [],
	playtypes: ["SP"],
	scoreIDs: [TestingIIDXSPScore.scoreID],
	timeFinished: 1000,
	timeStarted: 100,
	userID: 1,
	userIntent: false,
};

export const FakeNotification: NotificationDocument = {
	title: "fake notif",
	notifID: "fake_notif",
	read: false,
	sentAt: 1000,
	sentTo: 1,
	body: {
		type: "MILESTONE_CHANGED",
		content: {
			milestoneID: "a",
		},
	},
};

export const FervidexStaticBase = {
	name: "AIXXE",
	qpro: {
		body: 189,
		face: 138,
		hair: 76,
		hand: 145,
		head: 0,
	},
	scores: {
		"1000": {
			spa: {
				clear_type: 4,
				ex_score: 1180,
				miss_count: 40,
			},
			spn: {
				clear_type: 7,
				ex_score: 158,
				miss_count: 0,
			},
		},
		"1001": {
			dph: {
				clear_type: 3,
				ex_score: 15,
				miss_count: 1,
			},
		},
	},
	sp_dan: 15,
};

export const FervidexBaseScore: FervidexScore = {
	bad: 0,
	chart: "spa",
	clear_type: 1,
	combo_break: 6,
	custom: false,
	chart_sha256: "asdfasdf",
	entry_id: 1000,
	ex_score: 68,
	fast: 0,
	gauge: [100, 50],
	ghost: [0, 2],
	good: 0,
	great: 0,
	max_combo: 34,
	option: {
		gauge: "HARD",
		range: "SUDDEN_PLUS",
		style: "RANDOM",
	},
	pacemaker: {
		name: "",
		score: 363,
		type: "PACEMAKER_A",
	},
	pgreat: 34,
	poor: 6,
	slow: 0,
};

export const FervidexBaseGSMScore: FervidexScore = {
	bad: 0,
	chart: "spa",
	clear_type: 1,
	combo_break: 6,
	dead: {
		measure: 18,
		note: 40,
	},
	entry_id: 1000,
	custom: false,
	chart_sha256: "asdfasdf",
	ex_score: 68,
	fast: 0,
	gauge: [100, 50],
	ghost: [0, 2],
	good: 0,
	great: 0,
	max_combo: 34,
	option: {
		gauge: "HARD",
		range: "SUDDEN_PLUS",
		style: "RANDOM",
	},
	pacemaker: {
		name: "",
		score: 363,
		type: "PACEMAKER_A",
	},
	pgreat: 34,
	poor: 6,
	slow: 0,
	"2dx-gsm": {
		EASY: [0, 10],
		NORMAL: [0, 20],
		HARD: [20, 0],
		EX_HARD: [10, 0],
	},
};

export const MockBeatorajaBMSScore = {
	chart: {
		md5: "38616b85332037cc12924f2ae2840262",
		sha256: "195fe1be5c3e74fccd04dc426e05f8a9cfa8a1059c339d0a23e99f63661f0b7d",
		title: "GAZER [MANIAQ]",
		subtitle: "",
		genre: "TRANCE",
		artist: "the dude who made gazer",
		subartist: "",
		url: "",
		appendurl: "",
		level: 8,
		total: 220,
		mode: "BEAT_7K",
		lntype: 0,
		judge: 100,
		minbpm: 135,
		maxbpm: 135,
		notes: 568,
		hasUndefinedLN: false,
		hasLN: false,
		hasCN: false,
		hasHCN: false,
		hasMine: false,
		hasRandom: false,
		hasStop: false,
		values: {},
	},
	score: {
		sha256: "195fe1be5c3e74fccd04dc426e05f8a9cfa8a1059c339d0a23e99f63661f0b7d",
		lntype: 0,
		player: "unknown",
		clear: "Easy",
		date: 0,
		epg: 332,
		lpg: 127,
		egr: 65,
		lgr: 21,
		egd: 2,
		lgd: 2,
		ebd: 1,
		lbd: 0,
		epr: 7,
		lpr: 11,
		ems: 1,
		lms: 0,
		maxcombo: 223,
		notes: 568,
		passnotes: 568,
		minbp: 20,
		option: 2,
		assist: 0,
		gauge: -1,
		deviceType: "BM_CONTROLLER",
		judgeAlgorithm: "Combo",
		rule: "LR2",
		exscore: 1004,
	},
	client: "LR2oraja 0.8.0",
};

export const MockBeatorajaPMSScore = {
	chart: {
		md5: "d1253dd56bb2087d0b0d474f0d562aae",
		sha256: "a10193f7ae05ce839292dc716f182fda0b1cc6ac5382c2056f37e22ffba87b7d",
		title: "GPMSAZER [MANIAQ]",
		subtitle: "",
		genre: "Annihilate the living",
		artist: "Rocky",
		subartist: "",
		url: "",
		appendurl: "",
		level: 8,
		total: 220,
		mode: "POPN_9K",
		lntype: 0,
		judge: 100,
		minbpm: 135,
		maxbpm: 135,
		notes: 568,
		hasUndefinedLN: false,
		hasLN: false,
		hasCN: false,
		hasHCN: false,
		hasMine: false,
		hasRandom: false,
		hasStop: false,
		values: {},
	},
	score: {
		sha256: "a10193f7ae05ce839292dc716f182fda0b1cc6ac5382c2056f37e22ffba87b7d",
		lntype: 0,
		player: "unknown",
		clear: "Easy",
		date: 0,
		epg: 332,
		lpg: 127,
		egr: 65,
		lgr: 21,
		egd: 2,
		lgd: 2,
		ebd: 1,
		lbd: 0,
		epr: 7,
		lpr: 11,
		ems: 1,
		lms: 0,
		maxcombo: 223,
		notes: 568,
		passnotes: 568,
		minbp: 20,
		option: 2,
		assist: 0,
		gauge: -1,
		deviceType: "BM_CONTROLLER",
		judgeAlgorithm: "Combo",
		rule: "LR2",
		exscore: 1004,
	},
	client: "beatoraja 0.8.0",
};

export const MockParsedS3Score: S3Score = {
	id: 187,
	diff: "A",
	songname: "5.1.1.",
	styles: "7th",
	exscore: 100,
	scorebreakdown: {
		justgreats: 25,
		greats: 50,
		good: 0,
		bad: 0,
		poor: 4,
	},
	mods: {},
	cleartype: "perfect",
	date: "2010-10-19 04:54:22",
};

export const FakeSmallBatchManual = {
	meta: {
		game: "iidx",
		playtype: "SP",
		service: "foobar",
	},
	scores: [
		{
			score: 500,
			lamp: "HARD CLEAR",
			matchType: "songTitle",
			identifier: "5.1.1.",
			difficulty: "ANOTHER",
		},
	],
};

export const FakeChunitachiBatchManual = {
	meta: {
		game: "chunithm",
		playtype: "Single",
		service: "ChunItachi",
	},
	scores: [
		{
			score: 900000,
			lamp: "CLEAR",
			matchType: "songTitle",
			identifier: "B.B.K.K.B.K.K.",
			difficulty: "BASIC",
		},
	],
};
