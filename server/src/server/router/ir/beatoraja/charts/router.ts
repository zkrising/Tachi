import { ChartDocument, PBScoreDocument } from "tachi-common";
import { Router, RequestHandler } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import { TachiScoreDataToBeatorajaFormat } from "./convert-scores";
import { AssignToReqTachiData } from "utils/req-tachi-data";

const router: Router = Router({ mergeParams: true });

const GetChartDocument: RequestHandler = async (req, res, next) => {
	const chart = (await db.charts.bms.findOne({
		"data.hashSHA256": req.params.chartSHA256,
	})) as ChartDocument<"bms:7K" | "bms:14K"> | null;

	if (!chart) {
		return res.status(404).json({
			success: false,
			description: `Chart does not exist on IR yet.`,
		});
	}

	AssignToReqTachiData(req, { beatorajaChartDoc: chart });

	return next();
};

router.use(GetChartDocument);

/**
 * Retrieves scores for the given chart.
 * @name GET /ir/beatoraja/chart/:chartSHA256/scores
 */
router.get("/scores", async (req, res) => {
	const chart = req[SYMBOL_TachiData]!.beatorajaChartDoc!;

	const scores = (await db["personal-bests"].find({
		chartID: chart.chartID,
	})) as PBScoreDocument<"bms:7K" | "bms:14K">[];

	const userDocs = await db.users.find(
		{
			id: { $in: scores.map((e) => e.userID) },
		},
		{
			projection: {
				id: 1,
				username: 1,
			},
		}
	);

	const userMap = new Map();
	for (const user of userDocs) {
		userMap.set(user.id, user);
	}

	const beatorajaScores = [];

	for (const score of scores) {
		beatorajaScores.push(
			TachiScoreDataToBeatorajaFormat(
				score,
				chart.data.hashSHA256,
				userMap.get(score.userID).username,
				chart.data.notecount,
				0 // Playcount is always 0 at the moment due to performance concerns.
			)
		);
	}

	return res.status(200).json({
		success: true,
		description: `Successfully returned ${beatorajaScores.length}`,
		body: beatorajaScores,
	});
});

export default router;
