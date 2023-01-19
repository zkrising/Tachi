import db from "external/mongo/db";
import { EditGoal } from "lib/targets/goals";
import type { FilterQuery } from "mongodb";
import type { GoalDocument } from "tachi-common";
import type { Migration } from "utils/types";

async function UpdateGoals(
	query: FilterQuery<GoalDocument>,
	newCriteriaKey: string,
	newCriteriaValue?: (goal: GoalDocument) => number
) {
	const goals = await db.goals.find(query);

	for (const oldGoal of goals) {
		// too lazy to parallelise this wrt. the quest changes.
		// ah well
		// eslint-disable-next-line no-await-in-loop
		await EditGoal(oldGoal, {
			...oldGoal,
			criteria: {
				...oldGoal.criteria,
				key: newCriteriaKey,
				value: newCriteriaValue?.(oldGoal) ?? oldGoal.criteria.value,
			},
		});
	}
}

function perToScore(goal: GoalDocument) {
	const v = goal.criteria.value / 100;

	switch (goal.game) {
		case "sdvx":
		case "usc":
			return v * 10_000_000;
		case "wacca":
		case "chunithm":
		case "museca":
			return v * 1_000_000;
		case "popn":
			return v * 100_000;
		case "iidx":
		case "bms":
		case "gitadora":
		case "jubeat":
		case "maimaidx":
		case "pms":
		case "itg":
			throw new Error(`Cannot convert this percent to score for game ${goal.game}`);
	}
}

const migration: Migration = {
	id: "v3-props",
	up: async () => {
		// no more clans
		await db.users.update(
			{},
			{
				$unset: { clan: 1 },
			},
			{ multi: true }
		);

		await db["game-settings"].update(
			{
				"preferences.defaultTable": { $exists: false },
			},
			{
				$set: {
					"preferences.defaultTable": null,
				},
			},
			{ multi: true }
		);
		await db["user-settings"].update(
			{
				"preferences.deletableScores": { $exists: false },
			},
			{
				$set: {
					"preferences.deletableScores": false,
				},
			},
			{ multi: true }
		);

		await db["game-settings"].update(
			{ "preferences.scoreBucket": { $exists: true } },
			{
				$rename: {
					"preferences.scoreBucket": "preferences.preferredDefaultEnum",
				},
			},
			{ multi: true }
		);

		await db["game-settings"].update(
			{
				"preferences.preferredDefaultEnum": { $exists: false },
			},
			{
				$set: {
					"preferences.preferredDefaultEnum": null,
				},
			},
			{ multi: true }
		);

		await db["game-settings"].update(
			{ "preferences.preferredScoreAlg": "ktRating" },
			{ $set: { "preferences.preferredScoreAlg": null } },
			{ multi: true }
		);
		await db["game-settings"].update(
			{ "preferences.preferredSessionAlg": "ktRating" },
			{ $set: { "preferences.preferredSessionAlg": null } },
			{ multi: true }
		);
		await db["game-settings"].update(
			{ "preferences.preferredProfileAlg": "ktRating" },
			{ $set: { "preferences.preferredProfileAlg": null } },
			{ multi: true }
		);

		const settings = await db["game-settings"].find({});

		for (const set of settings) {
			const newStats = [];

			for (const stat of set.preferences.stats) {
				if ("property" in stat) {
					newStats.push({
						...stat,
						metric: stat.property,
					});
				} else {
					newStats.push(stat);
				}
			}

			for (const stat of newStats) {
				// @ts-expect-error we're renaming the prop
				delete stat.property;
			}

			await db["game-settings"].update(
				{
					userID: set.userID,
					game: set.game,
					playtype: set.playtype,
				},
				{
					$set: { "preferences.stats": newStats },
				}
			);
		}

		await db.goals.update({}, { $unset: { timeAdded: 1 } }, { multi: true });

		const r = await db.goals.find({ "charts.type": "any" });

		await db["goal-subs"].remove({ goalID: { $in: r.map((e) => e.goalID) } });
		await db.goals.remove({ "charts.type": "any" });

		// score in these games is now percent
		await UpdateGoals(
			{
				game: { $in: ["gitadora", "maimaidx"] },
				"criteria.key": "scoreData.score",
			},
			"percent"
		);

		// percent no longer exists for these games
		await UpdateGoals(
			{
				game: { $in: ["sdvx", "usc", "wacca", "museca", "popn", "chunithm"] },
				"criteria.key": "scoreData.percent",
			},
			"score",
			perToScore
		);

		// obvious mappings
		await UpdateGoals({ "criteria.key": "scoreData.score" }, "score");
		await UpdateGoals({ "criteria.key": "scoreData.percent" }, "percent");
		await UpdateGoals({ "criteria.key": "scoreData.lampIndex" }, "lamp");
		await UpdateGoals({ "criteria.key": "scoreData.gradeIndex" }, "grade");
	},
	down: () => {
		throw new Error(`Reverting this change is not possible.`);
	},
};

export default migration;
