import goalsRouter from "./goals/router";
import questsRouter from "./quests/router";
import { Router } from "express";
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { GetRelevantGoals } from "lib/targets/goals";
import { GetParentQuests } from "lib/targets/quests";
import {
	GetRecentlyAchievedGoals,
	GetRecentlyAchievedQuests,
	GetRecentlyInteractedGoals,
	GetRecentlyInteractedQuests,
} from "utils/db";
import { GetFolderChartIDs } from "utils/folder";
import { GetUGPT } from "utils/req-tachi-data";

const logger = CreateLogCtx(__filename);

const router: Router = Router({ mergeParams: true });

/**
 * Return a user's recently achieved goals and quests.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/targets/recently-achieved
 */
router.get("/recently-achieved", async (req, res) => {
	const { game, playtype, user } = GetUGPT(req);

	const userID = user.id;

	const [{ goals, goalSubs }, { quests, questSubs }] = await Promise.all([
		GetRecentlyAchievedGoals({ userID, game, playtype }),
		GetRecentlyAchievedQuests({ userID, game, playtype }),
	]);

	return res.status(200).json({
		success: true,
		description: `Returned ${user.username}'s recently achieved targets.`,
		body: {
			goals,
			quests,
			goalSubs,
			questSubs,
			user,
		},
	});
});

/**
 * Returns a user's recently interacted with (raised, etc.) goals and quests.
 * Note that this does not include recently achieved.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/targets/recently-raised
 */
router.get("/recently-raised", async (req, res) => {
	const { game, playtype, user } = GetUGPT(req);

	const userID = user.id;

	const [{ goals, goalSubs }, { quests, questSubs }] = await Promise.all([
		GetRecentlyInteractedGoals({ userID, game, playtype }),
		GetRecentlyInteractedQuests({ userID, game, playtype }),
	]);

	return res.status(200).json({
		success: true,
		description: `Returned ${user.username}'s recently achieved targets.`,
		body: {
			goals,
			quests,
			goalSubs,
			questSubs,
			user,
		},
	});
});

/**
 * Find what unachieved targets this user has set that consider this chart.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/targets/on-chart/:chartID
 */
router.get("/on-chart/:chartID", async (req, res) => {
	const { game, playtype, user } = GetUGPT(req);

	const chartID = req.params.chartID;

	const chart = await db.anyCharts[game].findOne({ chartID, playtype });

	if (!chart) {
		return res.status(404).json({
			success: false,
			description: `Failed to find a chart with chartID '${chartID}'.`,
		});
	}

	const { goals, goalSubsMap } = await GetRelevantGoals(
		game,
		user.id,
		new Set([chartID]),
		logger,
		false
	);

	const goalSubs = [...goalSubsMap.values()];

	const quests = await GetParentQuests(user.id, game, playtype, goalSubs);

	const questSubs = await db["quest-subs"].find({
		questID: { $in: quests.map((e) => e.questID) },
	});

	return res.status(200).json({
		success: true,
		description: `Found pertinent goals`,
		body: {
			goals,
			goalSubs,
			quests,
			questSubs,
		},
	});
});

/**
 * Find what unachieved targets this user has set that involve this folder.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/targets/on-folder/:folderID
 */
router.get("/on-folder/:folderID", async (req, res) => {
	const { game, playtype, user } = GetUGPT(req);

	const folderID = req.params.folderID;

	const folder = await db.folders.findOne({ folderID, playtype });

	if (!folder) {
		return res.status(404).json({
			success: false,
			description: `Failed to find a folder with folderID '${folderID}'.`,
		});
	}

	const folderChartIDs = await GetFolderChartIDs(folderID);

	const allGoalSubs = await db["goal-subs"].find({
		userID: user.id,
		game,
		playtype,
	});

	const goalIDs = allGoalSubs.map((e) => e.goalID);

	// goals are relevant to a folder if it's part of a folder type goal
	// or if it's on any of the charts in the folder.
	// this is convenient for the UI, atleast.
	const goals = await Promise.all([
		db.goals.find({
			"charts.type": { $in: ["single", "multi"] },
			"charts.data": { $in: folderChartIDs },
			goalID: { $in: goalIDs },
		}),
		db.goals.find({
			"charts.type": "folder",
			"charts.data": folderID,
			goalID: { $in: goalIDs },
		}),
	]).then((r) => r.flat());

	const goalSubs = await db["goal-subs"].find({
		goalID: { $in: goals.map((e) => e.goalID) },
		userID: user.id,
		game,
		playtype,
	});

	const quests = await GetParentQuests(user.id, game, playtype, goalSubs);

	const questSubs = await db["quest-subs"].find({
		questID: { $in: quests.map((e) => e.questID) },
	});

	return res.status(200).json({
		success: true,
		description: `Found pertinent goals`,
		body: {
			goals,
			goalSubs,
			quests,
			questSubs,
		},
	});
});

/**
 * Retrieve all of this user's target subscriptions.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/targets/all-subs
 */
router.get("/all-subs", async (req, res) => {
	const { user, game, playtype } = GetUGPT(req);

	const [goalSubs, questSubs] = await Promise.all([
		db["goal-subs"].find({ userID: user.id, game, playtype }),
		db["quest-subs"].find({ userID: user.id, game, playtype }),
	]);

	return res.status(200).json({
		success: true,
		description: `Returned all target subscriptions.`,
		body: { goalSubs, questSubs },
	});
});

router.use("/goals", goalsRouter);
router.use("/quests", questsRouter);

export default router;
