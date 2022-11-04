// "rating" refers to a user's profile statistics, as in their "rating" on a game.
// Some games have dedicated methods to calculate statistics like these, other games do not.
// That's about all there is to it!

import { ProcessClassDeltas, UpdateUGSClasses } from "./classes";
import { CalculateRatings } from "./rating";
import db from "external/mongo/db";
import { CreateGameSettings } from "lib/game-settings/create-game-settings";
import type { ClassHandler } from "./types";
import type { KtLogger } from "lib/logger/logger";
import type { ClassDelta, Game, integer, Playtype, UserGameStats } from "tachi-common";

/**
 * @param allowDowngrades - If passed, this will allow metrics to be downgraded.
 */
export async function UpdateUsersGamePlaytypeStats(
	game: Game,
	playtype: Playtype,
	userID: integer,
	classHandler: ClassHandler | null,
	logger: KtLogger
): Promise<Array<ClassDelta>> {
	logger.debug(`Calculating Ratings...`);

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

		const updateClasses: Record<string, number> = {};

		for (const delta of deltas) {
			updateClasses[`classes.${delta.set}`] = delta.new;
		}

		await db["game-stats"].update(
			{
				game,
				playtype,
				userID,
			},
			{
				$set: {
					ratings,
					...updateClasses,
				},
			}
		);
	} else {
		const hasAnyScores = await db.scores.findOne({
			game,
			playtype,
			userID,
		});

		if (!hasAnyScores) {
			logger.debug("Not creating new game stats for user with no scores.", {
				userID,
				game,
				playtype,
			});
			return deltas;
		}

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
