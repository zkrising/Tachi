import { Router } from "express";
import db from "external/mongo/db";
import { FindStandaloneQuests, GetGoalsInQuests } from "lib/targets/quests";
import { GetChildQuests } from "utils/db";
import { IsString } from "utils/misc";
import { AssignToReqTachiData, GetGPT, GetTachiData } from "utils/req-tachi-data";
import type { RequestHandler } from "express";

const router: Router = Router({ mergeParams: true });

const ResolveQuestlineID: RequestHandler = async (req, res, next) => {
	const { game, playtype } = GetGPT(req);
	const questlineID = req.params.questlineID;

	const questline = await db.questlines.findOne({
		questlineID,
		game,
		playtype,
	});

	if (!questline) {
		return res.status(404).json({
			success: false,
			description: `A questline with ID ${questlineID} doesn't exist.`,
		});
	}

	AssignToReqTachiData(req, { questlineDoc: questline });

	next();
};

/**
 * Retrieve all questlines for this GPT. Also, return any standalone quests.
 *
 * @name GET /api/v1/games/:game/:playtype/targets/questlines
 */
router.get("/", async (req, res) => {
	const { game, playtype } = GetGPT(req);

	const questlines = await db.questlines.find({ game, playtype });

	const standalone = await FindStandaloneQuests(game, playtype);
	const standaloneGoals = await GetGoalsInQuests(standalone);

	return res.status(200).json({
		success: true,
		description: `Returned ${questlines.length} quest sets.`,
		body: { questlines, standalone, standaloneGoals },
	});
});

/**
 * Retrieve a specific questline.
 *
 * @name GET /api/v1/games/:game/:playtype/targets/questlines/:questlineID
 */
router.get("/:questlineID", ResolveQuestlineID, async (req, res) => {
	const questline = GetTachiData(req, "questlineDoc");

	const quests = await GetChildQuests(questline);

	const goals = await GetGoalsInQuests(quests);

	return res.status(200).json({
		success: true,
		description: `Retrieved quest set '${questline.name}'.`,
		body: {
			quests,
			questline,
			goals,
		},
	});
});

export default router;
