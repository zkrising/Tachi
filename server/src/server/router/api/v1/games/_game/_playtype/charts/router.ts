import chartIDRouter from "./_chartID/router";
import { Router } from "express";
import db from "external/mongo/db";
import { SYMBOL_TACHI_API_AUTH } from "lib/constants/tachi";
import CreateLogCtx from "lib/logger/logger";
import { ResolveMatchTypeToTachiData } from "lib/score-import/import-types/common/batch-manual/converter";
import { SearchSpecificGameSongs } from "lib/search/search";
import prValidate from "server/middleware/prudence-validate";
import {
	type ChartDocument,
	type integer,
	type MatchTypes,
	type UGPTSettingsDocument,
} from "tachi-common";
import { IsString } from "utils/misc";
import { FindChartsOnPopularity } from "utils/queries/charts";
import { GetGPT } from "utils/req-tachi-data";
import type { ConverterFailure } from "lib/score-import/framework/common/converter-failures";
import type { BatchManualScore } from "tachi-common";

const router: Router = Router({ mergeParams: true });

/**
 * Searches for charts on this game - if no search parameter is given,
 * returns the 100 most popular charts for this game.
 *
 * @param search - The song title to match on.
 * @param noIntelligentOmit - If present, will not perform intelligent
 * chart omissions from results.
 * @param requesterHasPlayed - If present, will only return charts the
 * requesting user has a PB on. If this request doesn't belong to a user,
 * this returns 401.
 *
 * @name GET /api/v1/games/:game/:playtype/charts
 */
router.get("/", async (req, res) => {
	const { game, playtype } = GetGPT(req);

	let songIDs: Array<integer> | undefined;

	if (IsString(req.query.search)) {
		const songs = await SearchSpecificGameSongs(game, req.query.search, 100);

		songIDs = songs.map((e) => e.id);
	}

	if (IsString(req.query.requesterHasPlayed)) {
		const userID = req[SYMBOL_TACHI_API_AUTH].userID;

		if (userID === null) {
			return res.status(401).json({
				success: false,
				description: `You must be authorised as a user to use the requesterHasPlayed option.`,
			});
		}

		const playedSongs = (
			await db["personal-bests"].find(
				{ userID, game, playtype },
				{ projection: { songID: 1 } }
			)
		).map((e) => e.songID);

		if (songIDs) {
			songIDs = songIDs.filter((e) => playedSongs.includes(e));
		} else {
			songIDs = playedSongs;
		}
	}

	const skip = 0;
	const limit = 100;

	let charts = (await FindChartsOnPopularity(
		game,
		playtype,

		// if empty, we want the set of all songs. Otherwise, constrict input.
		songIDs,
		skip,
		limit,
		"personal-bests"
	)) as Array<ChartDocument>;

	// @optimisable
	// could use songIDs from above instead of refetching
	// but this is not very expensive.
	const songs = await db.anySongs[game].find({
		id: { $in: charts.map((e) => e.songID) },
	});

	// Edge case.
	// If the game is IIDX and the player does not want
	// to see 2dxtra charts, we need to remove them from the
	// result of a search.
	//
	// Since most players will have this off, this is not a significant
	// performance hit.
	if (game === "iidx" && req.query.noIntelligentOmit === undefined) {
		if (req[SYMBOL_TACHI_API_AUTH].userID === null) {
			charts = charts.filter(
				(e) => (e as ChartDocument<"iidx:DP" | "iidx:SP">).data["2dxtraSet"] === null
			);
		} else {
			const iidxSettings = (await db["game-settings"].findOne({
				userID: req[SYMBOL_TACHI_API_AUTH].userID,
				game,
				playtype,
			})) as UGPTSettingsDocument<"iidx:DP" | "iidx:SP"> | null;

			if (!iidxSettings?.preferences.gameSpecific.display2DXTra) {
				charts = charts.filter(
					(e) => (e as ChartDocument<"iidx:DP" | "iidx:SP">).data["2dxtraSet"] === null
				);
			}
		}
	}

	return res.status(200).json({
		success: true,
		description: `Returned ${charts.length} charts.`,
		body: {
			charts,
			songs,
		},
	});
});

interface ResolveArgs {
	identifier: string;
	difficulty?: string;
	matchType: MatchTypes;
	version?: string;
}

/**
 * Resolve a chart using one of the batch manual matchTypes.
 *
 * @name GET /api/v1/games/:game/:playtype/charts/resolve
 */
router.get(
	"/resolve",
	prValidate({
		identifier: "string",
		difficulty: "*string",
		matchType: "string",
	}),
	async (req, res) => {
		const { game, playtype } = GetGPT(req);

		const logger = CreateLogCtx(__filename);

		const query = req.query as unknown as ResolveArgs;

		try {
			const mockBatchManualScore: BatchManualScore = {
				identifier: query.identifier,
				matchType: query.matchType,
				difficulty: query.difficulty,
			} as unknown as BatchManualScore;

			const { song, chart } = await ResolveMatchTypeToTachiData(
				// This is an extremely silly hack. Basically, this function is called
				// relatively deep in the batch-manual import process. I couldn't be bothered
				// to refactor this to take more generic arguments, so instead, we're just
				// hackily saying "yeah this is definitely a "batch-manual score", trust us.
				// We happen to know that this function doesn't interact or care about the
				// scorey bits, but hey ho. This is still a stupid hack. Wouldn't happen in
				// Rust.
				mockBatchManualScore,
				{
					game,
					playtype,
					// we're using this function in a way it wasn't intended to be used.
					// I don't really care though. This is a hack.
					service: "Lookup Hack",
					version: query.version as any,
				},
				// This is completely unecessary and totally just used for debug logging.
				// That said, we realllly shouldn't be treating a function like this as this
				// malleable bit of noise.
				"ir/direct-manual",
				logger
			);

			return res.status(200).json({
				success: true,
				description: `Found song & chart.`,
				body: {
					song,
					chart,
				},
			});
		} catch (e) {
			const err = e as ConverterFailure;

			return res.status(404).json({
				success: false,
				description: err.message,
			});
		}
	}
);

router.use("/:chartID", chartIDRouter);

export default router;
