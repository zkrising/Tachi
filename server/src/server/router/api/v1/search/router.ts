import { Router } from "express";
import { SYMBOL_TACHI_API_AUTH } from "lib/constants/tachi";
import {
	SearchFolders,
	SearchForChartHash,
	SearchGamesSongsCharts,
	SearchUsersRegExp,
} from "lib/search/search";
import { TachiConfig } from "lib/setup/config";
import { Game, GetGPTString, GetGameConfig } from "tachi-common";
import { IsString } from "utils/misc";
import { GetAllUserRivals, GetUserPlayedGPTs } from "utils/user";
import type { FilterQuery } from "mongodb";
import type { FolderDocument, GPTString, SongDocument, UserDocument, integer } from "tachi-common";

const router: Router = Router({ mergeParams: true });

/**
 * Performs a generic "search" across Tachi.
 *
 * @param search - The criteria to search on.
 *
 * @name GET /api/v1/search
 */
router.get("/", async (req, res) => {
	if (!IsString(req.query.search)) {
		return res.status(400).json({
			success: false,
			description: "No search parameter given.",
		});
	}

	const userID = req[SYMBOL_TACHI_API_AUTH].userID;

	let filter: FilterQuery<FolderDocument & SongDocument & UserDocument> = {};

	let relevantGPTs: Array<GPTString> = TachiConfig.GAMES.flatMap((g) =>
		GetGameConfig(g).playtypes.map((pt) => GetGPTString(g, pt))
	);

	if (userID !== null) {
		// if the requesting user exists, and they've set this param,
		// only return info related to games they've played.
		if (IsString(req.query.hasPlayedGame)) {
			const gpts = await GetUserPlayedGPTs(userID);

			// @hack This is a bit lazy. We should really be filtering the user stuff
			// on GPTs with an $or query.
			filter = {
				game: { $in: gpts.map((e) => e.game) },
				playtype: { $in: gpts.map((e) => e.playtype) },
			};

			relevantGPTs = gpts.map((e) => GetGPTString(e.game, e.playtype));
		}
	}

	const [users, charts, folders] = await Promise.all([
		SearchUsersRegExp(req.query.search),
		SearchGamesSongsCharts(req.query.search, relevantGPTs),
		SearchFolders(req.query.search, filter),
	]);

	// @ts-expect-error Handled below -- the field is added by the below for loop.
	const usersWithRivalTag: Array<UserDocument & { __isRival: boolean }> = users;

	let rivals: Array<integer> = [];

	if (userID !== null) {
		rivals = await GetAllUserRivals(userID);
	}

	for (const user of usersWithRivalTag) {
		user.__isRival = rivals.includes(user.id);
	}

	return res.status(200).json({
		success: true,
		description: `Searched everything.`,
		body: {
			users,
			charts,
			folders,
		},
	});
});

/**
 * Search checksums for charts, instead of matching on song title.
 *
 * @param search - The hash to search on.
 *
 * @note This matches MD5 and SHA256 for BMS/PMS, GSv3 for ITG and SHA1 for USC.
 */
router.get("/chart-hash", async (req, res) => {
	if (!IsString(req.query.search)) {
		return res.status(400).json({
			success: false,
			description: "No search parameter given.",
		});
	}

	const charts = await SearchForChartHash(req.query.search);

	return res.status(200).json({
		success: true,
		description: `Searched for chart hash ${req.query.search}.`,
		body: {
			charts,
		},
	});
});

export default router;
