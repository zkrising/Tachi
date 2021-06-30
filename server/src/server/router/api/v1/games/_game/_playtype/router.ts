import { Router } from "express";
import { SYMBOL_TachiData } from "../../../../../../../lib/constants/tachi";
import { FormatGPT, IsString } from "../../../../../../../utils/misc";
import { GetGamePTConfig, UserGameStats, integer } from "tachi-common";
import { FindOptions } from "monk";
import db from "../../../../../../../external/mongo/db";
import { ParseStrPositiveInt, CheckStrProfileAlg } from "../../../../../../../utils/string-checks";
import { GetUsersWithIDs } from "../../../../../../../utils/user";
import chartsRouter from "./charts/router";
import songIDRouter from "./songs/_songID/router";
import { ValidatePlaytypeFromParam } from "./middleware";
import foldersRouter from "./folders/router";
import tablesRouter from "./tables/router";

const router: Router = Router({ mergeParams: true });

router.use(ValidatePlaytypeFromParam);

/**
 * Returns the configuration for this game.
 *
 * @name GET /api/v1/games/:game/:playtype
 */
router.get("/", (req, res) => {
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;

	return res.status(200).json({
		success: true,
		description: `Retrieved information about ${FormatGPT(game, playtype)}`,
		body: {
			config: GetGamePTConfig(game, playtype),
		},
	});
});

/**
 * Returns user-game-stats for this game in batches of 100.
 * This is sorted by the games default-sorting-statistic.
 *
 * @param start - A number dictating what value to start from.
 * @param alg - An alternative algorithm to use instead of the gpts default.
 *
 * @name GET /api/v1/games/:game/:playtype/leaderboard
 */
router.get("/leaderboard", async (req, res) => {
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;
	const gptConfig = GetGamePTConfig(game, playtype);

	let start: null | integer = null;
	if (IsString(req.query.start)) {
		start = ParseStrPositiveInt(req.query.start);

		if (start === null) {
			return res.status(400).json({
				success: false,
				description: `Invalid value of ${req.query.start} for start.`,
			});
		}
	}

	let alg = gptConfig.defaultProfileRatingAlg;
	if (IsString(req.query.alg)) {
		const temp = CheckStrProfileAlg(game, playtype, req.query.alg);

		if (temp === null) {
			return res.status(400).json({
				success: false,
				description: `Invalid value of ${
					req.query.alg
				} for alg. Expected one of ${gptConfig.profileRatingAlgs.join(", ")}`,
			});
		}

		alg = temp;
	}

	const options: FindOptions<UserGameStats> = {
		sort: {
			[`ratings.${alg}`]: -1,
		},
	};

	if (start !== null) {
		options.skip = start * 100;
	}

	const gameStats = await db["game-stats"].find(
		{
			game,
			playtype,
		},
		options
	);

	const users = await GetUsersWithIDs(gameStats.map((e) => e.userID));

	return res.status(200).json({
		success: true,
		description: `Returned ${gameStats.length} user's game stats.`,
		body: {
			gameStats,
			users,
		},
	});
});

// @todo #196 Country Leaderboards?

router.use("/charts", chartsRouter);
router.use("/songs/:songID", songIDRouter);
router.use("/folders", foldersRouter);
router.use("/tables", tablesRouter);

export default router;
