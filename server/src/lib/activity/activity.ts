import db from "external/mongo/db";
import {
	GetRecentlyAchievedGoals,
	GetRecentlyAchievedQuests,
	GetRelevantSongsAndCharts,
} from "utils/db";
import { DedupeArr } from "utils/misc";
import { GetGPT } from "utils/req-tachi-data";
import { GetUsersWithIDs } from "utils/user";
import type { Request, Response } from "express-serve-static-core";
import type { FilterQuery } from "mongodb";
import type {
	ChartDocument,
	ClassAchievementDocument,
	Game,
	GoalDocument,
	GoalSubscriptionDocument,
	IDStrings,
	Playtype,
	QuestDocument,
	QuestSubscriptionDocument,
	ScoreDocument,
	SessionDocument,
	SongDocument,
	UserDocument,
} from "tachi-common";

export type ActivityConstraint = FilterQuery<
	ClassAchievementDocument & ScoreDocument & SessionDocument
>;

/**
 * Retrieves recent activity for this group of users for this GPT.
 *
 * At the moment, this retrieves the following events:
 * - Recent Sessions
 * - Recent Highlighted Scores
 * - Achieved Classes
 * - Recently achieved goals
 * - Recently achieved quests
 *
 * To get the set of things we want to fetch, we fetch the first N sessions we see.
 * This sets our "upper bound" for how far back we want to look -- when the Nth session
 * started.
 *
 * Optionally, startFrom can be passed, which will start this activity search from that
 * point in time.
 *
 * @bug - With the way `startFrom` works, its possible to "skip over" sessions that have
 * the **exact** same timestamp, but didn't fall into the previous limit.
 *
 * for an array of imagined timestamps with sessions=3, followed by startFrom=3
 * i.e. [1, 2, 3] 3, 3, 3 [4, 5, 6]
 */
export async function GetRecentActivity(
	game: Game,
	query: ActivityConstraint,
	sessions = 30,
	startFrom: number | null = null
): Promise<{
	recentSessions: Array<SessionDocument>;
	recentlyHighlightedScores: Array<ScoreDocument>;
	songs: Array<SongDocument>;
	charts: Array<ChartDocument>;
	achievedClasses: Array<ClassAchievementDocument>;
	users: Array<UserDocument>;
	goals: Array<GoalDocument>;
	goalSubs: Array<GoalSubscriptionDocument>;
	quests: Array<QuestDocument>;
	questSubs: Array<QuestSubscriptionDocument>;
}> {
	const baseQuery = query;

	const initialSessionQuery = {
		...baseQuery,

		// start from anytime if startFrom is omitted, otherwise, cap at the start.
		timeStarted: { $lt: startFrom === null ? Infinity : startFrom },
	};

	const recentSessions = await db.sessions.find(initialSessionQuery, {
		sort: {
			timeStarted: -1,
		},
		limit: sessions,
	});

	// find the earliest point in the sessions we just fetched.
	// if we found no sessions, set this to now, which means we'll fetch no highlighted
	// scores.
	// (it's not possible to have no sessions *and* have scores with timestamps)
	const earliestSession = recentSessions.at(-1)?.timeStarted ?? Date.now();

	const timeConstraint =
		startFrom !== null
			? { $lt: startFrom, $gte: earliestSession }
			: {
					$gte: earliestSession,
			  };

	const [
		// yeah, i hate doing stuff like this in parallel. It's really easy to get
		// wrong, but this code is hit so frequently that I'd be insane not to take
		// the performance win of parallelism in queries.
		achievedClasses,
		recentlyHighlightedScores,
		{ goals, goalSubs },
		{ quests, questSubs },
	] = await Promise.all([
		db["class-achievements"].find(
			{
				...baseQuery,
				timeAchieved: timeConstraint,
			},
			{
				sort: {
					timeAchieved: -1,
				},
			}
		),
		db.scores.find(
			{
				...baseQuery,
				highlight: true,
				timeAchieved: timeConstraint,
			},
			{
				sort: {
					timeAchieved: -1,
				},
			}
		),
		GetRecentlyAchievedGoals({ ...baseQuery, timeAchieved: timeConstraint }, 0),
		GetRecentlyAchievedQuests({ ...baseQuery, timeAchieved: timeConstraint }, 0),
	]);

	const { songs, charts } = await GetRelevantSongsAndCharts(recentlyHighlightedScores, game);

	const userIDs = DedupeArr([
		...recentSessions.map((e) => e.userID),
		...recentlyHighlightedScores.map((e) => e.userID),
		...achievedClasses.map((e) => e.userID),
		...goalSubs.map((e) => e.userID),
		...questSubs.map((e) => e.userID),
	]);

	const users = await GetUsersWithIDs(userIDs);

	return {
		recentSessions,
		recentlyHighlightedScores,
		songs,
		charts,
		achievedClasses,
		users,
		goals,
		goalSubs,
		quests,
		questSubs,
	};
}

