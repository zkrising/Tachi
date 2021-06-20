import { GoalDocument, integer, PBScoreDocument, Game } from "tachi-common";
import { grades, lamps } from "tachi-common/js/config";
import db from "../../external/mongo/db";
import { KtLogger } from "../logger/logger";
import { GetFolderChartIDs } from "../../utils/folder";
import { FilterQuery } from "mongodb";
import fjsh from "fast-json-stable-hash";

export interface EvaluatedGoalReturn {
	achieved: boolean;
	progress: number | null;
	outOf: number;
	progressHuman: string;
	outOfHuman: string;
}

/**
 * Creates a goalID from a goals charts and criteria.
 *
 * This uses FJSH to stable-stringify the charts and criteria,
 * then hashes that string under sha256.
 *
 * @note We could do better here, by converting criteria
 * to 'similar' criteria - like 100% resolving to 1million score
 * but that proves very complex to implement when it comes
 * to multiple games.
 */
export function CreateGoalID(charts: GoalDocument["charts"], criteria: GoalDocument["criteria"]) {
	return fjsh.hash({ charts, criteria }, "sha256");
}

export async function EvaluateGoalForUser(
	goal: GoalDocument,
	userID: integer,
	logger: KtLogger
): Promise<EvaluatedGoalReturn | null> {
	// First, we need to resolve the set of charts this
	// goal involves.
	const chartIDs = await ResolveGoalCharts(goal);

	if (chartIDs === undefined) {
		logger.error(
			`Invalid goal ${goal.goalID} - has nonsense chartsType of ${goal.charts.type}, ignoring.`
		);
		return null;
	}

	// lets configure a "base" query for our requests.
	const scoreQuery: FilterQuery<PBScoreDocument> = {
		userID,
		// normally, this would be a VERY WORRYING line of code, but goal.criteria.key is guaranteed to be
		// within a specific set of fields.
		[goal.criteria.key]: { $gte: goal.criteria.value },
	};

	if (chartIDs) {
		scoreQuery.chartID = { $in: chartIDs };
	}

	// Next, we need to figure out our criteria.
	if (goal.criteria.mode === "single") {
		const res = await db["personal-bests"].findOne(scoreQuery);
		// hack, but guaranteed to work.
		const scoreDataKey = goal.criteria.key.split(".")[1] as
			| "lampIndex"
			| "gradeIndex"
			| "score"
			| "percent";

		const outOfHuman = HumaniseGoalProgress(
			goal.game,
			goal.criteria.key,
			goal.criteria.value,
			null
		);

		if (res) {
			return {
				achieved: true,
				outOf: goal.criteria.value,
				progress: res.scoreData[scoreDataKey],
				outOfHuman,
				progressHuman: HumaniseGoalProgress(
					goal.game,
					goal.criteria.key,
					res.scoreData[scoreDataKey],
					res
				),
			};
		}

		// if we weren't successful, we have to get the users next best score and put it up here
		// this is made infinitely easier by the existance of personal-bests.
		const nextBestQuery: FilterQuery<PBScoreDocument> = {
			userID,
		};

		if (chartIDs) {
			nextBestQuery.chartID = { $in: chartIDs };
		}

		const nextBestScore = await db["personal-bests"].findOne(nextBestQuery, {
			sort: { [goal.criteria.key]: -1 },
		});

		if (!nextBestScore) {
			return {
				achieved: false,
				outOf: goal.criteria.value,
				progress: null,
				outOfHuman,
				progressHuman: "NO DATA",
			};
		}

		return {
			achieved: false,
			outOf: goal.criteria.value,
			outOfHuman,
			progress: nextBestScore.scoreData[scoreDataKey],
			progressHuman: HumaniseGoalProgress(
				goal.game,
				goal.criteria.key,
				nextBestScore.scoreData[scoreDataKey],
				nextBestScore
			),
		};
	} else if (goal.criteria.mode === "abs" || goal.criteria.mode === "proportion") {
		let count;

		// abs -> Absolute mode, such as clear 10 charts.
		if (goal.criteria.mode === "abs") {
			count = goal.criteria.countNum;
		} else {
			// proportion -> Proportional mode, the value
			// is a multiplier for the amount of charts
			// available -- i.e. 0.1 * charts.

			let totalChartCount;

			if (chartIDs === null) {
				// edge case: proportion goals on "any"
				// charts (i.e. clear 20% of charts) need to
				// know how many charts the game has!
				totalChartCount = await db.charts[goal.game].count({ playtype: goal.playtype });
			} else {
				totalChartCount = chartIDs.length;
			}

			count = Math.floor(goal.criteria.countNum * totalChartCount);
		}

		const userCount = await db["personal-bests"].count(scoreQuery);

		return {
			achieved: userCount >= count,
			progress: userCount,
			outOf: count,
			progressHuman: userCount.toString(),
			outOfHuman: userCount.toString(),
		};
	}

	logger.error(
		`Invalid goal: ${goal.goalID}, unknown criteria.mode ${goal.criteria.mode}, ignoring.`
	);

	return null;
}

/**
 * Resolves the set of charts involved with this goal.
 * @param goal
 * @returns An array of chartIDs, except if the goal chart type is "any", in which case, it returns null.
 */
function ResolveGoalCharts(goal: GoalDocument): Promise<string[]> | string[] | null | undefined {
	if (goal.charts.type === "single") {
		return [goal.charts.data];
	} else if (goal.charts.type === "multi") {
		return goal.charts.data;
	} else if (goal.charts.type === "folder") {
		return GetFolderChartIDs(goal.charts.data);
	} else if (goal.charts.type === "any") {
		return null; // special case.
	}
}

type GoalKeys = GoalDocument["criteria"]["key"];

type IIDXOrBMSPB = PBScoreDocument<"iidx:SP" | "iidx:DP" | "bms:7K" | "bms:14K">;

// @todo, #100 improve this (add things like BP for iidx, maybe, percents for scores?)
export function HumaniseGoalProgress(
	game: Game,
	key: GoalKeys,
	value: number,
	userPB: PBScoreDocument | null
): string {
	switch (key) {
		case "scoreData.gradeIndex":
			return grades[game][value];
		case "scoreData.lampIndex":
			if (userPB && (game === "iidx" || game === "bms")) {
				return `${lamps[game][value]} (BP: ${
					(userPB as IIDXOrBMSPB).scoreData.hitMeta.bp ?? "N/A"
				})`;
			}
			return lamps[game][value];
		case "scoreData.percent":
			return `${value.toFixed(2)}%`;
		case "scoreData.score":
			return value.toString();
		default:
			throw new Error(`Broken goal - invalid key ${key}.`);
	}
}
