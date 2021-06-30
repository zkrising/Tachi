import { FilterQuery } from "mongodb";
import { GetGamePTConfig, ScoreDocument } from "tachi-common";
import { Router } from "express";
import db from "../../../../../../../../../../../external/mongo/db";
import { SYMBOL_TachiData } from "../../../../../../../../../../../lib/constants/tachi";
import { GetFolderCharts, GetPBsOnFolder } from "../../../../../../../../../../../utils/folder";
import { ParseStrPositiveInt } from "../../../../../../../../../../../utils/string-checks";
import { GetFolderFromParam } from "../../../../../../../games/_game/_playtype/folders/middleware";

const router: Router = Router({ mergeParams: true });

router.use(GetFolderFromParam);

/**
 * Returns a users pbs on this folder.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/folders/:folderID
 */
router.get("/", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const folder = req[SYMBOL_TachiData]!.folderDoc!;

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

// note: this path is disgustingly long. :(
/**
 * Returns the users scores in order of when they met this criteria.
 *
 * @param criteriaType - either "lamp" or "grade".
 * @param crtieriaValue - An index for this lamp or grade.
 *
 * @name GET /api/v1/users/:userID/games/:game/:playtype/folders/:folderID/timeline
 */
router.get("/timeline", async (req, res) => {
	const user = req[SYMBOL_TachiData]!.requestedUser!;
	const folder = req[SYMBOL_TachiData]!.folderDoc!;
	const game = req[SYMBOL_TachiData]!.game!;
	const playtype = req[SYMBOL_TachiData]!.playtype!;
	const gptConfig = GetGamePTConfig(game, playtype);

	const intIndex = ParseStrPositiveInt(req.query.criteriaValue);

	const { songs, charts } = await GetFolderCharts(folder, {}, true);

	if (intIndex === null) {
		return res.status(400).json({
			success: false,
			description: `Invalid value for criteriaValue.`,
		});
	}

	const matchCriteria: FilterQuery<ScoreDocument> = {
		userID: user.id,
		game,
		playtype,
		chartID: { $in: charts.map((e) => e.chartID) },
	};

	if (req.query.criteriaType === "lamp") {
		if (!gptConfig.lamps[intIndex]) {
			return res.status(400).json({
				success: false,
				description: `Invalid index for this games' lamps.`,
			});
		}

		matchCriteria["scoreData.lampIndex"] = { $gte: intIndex };
	} else if (req.query.criteriaType === "grade") {
		if (!gptConfig.grades[intIndex]) {
			return res.status(400).json({
				success: false,
				description: `Invalid index for this games' grades.`,
			});
		}

		matchCriteria["scoreData.gradeIndex"] = { $gte: intIndex };
	} else {
		return res.status(400).json({
			success: false,
			description: `Invalid criteriaType. Expected "lamp" or "grade".`,
		});
	}

	// Returns a unique score per-chart that was the first score to achieve
	// this criteria on that chart.
	const scores = await db.scores
		.aggregate([
			{
				$match: matchCriteria,
			},
			{
				$sort: {
					timeAchieved: -1,
				},
			},
			{
				$group: {
					_id: "$chartID",
					doc: { $first: "$$ROOT" },
				},
			},
		])
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		.then((r) => r.map((e: any) => e.doc));

	return res.status(200).json({
		success: true,
		description: `Returned ${scores.length} scores for ${charts.length} charts.`,
		body: {
			songs,
			charts,
			scores,
		},
	});
});

export default router;
