import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { FormatChart } from "tachi-common";
import type { FilterQuery } from "mongodb";
import type {
	Game,
	GoalDocument,
	GoalSubscriptionDocument,
	integer,
	QuestDocument,
	QuestlineDocument,
	QuestSubscriptionDocument,
	PBScoreDocument,
	ScoreDocument,
} from "tachi-common";

const logger = CreateLogCtx(__filename);

export async function GetNextCounterValue(counterName: string): Promise<integer> {
	const sequenceDoc = await db.counters.findOneAndUpdate(
		{
			counterName,
		},
		{
			$inc: {
				value: 1,
			},
		},
		{
			// this is marked as deprecated, but it shouldn't be, as returnDocument: "before"
			// does nothing.
			returnOriginal: true,
		}
	);

	if (!sequenceDoc) {
		logger.error(`Could not find sequence document for ${counterName}`);
		throw new Error(`Could not find sequence document for ${counterName}.`);
	}

	return sequenceDoc.value;
}

export async function DecrementCounterValue(counterName: string): Promise<integer> {
	logger.verbose(`Decrementing Counter Value ${counterName}.`);

	const sequenceDoc = await db.counters.findOneAndUpdate(
		{
			counterName,
		},
		{
			$inc: {
				value: -1,
			},
		},
		{
			returnOriginal: false,
		}
	);

	if (!sequenceDoc) {
		logger.error(`Could not find sequence document for ${counterName}`);
		throw new Error(`Could not find sequence document for ${counterName}.`);
	}

	return sequenceDoc.value;
}

export async function GetRelevantSongsAndCharts(
	scores: Array<PBScoreDocument | ScoreDocument>,
	game: Game
) {
	const [songs, charts] = await Promise.all([
		db.songs[game].find({
			id: { $in: scores.map((e) => e.songID) },
		}),
		db.charts[game].find({
			chartID: { $in: scores.map((e) => e.chartID) },
		}),
	]);

	return { songs, charts };
}

export async function UpdateGameSongIDCounter(game: "bms" | "pms") {
	const latestSong = await db.songs[game].findOne(
		{},
		{
			sort: { id: -1 },
			projection: { id: 1 },
		}
	);

	if (!latestSong) {
		logger.warn(
			`No ${game} charts loaded, yet BMS sync was attempted? This was probably an initial setup, starting songIDs from 1.`
		);
	}

	const largestSongID = latestSong?.id ?? 0;

	await db.counters.update(
		{
			counterName: `${game}-song-id`,
		},
		{
			$set: {
				value: largestSongID + 1,
			},
		}
	);
}

export async function GetChartForIDGuaranteed(game: Game, chartID: string) {
	const chart = await db.charts[game].findOne({ chartID });

	if (!chart) {
		throw new Error(`Couldn't find chart with ID ${chartID} (${game}).`);
	}

	return chart;
}

export async function GetSongForIDGuaranteed(game: Game, songID: integer) {
	const song = await db.songs[game].findOne({ id: songID });

	if (!song) {
		throw new Error(`Couldn't find song with ID ${songID} (${game}).`);
	}

	return song;
}

export async function GetFolderForIDGuaranteed(folderID: string) {
	const folder = await db.folders.findOne({ folderID });

	if (!folder) {
		throw new Error(`Couldn't find folder with ID ${folderID}.`);
	}

	return folder;
}

export async function GetGoalForIDGuaranteed(goalID: string) {
	const goal = await db.goals.findOne({ goalID });

	if (!goal) {
		throw new Error(`Couldn't find goal with ID ${goalID}`);
	}

	return goal;
}

export async function GetQuestForIDGuaranteed(questID: string) {
	const quest = await db.quests.findOne({ questID });

	if (!quest) {
		throw new Error(`Couldn't find quest with ID ${questID}`);
	}

	return quest;
}

export async function HumaniseChartID(game: Game, chartID: string) {
	const chart = await GetChartForIDGuaranteed(game, chartID);
	const song = await GetSongForIDGuaranteed(game, chart.songID);

	return FormatChart(game, song, chart);
}

/**
 * Get recently achieved goals for this query.
 *
 * @param baseQuery - A base query, used to limit results on GPTs or UGPTs.
 * @param limit - How many recently achieved goals to search for.
 * @returns - The goals and their subs.
 */
export async function GetRecentlyAchievedGoals(
	baseQuery: Omit<FilterQuery<GoalSubscriptionDocument>, "achieved">,
	limit = 100
) {
	const query: FilterQuery<GoalSubscriptionDocument> = {
		...baseQuery,
		wasInstantlyAchieved: false,
		achieved: true,
	};

	const goalSubs = await db["goal-subs"].find(query, {
		sort: {
			timeAchieved: -1,
		},
		limit,
	});

	const goals = await db.goals.find({
		goalID: { $in: goalSubs.map((e) => e.goalID) },
	});

	if (goals.length !== goalSubs.length) {
		logger.error(
			`Found ${goals.length} goals when looking for parents of ${goalSubs.length} subscriptions. This mismatch implies a state desync.`
		);

		throw new Error("Failed to fetch goals.");
	}

	return { goals, goalSubs };
}

/**
 * Get recently interacted-with goals for this query.
 *
 * @param baseQuery - A base query, used to limit results on GPTs or UGPTs.
 * @param limit - How many recently achieved goals to search for.
 * @returns - The goals and their subs.
 */
