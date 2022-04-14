import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { FilterQuery } from "mongodb";
import {
	FormatChart,
	Game,
	GoalDocument,
	GoalSubscriptionDocument,
	integer,
	MilestoneDocument,
	MilestoneSetDocument,
	MilestoneSubscriptionDocument,
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
	scores: (ScoreDocument | PBScoreDocument)[],
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
	const largestSongID = await db.songs[game].findOne(
		{},
		{
			sort: { id: -1 },
			projection: { id: 1 },
		}
	);

	if (!largestSongID) {
		logger.severe(
			`No ${game} charts loaded, yet BMS sync was attempted? Lost state on ${game}-song-id counter. Panicking.`
		);
		throw new Error(`No BMS charts loaded, yet BMS sync was attempted.`);
	}

	await db.counters.update(
		{
			counterName: `${game}-song-id`,
		},
		{
			$set: {
				value: largestSongID.id + 1,
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

export async function GetMilestoneForIDGuaranteed(milestoneID: string) {
	const milestone = await db.milestones.findOne({ milestoneID });

	if (!milestone) {
		throw new Error(`Couldn't find milestone with ID ${milestoneID}`);
	}

	return milestone;
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
	baseQuery: FilterQuery<GoalSubscriptionDocument>,
	limit = 100
) {
	const query = Object.assign(
		{
			wasInstantlyAchieved: false,
			achieved: true,
		},
		baseQuery
	);

	const goalSubs = await db["goal-subs"].find(query, {
		sort: {
			timeAchieved: -1,
		},
		limit,
	});

	const goals = await db.goals.find({
		goalID: { $in: goalSubs.map((e) => e.goalID) },
	});

	if (goals.length !== goals.length) {
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
	baseQuery: FilterQuery<GoalSubscriptionDocument>,
	limit = 100
) {
	const query = Object.assign(
		{
			wasInstantlyAchieved: false,
			achieved: false,
			lastInteraction: { $ne: null },
		},
		baseQuery
	);

	const goalSubs = await db["goal-subs"].find(query, {
		sort: {
			lastInteraction: -1,
		},
		limit,
	});

	const goals = await db.goals.find({
		goalID: { $in: goalSubs.map((e) => e.goalID) },
	});

	if (goals.length !== goals.length) {
		logger.error(
			`Found ${goals.length} goals when looking for parents of ${goalSubs.length} subscriptions. This mismatch implies a state desync.`
		);

		throw new Error("Failed to fetch goals.");
	}

	return { goals, goalSubs };
}

/**
 * Get recently achieved goals for this query.
 *
 * @param baseQuery - A base query, used to limit results on GPTs or UGPTs.
 * @param limit - How many recently achieved goals to search for.
 * @returns - The goals and their subs.
 */
export async function GetRecentlyAchievedMilestones(
	baseQuery: FilterQuery<MilestoneSubscriptionDocument>,
	limit = 100
) {
	const query = Object.assign(
		{
			wasInstantlyAchieved: false,
			achieved: true,
		},
		baseQuery
	);

	const milestoneSubs = await db["milestone-subs"].find(query, {
		sort: {
			timeAchieved: -1,
		},
		limit,
	});

	const milestones = await db.milestones.find({
		milestoneID: { $in: milestoneSubs.map((e) => e.milestoneID) },
	});

	if (milestones.length !== milestoneSubs.length) {
		logger.error(
			`Found ${milestones.length} milestones when looking for parents of ${milestoneSubs.length} subscriptions. This mismatch implies a state desync.`
		);

		throw new Error("Failed to fetch milestones.");
	}

	return { milestones, milestoneSubs };
}

/**
 * Get recently interacted-with milestones for this query.
 *
 * @param baseQuery - A base query, used to limit results on GPTs or UGPTs.
 * @param limit - How many recently achieved milestones to search for.
 * @returns - The milestones and their subs.
 */
export async function GetRecentlyInteractedMilestones(
	baseQuery: FilterQuery<MilestoneSubscriptionDocument>,
	limit = 100
) {
	const query = Object.assign(
		{
			lastInteraction: { $ne: null },
			achieved: false,
			wasInstantlyAchieved: false,
		},
		baseQuery
	);

	const milestoneSubs = await db["milestone-subs"].find(query, {
		sort: {
			lastInteraction: -1,
		},
		limit,
	});

	const milestones = await db.milestones.find({
		milestoneID: { $in: milestoneSubs.map((e) => e.milestoneID) },
	});

	if (milestones.length !== milestoneSubs.length) {
		logger.error(
			`Found ${milestones.length} milestones when looking for parents of ${milestoneSubs.length} subscriptions. This mismatch implies a state desync.`
		);

		throw new Error("Failed to fetch milestones.");
	}

	return { milestones, milestoneSubs };
}

export async function GetMostSubscribedGoals(
	query: FilterQuery<GoalSubscriptionDocument>,
	limit = 100
): Promise<(GoalDocument & { __subscriptions: integer })[]> {
	const mostSubscribedGoals = (await db["goal-subs"].aggregate([
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
	])) as { goal: GoalDocument; subscriptions: integer }[];

	return mostSubscribedGoals.map((e) => ({
		__subscriptions: e.subscriptions,
		...e.goal,
	}));
}

export async function GetMostSubscribedMilestones(
	query: FilterQuery<MilestoneSubscriptionDocument>,
	limit = 100
): Promise<(MilestoneDocument & { __subscriptions: integer })[]> {
	const mostSubscribedMilesones = (await db["milestone-subs"].aggregate([
		{
			$match: query,
		},
		{
			$group: {
				_id: "$milestoneID",
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
				from: "milestones",
				localField: "_id",
				foreignField: "milestoneID",
				as: "milestone",
			},
		},
	])) as { milestone: MilestoneDocument; subscriptions: integer }[];

	return mostSubscribedMilesones.map((e) => ({
		__subscriptions: e.subscriptions,
		...e.milestone,
	}));
}

export async function GetChildMilestones(milestoneSet: MilestoneSetDocument) {
	const milestones = await db.milestones.find({
		milestoneID: { $in: milestoneSet.milestones },
	});

	if (milestones.length !== milestoneSet.milestones.length) {
		logger.error(
			`Expected to find ${milestoneSet.milestones.length} milestones in the database, but only found ${milestones.length}.`,
			{ milestoneSet }
		);
		throw new Error(`Failed to retrieve milestone sets' children.`);
	}

	return milestones;
}
