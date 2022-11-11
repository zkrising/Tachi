import db from "external/mongo/db";
import { GetRelevantSongsAndCharts } from "utils/db";
import { DedupeArr } from "utils/misc";
import { GetGPT } from "utils/req-tachi-data";
import { GetUsersWithIDs } from "utils/user";
import type { Request, Response } from "express-serve-static-core";
import type { FilterQuery } from "mongodb";
import type { ClassAchievementDocument, Game, ScoreDocument, SessionDocument } from "tachi-common";

type ActivityConstraint = FilterQuery<ClassAchievementDocument & ScoreDocument & SessionDocument>;

/**
 * Retrieves recent activity for this group of users for this GPT.
 *
 * At the moment, this retrieves the following events:
 * - Recent Sessions
 * - Recent Highlighted Scores
 * - Achieved Classes
 *
 * It will support:
 * - Recently achieved goals
 * - Recently achieved quests
 *
 * To get the set of things we want to fetch, we fetch the first N sessions we see.
 * This sets our "upper bound" for how far back we want to look -- when the Nth session
 * started.
 *
 * Optionally, startFrom can be passed, which will start this activity search from that
 * point in time.
 */
export async function GetRecentActivity(
	// todo: is it possible to make this game agnostic?
	game: Game,
	query: ActivityConstraint,
	sessions = 30,
	startFrom: number | null = null
) {
	let baseQuery = query;

	if (startFrom !== null) {
		baseQuery = {
			...baseQuery,
			timeStarted: { $lt: startFrom },
		};
	}

	const recentSessions = await db.sessions.find(baseQuery, {
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

	const achievedClasses = await db["class-achievements"].find(
		{
			...baseQuery,
			timeAchieved: timeConstraint,
		},
		{
			sort: {
				timeAchieved: -1,
			},
		}
	);

	const recentlyHighlightedScores = await db.scores.find(
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
	);

	const { songs, charts } = await GetRelevantSongsAndCharts(recentlyHighlightedScores, game);

	const userIDs = DedupeArr([
		...recentSessions.map((e) => e.userID),
		...recentlyHighlightedScores.map((e) => e.userID),
		...achievedClasses.map((e) => e.userID),
	]);

	const users = await GetUsersWithIDs(userIDs);

	return {
		recentSessions,
		recentlyHighlightedScores,
		songs,
		charts,
		achievedClasses,
		users,
	};
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
