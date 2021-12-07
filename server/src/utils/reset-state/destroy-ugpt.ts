import db from "external/mongo/db";
import { integer, Game, Playtypes } from "tachi-common";

/**
 * Completely resets a UGPT profile.
 *
 * This function is dangerous! Should only be ran by admins.
 */
export default async function DestroyUserGamePlaytypeData(
	userID: integer,
	game: Game,
	playtype: Playtypes[Game]
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

	await db["personal-bests"].remove({
		userID,
		game,
		playtype,
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
