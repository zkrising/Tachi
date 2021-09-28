// "rating" refers to a user's profile statistics, as in their "rating" on a game.
// Some games have dedicated methods to calculate statistics like these, other games do not.
// That's about all there is to it!

import { Game, Playtypes, integer, UserGameStats, ClassDelta } from "tachi-common";
import db from "external/mongo/db";
import { CreateGameSettings } from "lib/game-settings/create-game-settings";
import { KtLogger } from "lib/logger/logger";
import { ProcessClassDeltas, UpdateUGSClasses } from "./classes";
import { CalculateRatings } from "./rating";
import { ClassHandler } from "./types";

export async function UpdateUsersGamePlaytypeStats(
	game: Game,
	playtype: Playtypes[Game],
	userID: integer,
	classHandler: ClassHandler | null,
	logger: KtLogger
): Promise<ClassDelta[]> {
	const ratings = await CalculateRatings(game, playtype, userID, logger);

	// Attempt to find a users game stats if one already exists. If one doesn't exist,
	// this is this players first import for this game!
	const userGameStats = await db["game-stats"].findOne({
		game,
		playtype,
		userID,
	});

	logger.debug(`Calculating UGSClasses...`);

	const classes = await UpdateUGSClasses(game, playtype, userID, ratings, classHandler, logger);

	logger.debug(`Finished Calculating UGSClasses`);

	logger.debug(`Calculating Class Deltas...`);

	const deltas = await ProcessClassDeltas(game, playtype, classes, userGameStats, userID, logger);

	logger.debug(`Had ${deltas.length} deltas.`);

	if (userGameStats) {
		logger.debug(`Updated player gamestats for ${game} (${playtype})`);
		await db["game-stats"].update(
			{
				game,
				playtype,
				userID,
			},
			{
				$set: {
					ratings,
					classes,
				},
			}
		);
	} else {
		const newStats: UserGameStats = {
			game,
			playtype,
			userID,
			ratings,
			classes,
		};

		logger.info(`Created new gamestats for ${game} (${playtype})`);
		await db["game-stats"].insert(newStats);
		await CreateGameSettings(userID, game, playtype);
	}

	return deltas;
}
