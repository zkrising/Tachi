import { Router } from "express";
import { SearchAllGamesSongs, SearchUsersRegExp } from "../../../../../lib/search/search";
import { IsString } from "../../../../../utils/misc";

const router: Router = Router({ mergeParams: true });

/**
 * Performs a generic "search" across Tachi.
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

export default router;
