import db from "external/mongo/db";
import { GetRelevantSongsAndCharts } from "utils/db";
import { GetUsersWithIDs } from "utils/user";
import type { Game, integer, Playtype } from "tachi-common";

/**
 * Retrieves recent activity for this group of users for this GPT.
 *
 * At the moment, this retrieves the following events:
 * - Recent Sessions
 * - Recent Highlighted Scores
 *
 * It will support:
 * - Recently achieved goals
 * - Recently achieved quests
 */
export async function GetRecentActivity(
	userIDs: Array<integer>,
	game: Game,
	playtype: Playtype,
	sessions = 30
) {
	const recentSessions = await db.sessions.find(
		{
			userID: { $in: userIDs },
			game,
			playtype,
		},
		{
			sort: {
				timeStarted: -1,
			},
			limit: sessions,
		}
	);

	// find the earliest point in the sessions we just fetched.
	// if we found no sessions, set this to now, which means we'll fetch no highlighted
	// scores.
	// (it's not possible to have no sessions *and* have scores with timestamps)
	const earliestSession = recentSessions.at(-1)?.timeStarted ?? Date.now();

	const recentlyHighlightedScores = await db.scores.find(
		{
			userID: { $in: userIDs },
			game,
			playtype,
			highlight: true,
			timeAchieved: { $gte: earliestSession },
		},
		{
			sort: {
				timeAchieved: -1,
			},
		}
	);

	const { songs, charts } = await GetRelevantSongsAndCharts(recentlyHighlightedScores, game);

	const users = await GetUsersWithIDs(userIDs);

	return {
		recentSessions,
		recentlyHighlightedScores,
		songs,
		charts,
		users,
	};
}
