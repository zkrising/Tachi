import { Router } from "express";
import { SearchAllGamesSongs, SearchForChartHash, SearchUsersRegExp } from "lib/search/search";
import { RequireBokutachi } from "server/middleware/type-require";
import { IsString } from "utils/misc";

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

	const [users, songs] = await Promise.all([
		SearchUsersRegExp(req.query.search),
		SearchAllGamesSongs(req.query.search),
	]);

	return res.status(200).json({
		success: true,
		description: `Searched everything.`,
		body: {
			users,
			songs,
		},
	});
});

/**
 * Search checksums for charts, instead of matching on song title.
 *
 * @param search - The hash to search on
 *
 * @note This matches MD5 and SHA256 for BMS/PMS, and SHA1 for USC.
 */
router.get("/chart-hash", RequireBokutachi, async (req, res) => {
	if (!IsString(req.query.search)) {
		return res.status(400).json({
			success: false,
			description: "No search parameter given.",
		});
	}

	const { songs, charts } = await SearchForChartHash(req.query.search);

	return res.status(200).json({
		success: true,
		description: `Searched BMS, PMS and USC for ${req.query.search}().`,
		body: {
			songs,
			charts,
		},
	});
});

export default router;
