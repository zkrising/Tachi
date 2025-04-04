/* eslint-disable no-await-in-loop */
import db, { monkDB } from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { CreateScoreID } from "lib/score-import/framework/score-importing/score-id";
import UpdateScore from "lib/score-mutation/update-score";
import { CreateGoalID } from "lib/targets/goals";
import { GetGPTString } from "tachi-common";
import { UpdateAllPBs } from "utils/calculations/recalc-scores";
import { EfficientDBIterate } from "utils/efficient-db-iterate";
import type { ScoreDocument, GoalDocument, integer, GoalSubscriptionDocument } from "tachi-common";
import type { Migration } from "utils/types";

const logger = CreateLogCtx(__filename);

const OLD_LAMP_INDEXES = {
	FAILED: 0,
	CLEAR: 1,
	"FULL COMBO": 2,
	"ALL JUSTICE": 3,
	"ALL JUSTICE CRITICAL": 4,
} as const;

const NEW_CLEAR_LAMP_INDEXES = {
	FAILED: 0,
	CLEAR: 1,
	HARD: 2,
	BRAVE: 3,
	ABSOLUTE: 4,
	CATASTROPHY: 5,
} as const;

const NEW_CLEAR_LAMPS = ["FAILED", "CLEAR", "HARD", "BRAVE", "ABSOLUTE", "CATASTROPHY"] as const;

const NEW_COMBO_LAMP_INDEXES = {
	NONE: 0,
	"FULL COMBO": 1,
	"ALL JUSTICE": 2,
	"ALL JUSTICE CRITICAL": 3,
} as const;

const NEW_COMBO_LAMPS = ["NONE", "FULL COMBO", "ALL JUSTICE", "ALL JUSTICE CRITICAL"] as const;

async function FastUpdateSessions() {
	const sessions = await db.sessions.find({ game: "chunithm" });
	const newScoreIDRefs: Array<{ old: string; new: string }> = await monkDB
		.get("temp-update-map")
		.find({});
	const lookup = new Map(newScoreIDRefs.map((r) => [r.old, r.new]));

	await Promise.allSettled(
		sessions.map(async (session) => {
			const newScoreIDs: Array<string> = [];

			for (const oldScoreID of session.scoreIDs) {
				const newScoreID = lookup.get(oldScoreID);

				newScoreIDs.push(newScoreID ?? oldScoreID);
			}

			await db.sessions.update(
				{ sessionID: session.sessionID },
				{
					$set: { scoreIDs: newScoreIDs },
				}
			);
		})
	);
}

async function FastUpdateImports() {
	const sessions = await db.imports.find({ game: "chunithm" });
	const newScoreIDRefs: Array<{ old: string; new: string }> = await monkDB
		.get("temp-update-map")
		.find({});
	const lookup = new Map(newScoreIDRefs.map((r) => [r.old, r.new]));

	await Promise.allSettled(
		sessions.map(async (importDoc) => {
			const newScoreIDs: Array<string> = [];

			for (const oldScoreID of importDoc.scoreIDs) {
				const newScoreID = lookup.get(oldScoreID);

				newScoreIDs.push(newScoreID ?? oldScoreID);
			}

			await db.imports.update(
				{ importID: importDoc.importID },
				{
					$set: { scoreIDs: newScoreIDs },
				}
			);
		})
	);
}

