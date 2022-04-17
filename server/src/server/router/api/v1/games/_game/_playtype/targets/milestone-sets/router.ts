import { RequestHandler, Router } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import { SearchCollection } from "lib/search/search";
import { GetChildMilestones } from "utils/db";
import { IsString } from "utils/misc";
import { AssignToReqTachiData, GetGPT } from "utils/req-tachi-data";

const router: Router = Router({ mergeParams: true });

const ResolveMilestoneSetID: RequestHandler = async (req, res, next) => {
	const { game, playtype } = GetGPT(req);
	const setID = req.params.setID;

	const set = await db["milestone-sets"].findOne({
		setID,
		game,
		playtype,
	});

	if (!set) {
		return res.status(404).json({
			success: false,
			description: `A milestone set with ID ${setID} doesn't exist.`,
		});
	}

	AssignToReqTachiData(req, { milestoneSetDoc: set });

	return next();
};

/**
 * Search milestone sets.
 *
 * @param search - The milestone set to search for.
 *
 * @name GET /api/v1/games/:game/:playtype/targets/milestone-sets
 */
router.get("/", async (req, res) => {
	const { game, playtype } = GetGPT(req);

	if (!IsString(req.query.search)) {
		return res.status(400).json({
			success: false,
			description: `Invalid value for search.`,
		});
	}

	const milestoneSets = await SearchCollection(
		db["milestone-sets"],
		req.query.search,
		{ game, playtype },
		50
	);

	return res.status(200).json({
		success: true,
		description: `Returned ${milestoneSets.length} milestone sets.`,
		body: milestoneSets,
	});
});

/**
 * Retrieve a specific milestone set.
 *
 * @name GET /api/v1/games/:game/:playtype/targets/milestone-sets/:setID
 */
router.get("/:setID", ResolveMilestoneSetID, async (req, res) => {
	const milestoneSet = req[SYMBOL_TachiData]!.milestoneSetDoc!;

	const milestones = await GetChildMilestones(milestoneSet);

	return res.status(200).json({
		success: true,
		description: `Retrieved milestone set '${milestoneSet.name}'.`,
		body: {
			milestones,
			milestoneSet,
		},
	});
});

export default router;
