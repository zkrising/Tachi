import { CreateGoalTitle as CreateGoalName, ValidateGoalChartsAndCriteria } from "./goal-utils";
import db from "external/mongo/db";
import fjsh from "fast-json-stable-hash";
import { SubscribeFailReasons } from "lib/constants/err-codes";
import CreateLogCtx from "lib/logger/logger";
import { GetGamePTConfig } from "tachi-common";
import { GetFolderChartIDs } from "utils/folder";
import { NotNullish } from "utils/misc";
import type { KtLogger } from "lib/logger/logger";
import type { FilterQuery } from "mongodb";
import type {
	Game,
	GoalDocument,
	GoalSubscriptionDocument,
	integer,
	PBScoreDocument,
	Playtype,
	QuestDocument,
	QuestSubscriptionDocument,
} from "tachi-common";

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
	playtype: Playtype
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

	switch (goal.criteria.mode) {
		case "single": {
			const res = await db["personal-bests"].findOne(scoreQuery);

			// hack, but guaranteed to work.
			const scoreDataKey = goal.criteria.key.split(".")[1] as
				| "gradeIndex"
				| "lampIndex"
				| "percent"
				| "score";

			const outOfHuman = HumaniseGoalProgress(
				goal.game,
				goal.playtype,
				goal.criteria.key,
				goal.criteria.value,
				null,
				true
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
		}

		case "absolute":
		case "proportion": {
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

		default: {
			// note that this seemingly nonsensical type assertion is because typescript has whittled down
			// goal.criteria (correctly) to 'never', but we want to log if something somehow ends up here (it shouldn't).
			logger.warn(
				`Invalid goal: ${goal.goalID}, unknown criteria.mode ${
					(goal.criteria as GoalDocument["criteria"]).mode
				}, ignoring.`
			);

			return null;
		}
	}
}

/**
 * Resolves the set of charts involved with this goal.
 *
 * @returns An array of chartIDs, except if the goal chart type is "any", in which case, it returns null.
 */
function ResolveGoalCharts(
	goal: GoalDocument
): Array<string> | Promise<Array<string>> | null | undefined {
	switch (goal.charts.type) {
		case "single":
			return [goal.charts.data];
		case "multi":
			return goal.charts.data;
		case "folder":
			return GetFolderChartIDs(goal.charts.data);
		case "any":
			return null;
		default:
			// @ts-expect-error This can't happen normally, but if it does, I want to
			// handle it properly.
			throw new Error(`Unknown goal.charts.type of ${goal.charts.type}`);
	}
}

type GoalKeys = GoalDocument["criteria"]["key"];

type PBWithBadPoor = PBScoreDocument<
	"bms:7K" | "bms:14K" | "iidx:DP" | "iidx:SP" | "pms:Controller" | "pms:Keyboard"
>;

export function HumaniseGoalProgress(
	game: Game,
	playtype: Playtype,
	key: GoalKeys,
	value: number,
	userPB: PBScoreDocument | null,
	isOutOf = false
): string {
	const gptConfig = GetGamePTConfig(game, playtype);

	switch (key) {
		case "scoreData.gradeIndex": {
			if (!gptConfig.grades[value]) {
				throw new Error(
					`Corrupt goal -- requested a grade of ${value}, which doesn't exist for this game.`
				);
			}

			if (isOutOf) {
				return `${gptConfig.grades[value]} (${gptConfig.gradeBoundaries[value]?.toFixed(
					2
				)}%)`;
			}

			return `${gptConfig.grades[value]} (${userPB?.scoreData.percent.toFixed(2) ?? "0"}%)`;
		}

		case "scoreData.lampIndex": {
			if (!gptConfig.lamps[value]) {
				throw new Error(
					`Corrupt goal -- requested a lamp of ${value}, which doesn't exist for this game.`
				);
			}

			// these games care about the BP as progress towards the goal
			if (userPB && (game === "iidx" || game === "bms" || game === "pms")) {
				return `${gptConfig.lamps[value]} (BP: ${
					(userPB as PBWithBadPoor).scoreData.hitMeta.bp ?? "N/A"
				})`;
			}

			// this game cares about where you died relative to the measures in the chart
			if (game === "itg") {
				return `${gptConfig.lamps[value]} (BP: ${
					(userPB as PBScoreDocument<"itg:Stamina">).scoreData.hitMeta.diedAt ?? "N/A"
				})`;
			}

			return NotNullish(gptConfig.lamps[value]);
		}

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
	playtype: Playtype
): Promise<GoalDocument> {
	// Throws if the charts or criteria are invalid somehow.
	await ValidateGoalChartsAndCriteria(charts, criteria, game, playtype);

	// @ts-expect-error It's complaining because the potential criteria types might mismatch.
	// they're right, but this is enforced by ValidateGoalChartsAndCriteria.
	const goalDocument: GoalDocument = {
		game,
		playtype,
		criteria,
		charts,
		goalID: CreateGoalID(charts, criteria, game, playtype),
		name: await CreateGoalName(charts, criteria, game, playtype),
	};

	return goalDocument;
}

/**
 * Subscribes a user to the provided goal document. Handles deduping goals naturally
 * and general good stuff.
 *
 * @param cancelIfAchieved - Don't subscribe to the goal if subscribing would cause
 * the user to immediately achieve the goal. This is disabled for quest subscriptions,
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

export function GetQuestsThatContainGoal(goalID: string) {
	return db.quests.find({
		"questData.goals.goalID": goalID,
	});
}

/**
 * Unsubscribing from a goal may not be legal, because the goal might be part of
 * a quest the user is subscribed to. This function returns all quests
 * and questSubs that a goal is attached to.
 *
 * If this query matches none, an empty array is returned.
 */
export async function GetParentQuestSubs(
	goalSub: GoalSubscriptionDocument
): Promise<Array<QuestSubscriptionDocument & { quest: QuestDocument }>> {
	const parents: Array<QuestSubscriptionDocument & { quest: QuestDocument }> = await db[
		"quest-subs"
	].aggregate([
		{
			// find all quests that this user is subscribed to
			$match: {
				userID: goalSub.userID,
				game: goalSub.game,
				playtype: goalSub.playtype,
			},
		},
		{
			// look up the parent quests
			$lookup: {
				from: "quests",
				localField: "questID",
				foreignField: "questID",
				as: "parentQuestSubs",
			},
		},
		{
			// then project it onto the $quest field. This will be null
			// if the quest has no parent, which we hopefully won't have
			// to consider (illegal)
			$set: {
				quest: { $arrayElemAt: ["$parentQuestSubs", 0] },
			},
		},
		{
			// then finally, filter to only quests that pertain to this goal.
			$match: {
				"quest.questData.goals.goalID": goalSub.goalID,
			},
		},
	]);

	return parents;
}

/**
 * Gets the goals the user has set for this game and playtype.
 * Then, filters it based on the chartIDs involved in this import.
 *
 * This optimisation allows users to have *lots* of goals, but only ever
 * evaluate the ones we need to.
 *
 * @param onlyUnachieved - optionally, pass "onlyUnachieved=true" to limit this to
 * only goals that the user has not achieved.
 * @param excludeAny - optionally, pass "excludeAny=true" to ignore goals that match
 * "any" chart.
 * @returns An array of Goals, and an array of goalSubs.
 */
export async function GetRelevantGoals(
	game: Game,
	userID: integer,
	chartIDs: Set<string>,
	logger: KtLogger,
	onlyUnachieved = false,
	excludeAny = false
): Promise<{ goals: Array<GoalDocument>; goalSubsMap: Map<string, GoalSubscriptionDocument> }> {
	const gsQuery: FilterQuery<GoalSubscriptionDocument> = {
		game,
		userID,
	};

	if (onlyUnachieved) {
		gsQuery.achieved = false;
	}

	const goalSubs = await db["goal-subs"].find(gsQuery);

	logger.verbose(`Found user has ${goalSubs.length} goals.`);

	if (!goalSubs.length) {
		return { goals: [], goalSubsMap: new Map() };
	}

	const goalIDs = goalSubs.map((e) => e.goalID);

	const chartIDsArr: Array<string> = [];

	for (const c of chartIDs) {
		chartIDsArr.push(c);
	}

	const promises = [
		// this gets the relevantGoals for direct and multi
		db.goals.find({
			"charts.type": { $in: ["single", "multi"] },
			"charts.data": { $in: chartIDsArr },
			goalID: { $in: goalIDs },
		}),
		GetRelevantFolderGoals(goalIDs, chartIDsArr),
	];

	if (!excludeAny) {
		promises.push(
			db.goals.find({
				"charts.type": "any",
				goalID: { $in: goalIDs },
			})
		);
	}

	const goals = await Promise.all(promises).then((r) => r.flat(1));

	const goalSet = new Set(goals.map((e) => e.goalID));

	const goalSubsMap: Map<string, GoalSubscriptionDocument> = new Map();

	for (const goalSub of goalSubs) {
		if (!goalSet.has(goalSub.goalID)) {
			continue;
		}

		// since these are guaranteed to be unique, lets make a hot map of goalID -> goalSubDocument, so we can
		// pull them in for post-processing and filter out the goalSubDocuments that aren't relevant.
		goalSubsMap.set(goalSub.goalID, goalSub);
	}

	return {
		goals,
		goalSubsMap,
	};
}

/**
 * Returns the set of goals where its folder contains any member
 * of chartIDsArr.
 */
export function GetRelevantFolderGoals(goalIDs: Array<string>, chartIDsArr: Array<string>) {
	// Slightly black magic - this is kind of like doing an SQL join.
	// it's weird to do this in mongodb, but this seems like the right
	// way to actually handle this.

	const result: Promise<Array<GoalDocument>> = db.goals.aggregate([
		{
			$match: {
				"charts.type": "folder",
				goalID: { $in: goalIDs },
			},
		},
		{
			$lookup: {
				from: "folder-chart-lookup",
				localField: "charts.data",
				foreignField: "folderID",
				as: "folderCharts",
			},
		},
		{
			$match: {
				"folderCharts.chartID": { $in: chartIDsArr },
			},
		},
		{
			$project: {
				folderCharts: 0,
			},
		},
	]);

	return result;
}
