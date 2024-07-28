import {
	FakeGameSettings,
	FakeImport,
	FakeNotification,
	FakeOtherUser,
	HC511Goal,
	HC511UserGoal,
	TestingDDRSPScorePB,
	TestingIIDXSPScore,
	TestingIIDXSPScorePB,
	TestingJubeatPB,
	TestingSDVXAlbidaChart,
	TestingSDVXPB,
	TestingSDVXScore,
} from "./test-data";
import deepmerge from "deepmerge";
import type {
	ChartDocument,
	Game,
	GoalDocument,
	GoalSubscriptionDocument,
	ImportDocument,
	integer,
	NotificationDocument,
	PBScoreDocument,
	Playtype,
	UserDocument,
	ScoreDocument,
	UGPTSettingsDocument,
	UserGameStats,
	GPTString,
	ScoreData,
} from "tachi-common";
import type { DeepPartial } from "utils/types";

/**
 * Async Generator To Array
 */
export async function agta(ag: AsyncIterable<unknown> | Iterable<unknown>) {
	const a = [];

	for await (const el of ag) {
		a.push(el);
	}

	return a;
}

/**
 * Deep-modify an object. This is a wrapper around deepmerge that returns proper types.
 */
export function dmf<T extends object>(base: T, modifant: DeepPartial<T>): T {
	// @ts-expect-error LOLDEEPMERGETYPES
	return deepmerge(base, modifant, {
		// The new array should replace the former one, instead of joining them together.
		arrayMerge: (originalArray, newArray) => newArray as Array<unknown>,
	});
}

/**
 * Make a fake user for testing. This automatically sets the username to something
 * unique (to avoid index collisions)
 *
 * @param userID - The userID this fake user should have.
 */
export function mkFakeUser(userID: integer, modifant: DeepPartial<UserDocument> = {}) {
	return dmf(FakeOtherUser, {
		id: userID,
		username: `user${userID}`,
		usernameLowercase: `user${userID}`,
		...modifant,
	});
}

export function mkFakeGameSettings(
	userID: integer,
	game: Game,
	playtype: Playtype,
	modifant: DeepPartial<UGPTSettingsDocument> = {}
) {
	return dmf(FakeGameSettings, {
		userID,
		game,
		playtype,
		...modifant,
	});
}

export function mkFakeImport(modifant: DeepPartial<ImportDocument> = {}) {
	return dmf(FakeImport, modifant);
}

export function mkFakeScoreIIDXSP(modifant: DeepPartial<ScoreDocument<"iidx:SP">> = {}) {
	return dmf(TestingIIDXSPScore, modifant);
}

export function mkFakeScoreSDVX(modifant: DeepPartial<ScoreDocument<"sdvx:Single">> = {}) {
	return dmf(TestingSDVXScore, modifant);
}

export function mkFakePBIIDXSP(modifant: DeepPartial<PBScoreDocument<"iidx:SP">> = {}) {
	return dmf(TestingIIDXSPScorePB, modifant);
}

export function mkFakePBDDRSP(modifant: DeepPartial<PBScoreDocument<"ddr:SP">> = {}) {
	return dmf(TestingDDRSPScorePB, modifant);
}

export function mkFakePBJubeat(modifant: DeepPartial<PBScoreDocument<"jubeat:Single">> = {}) {
	return dmf(TestingJubeatPB, modifant);
}

export function mkFakeNotification(modifant: DeepPartial<NotificationDocument> = {}) {
	return dmf(FakeNotification, modifant);
}

export function mkFakeGoal(modifant: DeepPartial<GoalDocument> = {}) {
	return dmf(HC511Goal, modifant);
}

export function mkFakeGoalSub(modifant: DeepPartial<GoalSubscriptionDocument> = {}) {
	return dmf(HC511UserGoal, modifant);
}

export function mkFakeGameStats(
	userID: integer,
	modifant: DeepPartial<UserGameStats> = {}
): UserGameStats {
	return dmf(
		{
			userID,
			game: "iidx",
			playtype: "SP",
			classes: {},
			ratings: {},
		},
		// @ts-expect-error idk lol types
		modifant
	);
}

export function mkFakeSDVXChart(
	chartID: string,
	modifant: DeepPartial<ChartDocument<"sdvx:Single">> = {}
) {
	return dmf(TestingSDVXAlbidaChart, {
		chartID,
		...modifant,
	});
}

export function mkFakeSDVXPB(modifant: DeepPartial<PBScoreDocument<"sdvx:Single">> = {}) {
	return dmf(TestingSDVXPB, modifant);
}

export function mkMockPB<GPT extends GPTString>(
	game: Game,
	playtype: Playtype,
	chart: ChartDocument<GPT>,
	scoreData: ScoreData<GPT>
): PBScoreDocument<GPT> {
	return {
		userID: 1,
		composedFrom: [{ name: "Best Percent", scoreID: `TEST_${game}:${playtype}_SCORE` }],
		game,
		playtype,
		highlight: false,
		isPrimary: true,
		rankingData: { outOf: 1, rank: 1, rivalRank: null },
		songID: chart.songID,
		chartID: chart.chartID,
		calculatedData: {},
		scoreData,
		timeAchieved: null,
	};
}

export function mkMockScore<GPT extends GPTString>(
	game: Game,
	playtype: Playtype,
	chart: ChartDocument<GPT>,
	scoreData: ScoreData<GPT>
): ScoreDocument<GPT> {
	// @ts-expect-error whatever lol
	return {
		userID: 1,
		game,
		playtype,
		highlight: false,
		isPrimary: true,
		songID: chart.songID,
		chartID: chart.chartID,
		calculatedData: {},
		scoreData,
		timeAchieved: null,
		comment: null,
		importType: null,
		scoreID: `TEST_${game}:${playtype}_SCORE`,
		scoreMeta: {},
		service: "TESTING",
		timeAdded: 1,
	};
}