export async function GetRecentlyInteractedGoals(
	baseQuery: Omit<FilterQuery<GoalSubscriptionDocument>, "achieved">,
	limit = 100
) {
	const query = {
		...baseQuery,
		wasInstantlyAchieved: false,
		achieved: false,
		lastInteraction: { $ne: null },
	};

	const goalSubs = await db["goal-subs"].find(query, {
		sort: {
			lastInteraction: -1,
		},
		limit,
	});

	const goals = await db.goals.find({
		goalID: { $in: goalSubs.map((e) => e.goalID) },
	});

	if (goals.length !== goalSubs.length) {
		logger.error(
			`Found ${goals.length} goals when looking for parents of ${goalSubs.length} subscriptions. This mismatch implies a state desync.`
		);

		throw new Error("Failed to fetch goals.");
	}

	return { goals, goalSubs };
}

/**
 * Get recently achieved quests for this query.
 *
 * @param baseQuery - A base query, used to limit results on GPTs or UGPTs.
 * @param limit - How many recently achieved goals to search for.
 * @returns - The quests and their subs.
 */
export async function GetRecentlyAchievedQuests(
	baseQuery: Omit<FilterQuery<QuestSubscriptionDocument>, "achieved">,
	limit = 100
) {
	const query = {
		...baseQuery,
		wasInstantlyAchieved: false,
		achieved: true,
	};

	const questSubs = await db["quest-subs"].find(query, {
		sort: {
			timeAchieved: -1,
		},
		limit,
	});

	const quests = await db.quests.find({
		questID: { $in: questSubs.map((e) => e.questID) },
	});

	if (quests.length !== questSubs.length) {
		logger.error(
			`Found ${quests.length} quests when looking for parents of ${questSubs.length} subscriptions. This mismatch implies a state desync.`
		);

		throw new Error("Failed to fetch quests.");
	}

	return { quests, questSubs };
}

/**
 * Get recently interacted-with quests for this query.
 *
 * @param baseQuery - A base query, used to limit results on GPTs or UGPTs.
 * @param limit - How many recently achieved quests to search for.
 * @returns - The quests and their subs.
 */
export async function GetRecentlyInteractedQuests(
	baseQuery: Omit<FilterQuery<QuestSubscriptionDocument>, "achieved">,
	limit = 100
) {
	const query = {
		...baseQuery,
		lastInteraction: { $ne: null },
		achieved: false,
		wasInstantlyAchieved: false,
	};

	const questSubs = await db["quest-subs"].find(query, {
		sort: {
			lastInteraction: -1,
		},
		limit,
	});

	const quests = await db.quests.find({
		questID: { $in: questSubs.map((e) => e.questID) },
	});

	if (quests.length !== questSubs.length) {
		logger.error(
			`Found ${quests.length} quests when looking for parents of ${questSubs.length} subscriptions. This mismatch implies a state desync.`
		);

		throw new Error("Failed to fetch quests.");
	}

	return { quests, questSubs };
}

export async function GetMostSubscribedGoals(
	query: FilterQuery<GoalSubscriptionDocument>,
	limit = 100
): Promise<Array<GoalDocument & { __subscriptions: integer }>> {
	const mostSubscribedGoals: Array<{ goal: GoalDocument; subscriptions: integer }> = await db[
		"goal-subs"
	].aggregate([
		{
			$match: query,
		},
		{
			$group: {
				_id: "$goalID",
				subscriptions: { $sum: 1 },
			},
		},
		{
			$sort: {
				subscriptions: -1,
			},
		},
		{
			$limit: limit,
		},
		{
			$lookup: {
				from: "goals",
				localField: "_id",
				foreignField: "goalID",
				as: "goal",
			},
		},
		{
			$set: {
				goal: { $arrayElemAt: ["$goal", 0] },
			},
		},
		{
			$unset: "goal._id",
		},
	]);

	return mostSubscribedGoals.map((e) => ({
		__subscriptions: e.subscriptions,
		...e.goal,
	}));
}

export async function GetMostSubscribedQuests(
	query: FilterQuery<QuestSubscriptionDocument>,
	limit = 100
): Promise<Array<QuestDocument & { __subscriptions: integer }>> {
	const mostSubscribedQuests: Array<QuestDocument & { subscriptions: integer }> =
		await db.quests.aggregate([
			{
				$match: query,
			},
			{
				$lookup: {
					from: "quest-subs",
					localField: "questID",
					foreignField: "questID",
					as: "subs",
				},
			},
			{
				$addFields: {
					subscriptions: { $size: "$subs" },
				},
			},
			{
				$unset: "subs",
			},
			{
				$sort: {
					subscriptions: -1,
				},
			},
			{
				$limit: limit,
			},
		]);

	return mostSubscribedQuests.map((e) => ({
		...e,
		__subscriptions: e.subscriptions,
	}));
}

export async function GetChildQuests(questline: QuestlineDocument) {
	const quests = await db.quests.find({
		questID: { $in: questline.quests },
	});

	if (quests.length !== questline.quests.length) {
		logger.warn(
			`Expected to find ${questline.quests.length} quests in the database, but only found ${quests.length}.`,
			{ questline }
		);
	}

	return quests;
}
