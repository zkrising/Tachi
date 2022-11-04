import {
	FakeGameSettings,
	FakeImport,
	FakeNotification,
	FakeOtherUser,
	HC511Goal,
	HC511UserGoal,
	TestingIIDXSPScore,
	TestingIIDXSPScorePB,
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
	PublicUserDocument,
	ScoreDocument,
	UGPTSettings,
	UserGameStats,
} from "tachi-common";

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
export function dmf<T extends object>(base: T, modifant: Partial<T>): T {
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
export function mkFakeUser(userID: integer, modifant: Partial<PublicUserDocument> = {}) {
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
	modifant: Partial<UGPTSettings> = {}
) {
	return dmf(FakeGameSettings, {
		userID,
		game,
		playtype,
		...modifant,
	});
}

export function mkFakeImport(modifant: Partial<ImportDocument> = {}) {
	return dmf(FakeImport, modifant);
}

export function mkFakeScoreIIDXSP(modifant: Partial<ScoreDocument<"iidx:SP">> = {}) {
	return dmf(TestingIIDXSPScore, modifant);
}

export function mkFakeScoreSDVX(modifant: Partial<ScoreDocument<"sdvx:Single">> = {}) {
	return dmf(TestingSDVXScore, modifant);
}

export function mkFakePBIIDXSP(modifant: Partial<PBScoreDocument<"iidx:SP">> = {}) {
	return dmf(TestingIIDXSPScorePB, modifant);
}

export function mkFakeNotification(modifant: Partial<NotificationDocument> = {}) {
	return dmf(FakeNotification, modifant);
}

export function mkFakeGoal(modifant: Partial<GoalDocument> = {}) {
	return dmf(HC511Goal, modifant);
}

export function mkFakeGoalSub(modifant: Partial<GoalSubscriptionDocument> = {}) {
	return dmf(HC511UserGoal, modifant);
}

export function mkFakeGameStats(userID: integer, modifant: Partial<UserGameStats> = {}) {
	return dmf(
		{
			userID,
			game: "iidx",
			playtype: "SP",
			classes: {},
			ratings: {},
		},
		modifant
	);
}

export function mkFakeSDVXChart(
	chartID: string,
	modifant: Partial<ChartDocument<"sdvx:Single">> = {}
) {
	return dmf(TestingSDVXAlbidaChart, {
		chartID,
		...modifant,
	});
}

export function mkFakeSDVXPB(modifant: Partial<PBScoreDocument<"sdvx:Single">> = {}) {
	return dmf(TestingSDVXPB, modifant);
}
