import db from "external/mongo/db";
import { ONE_MONTH } from "lib/constants/time";
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
	timespan = ONE_MONTH
) {
	// by default, limit to only things that happened in the past 31 days.
	const RECENT = Date.now() - timespan;

	const recentlyHighlightedScores = await db.scores.find(
		{
			userID: { $in: userIDs },
			game,
			playtype,
			highlight: true,
			timeAchieved: { $gte: RECENT },
		},
		{
			sort: {
				timeAchieved: -1,
			},
		}
	);

	const { songs, charts } = await GetRelevantSongsAndCharts(recentlyHighlightedScores, game);

	const recentSessions = await db.sessions.find(
		{
			userID: { $in: userIDs },
			game,
			playtype,
			timeStarted: { $gte: RECENT },
		},
		{
			sort: {
				timeAchieved: -1,
			},
		}
	);

	const users = await GetUsersWithIDs(userIDs);

	return {
		recentSessions,
		recentlyHighlightedScores,
		songs,
		charts,
		users,
	};
}
