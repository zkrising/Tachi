import { Router } from "express";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import { IsString } from "utils/misc";
import { GetGamePTConfig, UserGameStats, FormatGame, Game, Playtypes, integer } from "tachi-common";
import { FindOptions } from "monk";
import db from "external/mongo/db";
import { CheckStrProfileAlg, ParseStrPositiveNonZeroInt } from "utils/string-checks";
import { GetUsersWithIDs } from "utils/user";
import chartsRouter from "./charts/router";
import songIDRouter from "./songs/_songID/router";
import { ValidatePlaytypeFromParam } from "./middleware";
import foldersRouter from "./folders/router";
import tablesRouter from "./tables/router";
import NodeCache from "node-cache";
import { ONE_HOUR } from "lib/constants/time";
import prValidate from "server/middleware/prudence-validate";
import p from "prudence";
import { GetClassDistribution } from "utils/queries/stats";
import scoresRouter from "./scores/router";
import { GetRelevantSongsAndCharts } from "utils/db";

const router: Router = Router({ mergeParams: true });

router.use(ValidatePlaytypeFromParam);

const gptStatCache = new NodeCache();

async function GetGameStats(
	game: Game,
	playtype: Playtypes[Game]
): Promise<{ scoreCount: integer; playerCount: integer; chartCount: integer }> {
	const cacheRes = gptStatCache.get(`${game}:${playtype}`);

	if (!cacheRes) {
		const [scoreCount, playerCount, chartCount] = await Promise.all([
			db.scores.count({
				game,
				playtype,
			}),
			db["game-stats"].count({
				game,
				playtype,
			}),
			db.charts[game].count({ playtype }),
		]);

		gptStatCache.set(`${game}:${playtype}`, { scoreCount, playerCount, chartCount }, ONE_HOUR);

		return { scoreCount, playerCount, chartCount };
	}

	return cacheRes as { scoreCount: integer; playerCount: integer; chartCount: integer };
}

/**
 * Returns the configuration for this game along with some statistics.
 *
 * @name GET /api/v1/games/:game/:playtype
 */
router.get("/", async (req, res) => {
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;

	const { scoreCount, playerCount, chartCount } = await GetGameStats(game, playtype);

	return res.status(200).json({
		success: true,
		description: `Retrieved information about ${FormatGame(game, playtype)}`,
		body: {
			config: GetGamePTConfig(game, playtype),
			scoreCount,
			playerCount,
			chartCount,
		},
	});
});

/**
 * Returns user-game-stats for this game in batches of 100.
 * This is sorted by the games default-sorting-statistic.
 *
 * @param alg - An alternative algorithm to use instead of the gpts default.
 * @param limit - How many users to return at most. Defaults (and is limited to) 50.
 *
 * @name GET /api/v1/games/:game/:playtype/leaderboard
 */
router.get("/leaderboard", async (req, res) => {
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;
	const gptConfig = GetGamePTConfig(game, playtype);

	const limit = ParseStrPositiveNonZeroInt(req.query.limit) ?? 50;

	if (limit > 50) {
		return res.status(400).json({
			success: false,
			description: `Invalid limit. Limit is capped at 50.`,
		});
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
		limit,
	};

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

/**
 * Returns the best scores for this game.
 *
 * @param alg - An alternative algorithm to use instead of the gpts default.
 * @param limit - How many scores to return.
 *
 * @name GET /api/v1/games/:game/:playtype/score-leaderboard
 */
router.get("/score-leaderboard", async (req, res) => {
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;
	const gptConfig = GetGamePTConfig(game, playtype);

	const limit = ParseStrPositiveNonZeroInt(req.query.limit) ?? 50;

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

	const pbs = await db["personal-bests"].find(
		{
			game,
			playtype,
		},
		{
			sort: {
				[`calculatedData.${alg}`]: -1,
			},
			limit,
		}
	);

	const users = await GetUsersWithIDs(pbs.map((e) => e.userID));

	const { songs, charts } = await GetRelevantSongsAndCharts(pbs, game);

	return res.status(200).send({
		success: true,
		description: `Successfully returned ${pbs.length} pbs.`,
		body: {
			pbs,
			songs,
			charts,
			users,
		},
	});
});

/**
 * Return the distribution of players for the provided class.
 *
 * @param class - This should be one of the games supported classes.
 *
 * @name GET /api/v1/games/:game/:playtype/player-distribution
 */
router.get(
	"/class-distribution",
	prValidate({
		class: "string",
	}),
	async (req, res) => {
		const game = req[SYMBOL_TachiData]!.game!;
		const playtype = req[SYMBOL_TachiData]!.playtype!;
		const gptConfig = GetGamePTConfig(game, playtype);

		const stat = req.query.class as string;

		const supportedClasses = Object.keys(gptConfig.classHumanisedFormat);
		if (!supportedClasses.includes(stat)) {
			return res.status(400).json({
				success: false,
				description: `Invalid stat ${stat}. Expected any of ${supportedClasses.join(
					", "
				)}.`,
			});
		}

		// @hack This is asserted above. We're just going to cast as any because we know what
		// we're doing.
		const distribution = await GetClassDistribution(game, playtype, stat as any);

		return res.status(200).json({
			success: true,
			description: `Successfully retrieved distribution.`,
			body: distribution,
		});
	}
);

/**
 * Returns recent class improvements for this GPT.
 *
 * @param limit - How many to return. Defaults to 10, caps at 50.
 *
 * @name GET /api/v1/games/:game/:playtype/recent-classes
 */
router.get(
	"/recent-classes",
	prValidate({
		limit: p.optional((self) => p.isBoundedInteger(1, 50)(Number(self))),
	}),
	async (req, res) => {
		const game = req[SYMBOL_TachiData]!.game!;
		const playtype = req[SYMBOL_TachiData]!.playtype!;

		const limit = req.query.limit ? Number(req.query.limit) : 10;

		const recentClasses = await db["class-achievements"].find(
			{
				game,
				playtype,
			},
			{
				limit,
				sort: { timeAchieved: -1 },
			}
		);

		const users = await GetUsersWithIDs(recentClasses.map((e) => e.userID));

		return res.status(200).json({
			success: true,
			description: `Returned ${recentClasses.length} recent classes.`,
			body: { classes: recentClasses, users },
		});
	}
);

// @todo #196 Country Leaderboards?

router.use("/charts", chartsRouter);
router.use("/songs/:songID", songIDRouter);
router.use("/folders", foldersRouter);
router.use("/tables", tablesRouter);
router.use("/scores", scoresRouter);

export default router;
