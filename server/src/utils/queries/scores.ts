import db from "external/mongo/db";
import type { Game, Playtype, integer } from "tachi-common";

export async function GetRecentUGPTScores(
	userID: integer,
	game: Game,
	playtype: Playtype,
	limit = 100
) {
	return db.scores.find(
		{
			userID,
			game,
			playtype,
		},
		{
			sort: {
				timeAdded: -1,
			},
			limit,
		}
	);
}

export async function GetRecentUGPTHighlights(
	userID: integer,
	game: Game,
	playtype: Playtype,
	limit = 100
) {
	return db.scores.find(
		{
			userID,
			game,
			playtype,
			highlight: true,
		},
		{
			sort: {
				timeAdded: -1,
			},
			limit,
		}
	);
}