/**
 * @see {GetRecentActivity}, but for multiple games. Works pretty much as expected.
 *
 * @param gpts - An array of Game+Playtype combos to fetch from.
 */
export async function GetRecentActivityForMultipleGames(
	gpts: Array<{ game: Game; playtype: Playtype; query: ActivityConstraint }>,
	sessions = 30,
	startFrom: number | null = null
) {
	// { "iidx:SP": {recentSessions: ..., ...} }
	const data: Partial<Record<IDStrings, Awaited<ReturnType<typeof GetRecentActivity>>>> = {};

	await Promise.all(
		gpts.map(async ({ game, playtype }) => {
			const activity = await GetRecentActivity(
				game,
				{
					game,
					playtype,
				},
				sessions,
				startFrom
			);

			data[`${game}:${playtype}` as IDStrings] = activity;
		})
	);

	// depressingly, we have to discard most of this data for sorting reasons
	// because not all sessions are guaranteed to be in the same order
	// it's possible for, say, a really old jubeat session to push the "oldest session"
	// very far back, resulting in us skipping over data.

	const flatPointer = Object.entries(data) as Array<
		[IDStrings, { recentSessions: Array<SessionDocument> }]
	>;

	// sort all games data to find the Nth session (where we should set our cutoff).
	const sessionTimes = flatPointer
		.flatMap((e) => e[1].recentSessions.map((e) => e.timeEnded))
		.sort((a, b) => b - a);

	const stop = sessionTimes[sessions] ?? -Infinity;

	for (const value of Object.values(data)) {
		// remove all data that happened before the stop point.
		value.achievedClasses = value.achievedClasses.filter((e) => e.timeAchieved > stop);
		value.goalSubs = value.goalSubs.filter(
			(e) => e.timeAchieved !== null && e.timeAchieved > stop
		);
		value.questSubs = value.questSubs.filter(
			(e) => e.timeAchieved !== null && e.timeAchieved > stop
		);
		value.recentSessions = value.recentSessions.filter((e) => e.timeEnded > stop);
		value.recentlyHighlightedScores = value.recentlyHighlightedScores.filter(
			(e) => e.timeAchieved !== null && e.timeAchieved > stop
		);
	}

	return data;
}

/**
 * Utility for creating an express handler for activity-related endpoints. These endpoints
 * are all *remarkably* similar, but with slightly different initial constraints.
 *
 * This creates a function that you should call inside another route.
 */
export function CreateActivityRouteHandler(query: ActivityConstraint) {
	return async (req: Request, res: Response) => {
		const { game } = GetGPT(req);

		const qSessions = req.query.sessions;
		const qStartTime = req.query.startTime;

		if (qSessions !== undefined && typeof qSessions !== "string") {
			return res.status(400).json({
				success: false,
				description: `Invalid 'sessions'.`,
			});
		}

		if (qStartTime !== undefined && typeof qStartTime !== "string") {
			return res.status(400).json({
				success: false,
				description: `Invalid 'startTime'.`,
			});
		}

		// defaulting to 30 seems sensible.
		const sessions = qSessions ? Number(qSessions) : 30;

		if (sessions > 100 || sessions < 10 || Number.isNaN(sessions)) {
			return res.status(400).json({
				success: false,
				description: `Invalid sessions, got ${sessions}, which wasn't between 10 and 100.`,
			});
		}

		const startTime = qStartTime ? Number(qStartTime) : null;

		if (Number.isNaN(startTime)) {
			return res.status(400).json({
				success: false,
				description: `Invalid startTime, got a non number.`,
			});
		}

		const recentActivity = await GetRecentActivity(game, query, sessions, startTime);

		return res.status(200).json({
			success: true,
			description: `Retrieved activity.`,
			body: recentActivity,
		});
	};
}
