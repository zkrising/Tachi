import { GetFolderFromParam } from "../../../../../../../games/_game/_playtype/folders/middleware";
import { RequireSelfRequestFromUser } from "../../../../../middleware";
import { Router } from "express";
import db from "external/mongo/db";
import prValidate from "server/middleware/prudence-validate";
import { GetGamePTConfig, GetScoreMetricConf, ValidateMetric } from "tachi-common";
import { GetEnumDistForFolder, GetFolderCharts, GetPBsOnFolder } from "utils/folder";
import { GetTachiData, GetUGPT } from "utils/req-tachi-data";
import { ParseStrPositiveInt } from "utils/string-checks";
import type { FilterQuery } from "mongodb";
import type { ScoreDocument } from "tachi-common";

const router: Router = Router({ mergeParams: true });

router.use(GetFolderFromParam);

/**
 * Returns a users pbs on this folder.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/folders/:folderID
 */
router.get("/", async (req, res) => {
	const { user } = GetUGPT(req);

	const folder = GetTachiData(req, "folderDoc");

	const { songs, charts, pbs } = await GetPBsOnFolder(user.id, folder);

	return res.status(200).json({
		success: true,
		description: `Returned ${pbs.length} pbs.`,
		body: {
			songs,
			charts,
			pbs,
			folder,
		},
	});
});

/**
 * Returns a users stats on this folder.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/folders/:folderID/stats
 */
router.get("/stats", async (req, res) => {
	const { user } = GetUGPT(req);

	const folder = GetTachiData(req, "folderDoc");

	const stats = await GetEnumDistForFolder(user.id, folder);

	return res.status(200).json({
		success: true,
		description: `Returned statistics for ${folder.title}.`,
		body: {
			folder,
			stats,
		},
	});
});

/**
 * Add a folder to the list of recently-viewed folders. This can only
 * be performed by a session-level token, to stop rogue API keys from causing
 * trouble. Also, it's a post request, to avoid funny SSRF stuff.
 *
 * @name POST /api/v1/users/:userID/games/:game/:playtype/folders/:folderID/viewed
 */
router.post("/viewed", RequireSelfRequestFromUser, async (req, res) => {
	const { user } = GetUGPT(req);

	const folder = GetTachiData(req, "folderDoc");

	await db["recent-folder-views"].update(
		{
			userID: user.id,
			game: folder.game,
			playtype: folder.playtype,
			folderID: folder.folderID,
		},
		{
			$set: {
				lastViewed: Date.now(),
			},
		},
		{
			upsert: true,
		}
	);

	return res.status(200).json({
		success: true,
		description: `Recorded a view on ${folder.title}.`,
		body: {},
	});
});

// note: this path is disgustingly long. :(
/**
 * Returns the users scores in order of when they met this criteria.
 *
 * @param criteriaType - Any metric for this GPT.
 * @param criteriaValue - Any valid value for that metric.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/folders/:folderID/timeline
 */
router.get(
	"/timeline",
	prValidate({
		criteriaType: "string",
		criteriaValue: "string",
	}),
	async (req, res) => {
		const { user, game, playtype } = GetUGPT(req);

		const folder = GetTachiData(req, "folderDoc");
		const gptConfig = GetGamePTConfig(game, playtype);

		// as asserted by prudence.
		const metric = req.query.criteriaType as string;

		const conf = GetScoreMetricConf(gptConfig, metric);

		if (!conf || conf.type !== "ENUM") {
			return res.status(400).json({
				success: false,
				description: `Invalid metric '${metric}' passed. Expected an ENUM for this game.`,
			});
		}

		const criteriaValue = conf.values.indexOf(req.query.criteriaValue as string);

		if (criteriaValue === -1) {
			return res.status(400).json({
				success: false,
				description: `Invalid criteriaValue of ${req.query.criteriaValue} for ${metric}.`,
			});
		}

		const { songs, charts } = await GetFolderCharts(folder, {}, true);

		const err = ValidateMetric(gptConfig, metric, criteriaValue);

		if (typeof err === "string") {
			return res.status(400).json({
				success: false,
				description: err,
			});
		}

		const matchCriteria: FilterQuery<ScoreDocument> = {
			userID: user.id,
			game,
			playtype,
			chartID: { $in: charts.map((e) => e.chartID) },
		};

		// Returns a unique score per-chart that was the first score to achieve
		// this criteria on that chart.
		const scoresAgg: Array<{ doc: ScoreDocument }> = await db.scores.aggregate([
			{
				$match: matchCriteria,
			},
			{
				$addFields: {
					__sortTime: { $ifNull: ["$timeAchieved", Infinity, "$timeAchieved"] },
				},
			},
			{
				$sort: {
					__sortTime: 1,
				},
			},
			{
				$group: {
					_id: "$chartID",
					doc: { $first: "$$ROOT" },
				},
			},
			{
				$unset: ["doc.__sortTime"],
			},
		]);

		const scores = scoresAgg
			.map((e) => e.doc)
			.sort((a, b) => (a.timeAchieved ?? 0) - (b.timeAchieved ?? 0));

		return res.status(200).json({
			success: true,
			description: `Returned ${scores.length} scores for ${charts.length} charts.`,
			body: {
				songs,
				charts,
				scores,
				folder,
			},
		});
	}
);

export default router;
