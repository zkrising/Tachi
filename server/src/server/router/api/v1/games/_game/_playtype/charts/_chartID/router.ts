import { Router } from "express";
import db from "../../../../../../../../../external/mongo/db";
import { SYMBOL_TachiData } from "../../../../../../../../../lib/constants/tachi";
import CreateLogCtx from "../../../../../../../../../lib/logger/logger";
import { SearchUsersRegExp } from "../../../../../../../../../lib/search/search";
import { IsString } from "../../../../../../../../../utils/misc";
import { ParseStrPositiveNonZeroInt } from "../../../../../../../../../utils/string-checks";
import { GetUsersWithIDs } from "../../../../../../../../../utils/user";
import { HandleTierlistIDParam } from "../../folders/middleware";
import { ValidateAndGetChart } from "./middleware";
import { FormatChart } from "tachi-common";

const logger = CreateLogCtx(__filename);

const router: Router = Router({ mergeParams: true });

router.use(ValidateAndGetChart);

/**
 * Returns the chart (and the parent song) at this chart ID.
 *
 * @name GET /api/v1/games/:game/:playtype/charts/:chartID
 */
router.get("/", async (req, res) => {
	const chart = req[SYMBOL_TachiData]!.chartDoc!;
	const game = req[SYMBOL_TachiData]!.game!;

	const song = await db.songs[game].findOne({
		id: chart.songID,
	});

	if (!song) {
		logger.severe(
			`Song ${chart.songID} does not exist, yet chart ${chart.chartID} has it as a parent?`
		);

		return res.status(500).json({
			success: false,
			description: `An internal server error has occured.`,
		});
	}

	return res.status(200).json({
		success: true,
		description: `Returned ${FormatChart(game, song, chart)}.`,
		body: {
			song,
			chart,
		},
	});
});

/**
 * Returns all tierlist information for this chart.
 *
 * @param tierlistID - If specified, retrieve this tierlist instead of the
 * default. If there is no default for this game, 501 is returned.
 *
 * @name GET /api/v1/games/:game/:playtype/charts/:chartID/tierlist
 */
router.get("/tierlist", HandleTierlistIDParam, async (req, res) => {
	const tierlist = req[SYMBOL_TachiData]!.tierlistDoc!;
	const chart = req[SYMBOL_TachiData]!.chartDoc!;

	const tierlistData = await db["tierlist-data"].find({
		chartID: chart.chartID,
		tierlistID: tierlist.tierlistID,
	});

	return res.status(200).json({
		success: true,
		description: `Returned ${tierlistData.length} tierlist information.`,
		body: {
			tierlist,
			tierlistData,
		},
	});
});

/**
 * Returns the total amount of unique players that have played this chart.
 *
 * @name GET /api/v1/games/:game/:playtype/charts/:chartID/playcount
 */
router.get("/playcount", async (req, res) => {
	const chart = req[SYMBOL_TachiData]!.chartDoc!;

	const count = await db["personal-bests"].count({ chartID: chart.chartID });

	return res.status(200).json({
		success: true,
		description: `Counted scores for chart.`,
		body: {
			count,
		},
	});
});

/**
 * Returns the personal bests for this chart in batches of 100.
 * These are returned sorted by their ranking.
 *
 * @param startRanking - The ranking to start iterating from - defaults to 1.
 *
 * @name GET /api/v1/games/:game/:playtype/charts/:chartID/pbs
 */
router.get("/pbs", async (req, res) => {
	const chart = req[SYMBOL_TachiData]!.chartDoc!;

	const startRanking = ParseStrPositiveNonZeroInt(req.query.startRanking) ?? 1;

	const pbs = await db["personal-bests"].find(
		{
			chartID: chart.chartID,
			"rankingData.rank": { $gte: startRanking },
		},
		{
			limit: 100,
			sort: {
				"rankingData.rank": 1,
			},
		}
	);

	const users = await GetUsersWithIDs(pbs.map((e) => e.userID));

	return res.status(200).json({
		success: true,
		description: `Returned ${pbs.length} scores.`,
		body: {
			pbs,
			users,
		},
	});
});

/**
 * Searches the PBs on this chart for the given user(s).
 *
 * @param search - The user to search for
 *
 * @name GET /api/v1/games/:game/:playtype/charts/:chartID/pbs/search
 */
router.get("/pbs/search", async (req, res) => {
	const chart = req[SYMBOL_TachiData]!.chartDoc!;

	if (!IsString(req.query.search)) {
		return res.status(400).json({
			success: false,
			description: `Invalid parameter for search.`,
		});
	}

	const users = await SearchUsersRegExp(req.query.search);

	const pbs = await db["personal-bests"].find({
		chartID: chart.chartID,
		userID: { $in: users.map((e) => e.id) },
	});

	return res.status(200).json({
		success: true,
		description: `Returned ${pbs.length} scores.`,
		body: {
			pbs,
			users,
		},
	});
});

export default router;