const migration: Migration = {
	id: "chunithm-lamp-split",
	up: async () => {
		logger.info("Migrating CHUNITHM scores to new lamps...");
		await EfficientDBIterate(
			// @ts-expect-error filter assures we're getting only chuni scores
			db.scores,
			async (score: ScoreDocument<"chunithm:Single"> & { scoreData: { lamp?: string } }) => {
				// @ts-expect-error it does exist sometimes
				delete score._id;

				const oldLamp = score.scoreData.lamp;
				const newScore = {
					...score,
					scoreData: {
						...score.scoreData,
					},
				};

				// This score has already been migrated.
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (newScore.scoreData.clearLamp && newScore.scoreData.comboLamp) {
					return;
				}

				// If the old score had a combo lamp, we assume that the score was at least a clear.
				// While it is theoretically possible for there to be a failed all justice, the chance
				// is small.
				if (oldLamp === "FAILED" || oldLamp === "CLEAR") {
					newScore.scoreData.clearLamp = oldLamp;
					newScore.scoreData.comboLamp = "NONE";
				} else if (
					oldLamp === "FULL COMBO" ||
					oldLamp === "ALL JUSTICE" ||
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					oldLamp === "ALL JUSTICE CRITICAL"
				) {
					newScore.scoreData.clearLamp = "CLEAR";
					newScore.scoreData.comboLamp = oldLamp;
				}

				delete newScore.scoreData.lamp;

				const newScoreID = CreateScoreID(
					GetGPTString(score.game, score.playtype),
					newScore.userID,
					newScore,
					newScore.chartID
				);

				await monkDB.get("temp-update-map").insert({
					old: score.scoreID,
					new: newScoreID,
				});

				await UpdateScore(
					score,
					newScore,
					undefined,
					true, // skipUpdatingPBs because we'll do it after
					// all scores are guaranteeably correct.
					true // dangerously skip updating refs
					// as we're gonna do it ourselves
				);
			},
			(_scores) => Promise.resolve(),
			{
				game: "chunithm",
				"scoreData.comboLamp": { $exists: false },
				"scoreData.clearLamp": { $exists: false },
			}
		);

		logger.info("Reconstructing PBs...");
		const usersWithChuniScores = await db.scores.distinct("userID", { game: "chunithm" });

		await UpdateAllPBs(usersWithChuniScores, { game: "chunithm" });

		logger.info("Updating references to scores...");
		await FastUpdateSessions();
		await FastUpdateImports();

		await monkDB.get("temp-update-map").drop();

		logger.info("Updating stats showcase settings...");
		for (const lamp of ["FULL COMBO", "ALL JUSTICE", "ALL JUSTICE CRITICAL"] as const) {
			await db["game-settings"].update(
				{
					game: "chunithm",
					"preferences.stats.mode": "folder",
					"preferences.stats.metric": "lamp",
					"preferences.stats.gte": OLD_LAMP_INDEXES[lamp],
				},
				{
					$set: {
						"preferences.stats.$[e].metric": "comboLamp",
						"preferences.stats.$[e].gte": NEW_COMBO_LAMP_INDEXES[lamp],
					},
				},
				{
					arrayFilters: [
						{
							"e.mode": "folder",
							"e.metric": "lamp",
							"e.gte": OLD_LAMP_INDEXES[lamp],
						},
					],
				}
			);
		}

		for (const lamp of ["FAILED", "CLEAR"] as const) {
			await db["game-settings"].update(
				{
					game: "chunithm",
					"preferences.stats.mode": "folder",
					"preferences.stats.metric": "lamp",
					"preferences.stats.gte": OLD_LAMP_INDEXES[lamp],
				},
				{
					$set: {
						"preferences.stats.$[e].metric": "comboLamp",
						"preferences.stats.$[e].gte": NEW_CLEAR_LAMP_INDEXES[lamp],
					},
				},
				{
					arrayFilters: [
						{
							"e.mode": "folder",
							"e.metric": "lamp",
							"e.gte": OLD_LAMP_INDEXES[lamp],
						},
					],
				}
			);
		}

		logger.info("Updating goals...");

		await EfficientDBIterate(
			db.goals,
			async (goal: GoalDocument) => {
				const oldGoalID = goal.goalID;

				if (goal.criteria.value <= OLD_LAMP_INDEXES.CLEAR) {
					goal.criteria.key = "clearLamp";
					// goal.criteria.value remains unchanged
				} else {
					goal.criteria.key = "comboLamp";

					// old lamps have FC = 2, AJ = 3, AJC = 4
					// new comboLamps have FC = 1, AJ = 2, AJC = 3
					goal.criteria.value = goal.criteria.value - 1;
				}

				const newGoalID = CreateGoalID(
					goal.charts,
					goal.criteria,
					goal.game,
					goal.playtype
				);

				await db.goals.update(
					{ goalID: oldGoalID },
					{
						$set: {
							goalID: newGoalID,
							criteria: goal.criteria,
						},
					}
				);

				// @ts-expect-error it exists
				delete goal._id;

				await monkDB.get("temp-update-goal-map").insert({
					old: oldGoalID,
					new: newGoalID,
					goal,
				});
			},
			(_goals) => Promise.resolve(),
			{ game: "chunithm", "criteria.key": "lamp" }
		);

		logger.info("Updating goal subscriptions...");
		const updatedGoalIDs: Array<{ old: string; new: string; goal: GoalDocument }> = await monkDB
			.get("temp-update-goal-map")
			.find({});
		const updatedGoalIDMap = new Map(updatedGoalIDs.map((u) => [u.old, u]));

		await EfficientDBIterate(
			db["goal-subs"],
			(subscription: GoalSubscriptionDocument) => {
				// We're 100% sure the goal ID exists in updatedGoals due to the query.
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const goal = updatedGoalIDMap.get(subscription.goalID)!.goal;

				if (goal.criteria.key !== "clearLamp" && goal.criteria.key !== "comboLamp") {
					throw new Error(`Received invalid criteria key ${goal.criteria.key}`);
				}

				let newProgress: integer | null;
				let newProgressHuman: string;
				const newOutOfHuman =
					goal.criteria.key === "clearLamp"
						? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						  NEW_CLEAR_LAMPS[goal.criteria.value]!
						: // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						  NEW_COMBO_LAMPS[goal.criteria.value]!;

				if (subscription.progress === null) {
					newProgress = null;
					newProgressHuman = "NO DATA";
				} else if (goal.criteria.key === "clearLamp") {
					// Clamp back to CLEAR if the user has made better progress (e.g. FULL COMBO).
					newProgress = Math.min(NEW_CLEAR_LAMP_INDEXES.CLEAR, subscription.progress);
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					newProgressHuman = NEW_CLEAR_LAMPS[newProgress]!;
				} else {
					// Clamp back to NONE if the user has made worse progress (e.g. FAILED).
					// Otherwise, the -1 maps the old progress onto the new progress nicely:
					// CLEAR: 1 -> NONE: 0
					// FULL COMBO: 2 -> FULL COMBO: 1
					// ...
					newProgress = Math.min(NEW_COMBO_LAMP_INDEXES.NONE, subscription.progress - 1);
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					newProgressHuman = NEW_COMBO_LAMPS[newProgress]!;
				}

				return {
					userID: subscription.userID,
					goalID: subscription.goalID,
					progress: newProgress,
					progressHuman: newProgressHuman,
					outOf: goal.criteria.value,
					outOfHuman: newOutOfHuman,
				};
			},
			async (updates) => {
				await db["goal-subs"].bulkWrite(
					updates.map((u) => ({
						updateOne: {
							filter: {
								userID: u.userID,
								goalID: u.goalID,
							},
							update: {
								$set: {
									// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
									goalID: updatedGoalIDMap.get(u.goalID)!.new,
									progress: u.progress,
									progressHuman: u.progressHuman,
									outOf: u.outOf,
									outOfHuman: u.outOfHuman,
								},
							},
						},
					}))
				);
			},
			{ goalID: { $in: updatedGoalIDs.map((u) => u.old) } }
		);

		await monkDB.get("temp-update-goal-map").drop();
	},
	down: () => {
		throw new Error("Reverting this change is not possible.");
	},
};

export default migration;
