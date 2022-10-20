import { RequireAuthedAsUser } from "../../../../../middleware";
import { Router } from "express";
import db from "external/mongo/db";
import { SubscribeFailReasons } from "lib/constants/err-codes";
import CreateLogCtx from "lib/logger/logger";
import { ServerConfig } from "lib/setup/config";
import { EvaluateQuestProgress, SubscribeToQuest, UnsubscribeFromQuest } from "lib/targets/quests";
import { RequirePermissions } from "server/middleware/auth";
import { AssignToReqTachiData, GetGPT, GetTachiData, GetUGPT } from "utils/req-tachi-data";
import { FormatUserDoc } from "utils/user";
import type { RequestHandler } from "express";

const logger = CreateLogCtx(__filename);

const router: Router = Router({ mergeParams: true });

/**
 * Retrieves this user's subscribed quests.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/targets/quests
 */
router.get("/", async (req, res) => {
	const { user, game, playtype } = GetUGPT(req);

	const questSubs = await db["quest-subs"].find({
		userID: user.id,
		game,
		playtype,
	});

	const quests = await db.quests.find({
		questID: { $in: questSubs.map((e) => e.questID) },
	});

	if (quests.length !== questSubs.length) {
		logger.error(
			`Found ${questSubs.length} subscriptions, but got ${quests.length} parents. This is a state desync.`
		);
		throw new Error("Failed to fetch quests");
	}

	return res.status(200).json({
		success: true,
		description: `Retrieved ${questSubs.length} quest(s).`,
		body: {
			quests,
			questSubs,
		},
	});
});

const GetQuestSubscription: RequestHandler = async (req, res, next) => {
	const { user, game, playtype } = GetUGPT(req);

	const questSub = await db["quest-subs"].findOne({
		userID: user.id,
		game,
		playtype,
		questID: req.params.questID,
	});

	if (!questSub) {
		return res.status(404).json({
			success: false,
			description: `${user.username} is not subscribed to this quest.`,
		});
	}

	AssignToReqTachiData(req, { questSubDoc: questSub });

	next();
};

const GetQuest: RequestHandler = async (req, res, next) => {
	const { game, playtype } = GetGPT(req);

	const quest = await db.quests.findOne({
		game,
		playtype,
		questID: req.params.questID,
	});

	if (!quest) {
		return res.status(404).json({
			success: false,
			description: `Can't find a quest with id '${req.params.questID}'.`,
		});
	}

	AssignToReqTachiData(req, { questDoc: quest });

	next();
};

/**
 * Returns this user's progress on this quest.
 * This also evaluates individual progress on all of the quests goals.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/targets/quests/:questID
 */
router.get("/:questID", GetQuest, GetQuestSubscription, async (req, res) => {
	const { user } = GetUGPT(req);

	const questSub = GetTachiData(req, "questSubDoc");
	const quest = GetTachiData(req, "questDoc");

	// Evaluate each goal for the user. This operation is much faster if the user is
	// subscribed to the quest (they are), as we can just read their goalSub
	// for each goal.
	const { goalResults: results, goals } = await EvaluateQuestProgress(user.id, quest);

	return res.status(200).json({
		success: true,
		description: `Returned information about ${FormatUserDoc(user)}'s progress on ${
			quest.name
		}.`,
		body: {
			questSub,
			quest,
			results,
			goals,
		},
	});
});

/**
 * Subscribe to a quest.
 *
 * @name PUT /api/v1/users/:userID/games/:game/:playtype/targets/quests/:questID
 */
router.put(
	"/:questID",
	RequireAuthedAsUser,
	GetQuest,
	RequirePermissions("manage_targets"),
	async (req, res) => {
		const { user, game, playtype } = GetUGPT(req);

		const existingQuestsCount = await db["quest-subs"].count({
			userID: user.id,
			game,
			playtype,
		});

		if (existingQuestsCount > ServerConfig.MAX_MILESTONE_SUBSCRIPTIONS) {
			return res.status(400).json({
				success: false,
				description: `You already have ${ServerConfig.MAX_MILESTONE_SUBSCRIPTIONS} quests. You cannot have anymore for this game.`,
			});
		}

		const quest = GetTachiData(req, "questDoc");

		const alreadySubscibed = await db["quest-subs"].findOne({
			userID: user.id,
			questID: quest.questID,
		});

		if (alreadySubscibed) {
			return res.status(409).json({
				success: false,
				description: `You are already subscribed to this goal.`,
			});
		}

		const subResult = await SubscribeToQuest(user.id, quest, false);

		// Users should be able to subscribe to quests EVEN IF they would instantly
		// achieve them.

		// if (subResult === SubscribeFailReasons.ALREADY_ACHIEVED) {
		// 	return res.status(400).json({
		// 		success: false,
		// 		description: `You cannot assign a quest that would be immediately achieved.`,
		// 	});
		// }

		if (subResult === SubscribeFailReasons.ALREADY_SUBSCRIBED) {
			return res.status(409).json({
				success: false,
				description: `You're already subscribed to this quest.`,
			});
		}

		return res.status(200).json({
			success: true,
			description: `Subscribed to quest '${quest.name}'.`,
			body: { ...subResult, quest },
		});
	}
);

/**
 * Unsubscribe from a quest.
 *
 * @name DELETE /api/v1/users/:userID/games/:game/:playtype/targets/quests/:questID
 */
router.delete(
	"/:questID",
	RequireAuthedAsUser,
	GetQuest,
	RequirePermissions("manage_targets"),
	async (req, res) => {
		const { user } = GetUGPT(req);
		const quest = GetTachiData(req, "questDoc");

		logger.info(`User ${FormatUserDoc(user)} is unsubscribing from quest '${quest.name}'.`, {
			quest,
			user,
		});

		await UnsubscribeFromQuest(user.id, quest.questID);

		return res.status(200).json({
			success: true,
			description: `Unsubscribed from quest.`,
			body: {
				quest,
			},
		});
	}
);

export default router;
