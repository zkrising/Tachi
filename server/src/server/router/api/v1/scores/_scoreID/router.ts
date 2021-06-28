import { Router } from "express";
import db from "../../../../../../external/mongo/db";
import { SYMBOL_TachiData } from "../../../../../../lib/constants/tachi";
import CreateLogCtx from "../../../../../../lib/logger/logger";
import { GetUserWithID } from "../../../../../../utils/user";
import { RequirePermissions } from "../../../../../middleware/auth";
import prValidate from "../../../../../middleware/prudence-validate";
import { GetScoreFromParam, RequireOwnershipOfScore } from "./middleware";
import p from "prudence";

const router: Router = Router({ mergeParams: true });

const logger = CreateLogCtx(__filename);

router.use(GetScoreFromParam);

/**
 * Retrieve the score document at this ID.
 *
 * @param getRelated - Gets the related song and chart document for this score, aswell.
 *
 * @name GET /api/v1/scores/:scoreID
 */
router.get("/", async (req, res) => {
	const score = req[SYMBOL_TachiData]!.scoreDoc!;

	if (req.query.getRelated) {
		const [user, chart, song] = await Promise.all([
			GetUserWithID(score.userID),
			db.charts[score.game].findOne({ chartID: score.chartID }),
			db.songs[score.game].findOne({ id: score.songID }),
		]);

		if (!user || !chart || !song) {
			logger.error(
				`Score ${
					score.scoreID
				} refers to non-existant data: [user,chart,song] [${!!user} ${!!chart} ${!!song}]`
			);

			return res.status(500).json({
				success: false,
				description: `An internal server error has occured.`,
			});
		}

		return res.status(200).json({
			success: true,
			description: `Returned score.`,
			body: {
				score,
				user,
				song,
				chart,
			},
		});
	}

	return res.status(200).json({
		success: true,
		description: `Returned score.`,
		body: {
			score,
		},
	});
});

interface ModifiableScoreProps {
	comment?: string | null;
	highlight?: boolean;
}

/**
 * Modifies a score.
 *
 * Requires you to be the owner of this score, and have the modify_scores permission.
 *
 * @name PATCH /api/v1/scores/:scoreID
 */
router.patch(
	"/",
	RequireOwnershipOfScore,
	RequirePermissions("customise_score"),
	prValidate({
		comment: p.optional(p.nullable(p.isBoundedString(1, 120))),
		highlight: "*boolean",
	}),
	async (req, res) => {
		const score = req[SYMBOL_TachiData]!.scoreDoc!;

		const modifyOption: ModifiableScoreProps = {};

		if (req.body.comment !== undefined) {
			modifyOption.comment = req.body.comment;
		}

		if (req.body.highlight !== undefined) {
			modifyOption.highlight = req.body.highlight;
		}

		if (Object.keys(modifyOption).length === 0) {
			return res.status(400).json({
				success: false,
				description: `This request modifies nothing about the score.`,
			});
		}

		const newScore = await db.scores.findOneAndUpdate(
			{ scoreID: score.scoreID },
			{ $set: modifyOption }
		);

		return res.status(200).json({
			success: true,
			description: `Updated score.`,
			body: newScore,
		});
	}
);

export default router;
