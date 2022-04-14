import db from "external/mongo/db";
import fjsh from "fast-json-stable-hash";
import { SubscribeFailReasons } from "lib/constants/err-codes";
import CreateLogCtx, { KtLogger } from "lib/logger/logger";
import { FilterQuery } from "mongodb";
import {
	Game,
	GetGamePTConfig,
	GoalDocument,
	integer,
	PBScoreDocument,
	Playtypes,
	GoalSubscriptionDocument,
	MilestoneSubscriptionDocument,
	MilestoneDocument,
} from "tachi-common";
import { GetFolderChartIDs } from "utils/folder";
import { CreateGoalTitle as CreateGoalName, ValidateGoalChartsAndCriteria } from "./goal-utils";

const logger = CreateLogCtx(__filename);

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
export function CreateGoalID(
	charts: GoalDocument["charts"],
	criteria: GoalDocument["criteria"],
	game: Game,
	playtype: Playtypes[Game]
) {
	return `G${fjsh.hash({ charts, criteria, game, playtype }, "sha256")}`;
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
		game: goal.game,
		playtype: goal.playtype,
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
			goal.playtype,
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
					goal.playtype,
					goal.criteria.key,
					res.scoreData[scoreDataKey],
					res
				),
			};
		}

		// if we weren't successful, we have to get the users next best score and put it up here
		// this is made infinitely easier by the existence of personal-bests.
		const nextBestQuery: FilterQuery<PBScoreDocument> = {
			userID,
			game: goal.game,
			playtype: goal.playtype,
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
				goal.playtype,
				goal.criteria.key,
				nextBestScore.scoreData[scoreDataKey],
				nextBestScore
			),
		};
	} else if (goal.criteria.mode === "absolute" || goal.criteria.mode === "proportion") {
		let count;

		// abs -> Absolute mode, such as clear 10 charts.
		if (goal.criteria.mode === "absolute") {
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
			outOfHuman: count.toString(),
		};
	}

	logger.error(
		`Invalid goal: ${goal.goalID}, unknown criteria.mode ${goal.criteria.mode}, ignoring.`
	);

	return null;
}

/**
 * Resolves the set of charts involved with this goal.
 *
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

type PBWithBadPoor = PBScoreDocument<
	"iidx:SP" | "iidx:DP" | "bms:7K" | "bms:14K" | "pms:Controller" | "pms:Keyboard"
>;

export function HumaniseGoalProgress(
	game: Game,
	playtype: Playtypes[Game],
	key: GoalKeys,
	value: number,
	userPB: PBScoreDocument | null
): string {
	const gptConfig = GetGamePTConfig(game, playtype);

	switch (key) {
		case "scoreData.gradeIndex":
			return `${gptConfig.grades[value]} (${userPB?.scoreData.percent ?? "0"}%)`;
		case "scoreData.lampIndex":
			if (userPB && (game === "iidx" || game === "bms" || game === "pms")) {
				return `${gptConfig.lamps[value]} (BP: ${
					(userPB as PBWithBadPoor).scoreData.hitMeta.bp ?? "N/A"
				})`;
			}

			return gptConfig.lamps[value];
		case "scoreData.percent":
			return `${value.toFixed(2)}%`;
		case "scoreData.score":
			return value.toString();
		default:
			throw new Error(`Broken goal - invalid key ${key}.`);
	}
}

/**
 * Given some data about a goal, create a full Goal Document from it. This returns
 * the goal document on success, and throws/panics on error.
 *
 * @param criteria - The criteria for this goal.
 * @param charts - The set of charts relevant to this goal.
 */
export async function ConstructGoal(
	charts: GoalDocument["charts"],
	criteria: GoalDocument["criteria"],
	game: Game,
	playtype: Playtypes[Game]
): Promise<GoalDocument> {
	// Throws if the charts or criteria are invalid somehow.
	await ValidateGoalChartsAndCriteria(charts, criteria, game, playtype);

	return {
		game,
		playtype,
		timeAdded: Date.now(),
		criteria,
		charts,
		goalID: CreateGoalID(charts, criteria, game, playtype),
		name: await CreateGoalName(charts, criteria, game, playtype),
	} as GoalDocument;
}

/**
 * Subscribes a user to the provided goal document. Handles deduping goals naturally
 * and general good stuff.
 *
 * @param cancelIfAchieved - Don't subscribe to the goal if subscribing would cause
 * the user to immediately achieve the goal. This is disabled for milestone subscriptions,
 * but enabled for manual assignment.
 *
 * Returns null if the user is already subscribed to this goal.
 */
export async function SubscribeToGoal(
	userID: integer,
	goalDocument: GoalDocument,
	cancelIfAchieved = true
) {
	const goalExists = await db.goals.findOne({ goalID: goalDocument.goalID });

	if (!goalExists) {
		await db.goals.insert(goalDocument);
		logger.info(`Inserting new goal '${goalDocument.name}'.`);
	}

	const userAlreadySubscribed = await db["goal-subs"].findOne({
		userID,
		goalID: goalDocument.goalID,
	});

	if (userAlreadySubscribed) {
		return SubscribeFailReasons.ALREADY_SUBSCRIBED;
	}

	const result = await EvaluateGoalForUser(goalDocument, userID, logger);

	if (!result) {
		throw new Error(`Couldn't evaluate goal? See previous logs.`);
	}

	if (result.achieved && cancelIfAchieved) {
		return SubscribeFailReasons.ALREADY_ACHIEVED;
	}

	// @ts-expect-error TS can't resolve this.
	// because it can't explode out the types.
	const goalSub: GoalSubscriptionDocument = {
		outOf: result.outOf,
		outOfHuman: result.outOfHuman,
		progress: result.progress,
		progressHuman: result.progressHuman,
		userID,
		lastInteraction: null,
		timeAchieved: result.achieved ? Date.now() : null,
		timeSet: Date.now(),
		game: goalDocument.game,
		playtype: goalDocument.playtype,
		goalID: goalDocument.goalID,
		achieved: result.achieved,
		wasInstantlyAchieved: result.achieved,
	};

	await db["goal-subs"].insert(goalSub);

	return goalSub;
}

export function GetMilestonesThatContainGoal(goalID: string) {
	return db.milestones.find({
		"milestoneData.goals.goalID": goalID,
	});
}

/**
 * Unsubscribing from a goal may not be legal, because the goal might be part of
 * a milestone the user is subscribed to. This function returns all milestones
 * and milestoneSubs that a goal is attached to.
 *
 * If this query matches none, an empty array is returned.
 */
export async function GetBlockingParentMilestoneSubs(
	goalSub: GoalSubscriptionDocument
): Promise<(MilestoneSubscriptionDocument & { milestone: MilestoneDocument })[]> {
	const blockers = await db["milestone-subs"].aggregate([
		{
			// find all milestones that this user is subscribed to
			$match: {
				userID: goalSub.userID,
				game: goalSub.game,
				playtype: goalSub.playtype,
			},
		},
		{
			// look up the parent milestones
			$lookup: {
				from: "milestones",
				localField: "milestoneID",
				foreignField: "milestoneID",
				as: "parentMilestoneSubs",
			},
		},
		{
			// then project it onto the $milestone field. This will be null
			// if the milestone has no parent, which we hopefully won't have
			// to consider (illegal)
			$set: {
				milestone: { $arrayElemAt: ["$parentMilestoneSubs", 0] },
			},
		},
		{
			// then finally, filter to only milestones that pertain to this goal.
			$match: {
				"milestone.milestoneData.goals.goalID": goalSub.goalID,
			},
		},
	]);

	return blockers;
}
