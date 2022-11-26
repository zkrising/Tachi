import { Router } from "express";
import db from "external/mongo/db";
import { SearchCollection } from "lib/search/search";
import { GetGoalsInQuest, GetGoalsInQuests } from "lib/targets/quests";
import { IsString } from "utils/misc";
import { AssignToReqTachiData, GetGPT, GetTachiData } from "utils/req-tachi-data";
import { GetUsersWithIDs } from "utils/user";
import type { RequestHandler } from "express";

const router: Router = Router({ mergeParams: true });

const ResolveQuestID: RequestHandler = async (req, res, next) => {
	const { game, playtype } = GetGPT(req);
	const questID = req.params.questID;

	const quest = await db.quests.findOne({
		questID,
		game,
		playtype,
	});

	if (!quest) {
		return res.status(404).json({
			success: false,
			description: `A quest with ID ${questID} doesn't exist.`,
		});
	}

	AssignToReqTachiData(req, { questDoc: quest });

	next();
};

/**
 * Search quests for this GPT.
 *
 * @param search - The query to search for.
 *
 * @name GET /api/v1/games/:game/:playtype/targets/quests
 */
router.get("/", async (req, res) => {
	const { game, playtype } = GetGPT(req);

	if (!IsString(req.query.search)) {
		return res.status(400).json({
			success: false,
			description: `Invalid value for search.`,
		});
	}

	const quests = await SearchCollection(db.quests, req.query.search, { game, playtype }, 50);
	const goals = await GetGoalsInQuests(quests);

	return res.status(200).json({
		success: true,
		description: `Returned ${quests.length} quests.`,
		body: { quests, goals },
	});
});

/**
 * Retrieve information about this quest and who is subscribed to it.
 *
 * @name GET /api/v1/games/:game/:playtype/targets/quests/:questID
 */
router.get("/:questID", ResolveQuestID, async (req, res) => {
	const quest = GetTachiData(req, "questDoc");

	const questSubs = await db["quest-subs"].find({
		questID: quest.questID,
	});

	const users = await GetUsersWithIDs(questSubs.map((e) => e.userID));

	const goals = await GetGoalsInQuest(quest);

	const parentQuestlines = await db.questlines.find({
		quests: quest.questID,
	});

	return res.status(200).json({
		success: true,
		description: `Retrieved information about ${quest.name}.`,
		body: {
			quest,
			questSubs,
			users,
			goals,
			parentQuestlines,
		},
	});
});

export default router;
