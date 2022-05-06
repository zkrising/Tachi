import db from "external/mongo/db";
import { Playtypes } from "tachi-common";
import { UpdateAllPBs } from "utils/calculations/recalc-scores";
import type { integer, Game, Playtype } from "tachi-common";

/**
 * Completely resets a UGPT profile.
 *
 * This function is dangerous! Should only be ran by admins.
 */
export default async function DestroyUserGamePlaytypeData(
	userID: integer,
	game: Game,
	playtype: Playtype
) {
	await db["game-stats-snapshots"].remove({
		userID,
		game,
		playtype,
	});

	await db.scores.remove({
		userID,
		game,
		playtype,
	});

	const chartIDs = (
		await db["personal-bests"].find(
			{
				userID,
				game,
				playtype,
			},
			{
				projection: {
					chartID: 1,
				},
			}
		)
	).map((e) => e.chartID);

	await db["personal-bests"].remove({
		userID,
		game,
		playtype,
	});

	await UpdateAllPBs(undefined, {
		chartID: { $in: chartIDs },
	});

	const sessionIDs = (
		await db.sessions.find(
			{
				userID,
				game,
				playtype,
			},
			{
				projection: {
					sessionID: 1,
				},
			}
		)
	).map((e) => e.sessionID);

	await db["session-view-cache"].remove({
		sessionID: { $in: sessionIDs },
	});

	await db.sessions.remove({
		userID,
		game,
		playtype,
	});

	await db.imports.remove({
		userID,
		game,
		playtype,
	});

	await db["game-settings"].remove({
		userID,
		game,
		playtype,
	});

	await db["game-stats"].remove({
		userID,
		game,
		playtype,
	});
}
