import { RequestHandler, Router } from "express";
import db from "external/mongo/db";
import { SYMBOL_TachiData } from "lib/constants/tachi";
import { EvaluateMilestoneProgress, GetGoalsInMilestone } from "lib/targets/milestones";
import prValidate from "server/middleware/prudence-validate";
import { FormatGame } from "tachi-common";
import { AssignToReqTachiData, GetGPT } from "utils/req-tachi-data";
import { GetUsersWithIDs, ResolveUser } from "utils/user";

const router: Router = Router({ mergeParams: true });

const ResolveMilestoneID: RequestHandler = async (req, res, next) => {
	const { game, playtype } = GetGPT(req);
	const milestoneID = req.params.milestoneID;

	const milestone = await db.milestones.findOne({
		milestoneID,
		game,
		playtype,
	});

	if (!milestone) {
		return res.status(404).json({
			success: false,
			description: `A milestone with ID ${milestoneID} doesn't exist.`,
		});
	}

	AssignToReqTachiData(req, { milestoneDoc: milestone });

	return next();
};

/**
 * Retrieve information about this milestone and who is subscribed to it.
 *
 * @name GET /api/v1/games/:game/:playtype/targets/milestones/:milestoneID
 */
router.get("/:milestoneID", ResolveMilestoneID, async (req, res) => {
	const milestone = req[SYMBOL_TachiData]!.milestoneDoc!;

	const milestoneSubs = await db["milestone-subs"].find({
		milestoneID: milestone.milestoneID,
	});

	const users = await GetUsersWithIDs(milestoneSubs.map((e) => e.userID));

	const goals = await GetGoalsInMilestone(milestone);

	return res.status(200).json({
		success: true,
		description: `Retrieved information about ${milestone.name}.`,
		body: {
			milestone,
			milestoneSubs,
			users,
			goals,
		},
	});
});

/**
 * Evaluates a milestone upon a user, even if they aren't subscribed to it.
 *
 * @param userID - The userID to evaluate this goal against. Must be a player of this GPT.
 *
 * @name GET /api/v1/games/:game/:playtype/targets/milestones/:milestone-id/evaluate-for
 */
router.get(
	"/:milestoneID/evaluate-for",
	ResolveMilestoneID,
	prValidate({ userID: "string" }),
	async (req, res) => {
		const { game, playtype } = GetGPT(req);

		const userID = req.query.userID as string;

		const user = await ResolveUser(userID);

		if (!user) {
			return res.status(404).json({
				success: false,
				description: `The user ${userID} does not exist.`,
			});
		}

		const hasPlayed = await db["game-stats"].findOne({
			game,
			playtype,
			userID: user.id,
		});

		if (!hasPlayed) {
			return res.status(400).json({
				success: false,
				description: `The user ${user.username} hasn't played ${FormatGame(
					game,
					playtype
				)}.`,
			});
		}

		const milestone = req[SYMBOL_TachiData]!.milestoneDoc!;

		const milestoneProgress = await EvaluateMilestoneProgress(user.id, milestone);

		return res.status(200).json({
			success: true,
			description: `Evaluated ${milestone.name} for ${user.username}.`,
			body: milestoneProgress,
		});
	}
);

export default router;
