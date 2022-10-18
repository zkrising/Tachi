import { Router } from "express";
import db from "external/mongo/db";
import { SearchCollection } from "lib/search/search";
import { GetChildQuests } from "utils/db";
import { IsString } from "utils/misc";
import { AssignToReqTachiData, GetGPT, GetTachiData } from "utils/req-tachi-data";
import type { RequestHandler } from "express";

const router: Router = Router({ mergeParams: true });

const ResolveQuestlineID: RequestHandler = async (req, res, next) => {
	const { game, playtype } = GetGPT(req);
	const questlineID = req.params.questlineID;

	const set = await db.questlines.findOne({
		questlineID,
		game,
		playtype,
	});

	if (!set) {
		return res.status(404).json({
			success: false,
			description: `A quest set with ID ${questlineID} doesn't exist.`,
		});
	}

	AssignToReqTachiData(req, { questlineDoc: set });

	next();
};

/**
 * Search quest sets.
 *
 * @param search - The quest set to search for.
 *
 * @name GET /api/v1/games/:game/:playtype/targets/questlines
 */
router.get("/", async (req, res) => {
	const { game, playtype } = GetGPT(req);

	if (!IsString(req.query.search)) {
		return res.status(400).json({
			success: false,
			description: `Invalid value for search.`,
		});
	}

	const questlines = await SearchCollection(
		db.questlines,
		req.query.search,
		{ game, playtype },
		50
	);

	return res.status(200).json({
		success: true,
		description: `Returned ${questlines.length} quest sets.`,
		body: questlines,
	});
});

/**
 * Retrieve a specific quest set.
 *
 * @name GET /api/v1/games/:game/:playtype/targets/questlines/:questlineID
 */
router.get("/:questlineID", ResolveQuestlineID, async (req, res) => {
	const questline = GetTachiData(req, "questlineDoc");

	const quests = await GetChildQuests(questline);

	return res.status(200).json({
		success: true,
		description: `Retrieved quest set '${questline.name}'.`,
		body: {
			quests,
			questline,
		},
	});
});

export default router;
