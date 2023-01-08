import { CreateGoalTitle as CreateGoalName, ValidateGoalChartsAndCriteria } from "./goal-utils";
import db from "external/mongo/db";
import fjsh from "fast-json-stable-hash";
import { SubscribeFailReasons } from "lib/constants/err-codes";
import CreateLogCtx from "lib/logger/logger";
import { FormatGame, GenericFormatGradeDelta, GetGamePTConfig } from "tachi-common";
import { GetFolderChartIDs } from "utils/folder";
import { IsNullish } from "utils/misc";
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

	// lets configure a "base" query for our requests.
	const scoreQuery: FilterQuery<PBScoreDocument> = {
		userID,
		game: goal.game,
		playtype: goal.playtype,

		// normally, this would be a VERY WORRYING line of code, but goal.criteria.key is guaranteed to be
		// within a specific set of fields.
		[goal.criteria.key]: { $gte: goal.criteria.value },
		chartID: { $in: chartIDs },
	};

	switch (goal.criteria.mode) {
		case "single": {
			const res = await db["personal-bests"].findOne(scoreQuery);

			// hack, but guaranteed to work.
			const scoreDataKey = goal.criteria.key.split(".")[1] as
				| "gradeIndex"
				| "lampIndex"
				| "percent"
				| "score";

			const outOfHuman = HumaniseGoalOutOf(
				goal.game,
				goal.playtype,
				goal.criteria.key,
				goal.criteria.value
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
						goal.criteria.value,
						res
					),
				};
			}

			// if we didn't find a PB that achieved the goal immediately
			// fetch the next best thing.
			const nextBestQuery: FilterQuery<PBScoreDocument> = {
				userID,
				game: goal.game,
				playtype: goal.playtype,
				chartID: { $in: chartIDs },
			};

			const nextBestScore = await db["personal-bests"].findOne(nextBestQuery, {
				sort: { [goal.criteria.key]: -1 },
			});

			// user has no scores on any charts in this set.
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
					goal.criteria.value,
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
				const totalChartCount = chartIDs.length;

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
				}, ignoring.`,
				{ goal }
			);

			return null;
		}
	}
}

/**
 * Resolves the set of charts involved with this goal.
 *
 * @returns An array of chartIDs.
 */
function ResolveGoalCharts(goal: GoalDocument): Array<string> | Promise<Array<string>> {
	switch (goal.charts.type) {
		case "single":
			return [goal.charts.data];
		case "multi":
			return goal.charts.data;
		case "folder":
			return GetFolderChartIDs(goal.charts.data);
		default:
			// @ts-expect-error This can't happen normally, but if it does, I want to
			// handle it properly.
			throw new Error(`Unknown goal.charts.type of ${goal.charts.type}`);
	}
}

type GoalKeys = GoalDocument["criteria"]["key"];

/**
 * Turn a users progress (i.e. their PB on a chart where the goal is "AAA $chart")
 * into a human-understandable string.
 *
 * This applies GPT-specific formatting in some cases, like appending 'bp' to
 * IIDX lamp goals.
 */
export function HumaniseGoalProgress(
	game: Game,
	playtype: Playtype,
	key: GoalKeys,
	goalValue: integer,
	userPB: PBScoreDocument
): string {
	switch (key) {
		case "scoreData.gradeIndex": {
			// for iidx, pms and bms we expect grade deltas (rarely) formatted like
			// AAA-1520
			// however, for other games (namely those that run with larger numbers)
			// we want to format this stuff like AA-172k.
			const fmtFn =
				game === "iidx" || game === "pms" || game === "bms"
					? undefined
					: (num: number) => Intl.NumberFormat("en", { notation: "compact" }).format(num);

			const goalGrade = GetGamePTConfig(game, playtype).grades[goalValue];

			if (!goalGrade) {
				throw new Error(
					`Invalid Goal -- Tried to get a grade with index '${goalValue}', but no such grade exists for ${FormatGame(
						game,
						playtype
					)}`
				);
			}

			const { lower, upper, closer } = GenericFormatGradeDelta(
				game,
				playtype,
				userPB.scoreData.score,
				userPB.scoreData.percent,
				userPB.scoreData.grade,
				fmtFn
			);

			// If this goal is, say, AAA $chart, and the user's deltas are AA+40, AAA-100
			// instead of picking the one with less delta from the grade (AA+40)
			// pick the one closest to the target grade.
			// Because sometimes this function wraps the grade operand in brackets
			// (see (MAX-)-50), we need a regexp for this.
			// eslint-disable-next-line @typescript-eslint/prefer-optional-chain
			if (upper && new RegExp(`\\(?${goalGrade}`, "u").exec(upper)) {
				return upper;
			}

			// for some reason, our TS compiler disagrees that this is non-nullable.
			// but my IDE thinks it is. Who knows.
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
			return closer === "lower" ? lower : upper!;
		}

		case "scoreData.lampIndex": {
			switch (game) {
				case "iidx":
				case "bms":
				case "pms": {
					// @ts-expect-error This is guaranteed to exist, we're going to ignore it.
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					const maybeBP: number | null | undefined = userPB.scoreData.optional.bp;

					// render BP if it exists
					if (!IsNullish(maybeBP)) {
						return `${userPB.scoreData.lamp} (BP: ${maybeBP})`;
					}

					break;
				}

				case "itg": {
					// @ts-expect-error This is guaranteed to exist, we're going to ignore it.
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					const maybeDiedAt: number | null | undefined = userPB.scoreData.optional.diedAt;

					// render diedAt if it exists as "FAILED (Died 25% in)"
					if (!IsNullish(maybeDiedAt)) {
						return `${userPB.scoreData.lamp} (Died ${maybeDiedAt.toFixed(0)}% in)`;
					}

					break;
				}

				// no special logic needed for these games, just render the lamp.
				case "chunithm":
				case "gitadora":
				case "jubeat":
				case "museca":
				case "popn":
				case "sdvx":
				case "usc":
				case "wacca":
				case "maimaidx":
			}

			// otherwise, just roll on.
			return userPB.scoreData.lamp;
		}

		case "scoreData.percent":
			return `${userPB.scoreData.percent.toFixed(2)}%`;
		case "scoreData.score":
			return userPB.scoreData.score.toLocaleString();
		default:
			throw new Error(`Broken goal - invalid key ${key}.`);
	}
}

/**
 * Turn a goal's "outOf" (i.e. HARD CLEAR; AAA or score=2450) into a human-understandable
 * string.
 */
export function HumaniseGoalOutOf(game: Game, playtype: Playtype, key: GoalKeys, value: number) {
	const gptConfig = GetGamePTConfig(game, playtype);

	switch (key) {
		case "scoreData.gradeIndex": {
			const grade = gptConfig.grades[value];

			if (!grade) {
				throw new Error(
					`Invalid goal: Requested a grade with index '${value}' for ${FormatGame(
						game,
						playtype
					)}, yet none existed?`
				);
			}

			return grade;
		}

		case "scoreData.lampIndex": {
			const lamp = gptConfig.lamps[value];

			if (!lamp) {
				throw new Error(
					`Invalid goal: Requested a lamp with index '${value}' for ${FormatGame(
						game,
						playtype
					)}, yet none existed?`
				);
			}

			return lamp;
		}

		case "scoreData.percent":
			return `${value.toFixed(2)}%`;
		case "scoreData.score":
			return value.toLocaleString();
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
 * @param isStandaloneAssigment - is this a "standalone assignment?", as in, not a
 * consequence of a quest assignment. Standalone assignments are not allowed to be
 * instantly-achieved. if they are, it will fail with
 * SubscribeFailReasons.ALREADY_ACHIEVED.
 *
 * Returns null if the user is already subscribed to this goal.
 */
export async function SubscribeToGoal(
	userID: integer,
	goalDocument: GoalDocument,
	isStandaloneAssignment: boolean
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
		// A quest trying to assign an already subscribed goal should know that.
		// (not that it cares)
		if (!isStandaloneAssignment) {
			return SubscribeFailReasons.ALREADY_SUBSCRIBED;
		}

		// if the user was already standalone-subscribed, ignore another standalone
		// assignment.
		if (userAlreadySubscribed.wasAssignedStandalone) {
			return SubscribeFailReasons.ALREADY_SUBSCRIBED;
		}

		// otherwise, this is a standalone assignment to a goal that was already assigned
		// as a consequence of a quest. Mark it as standalone
		await db["goal-subs"].update(
			{
				userID,
				goalID: goalDocument.goalID,
			},
			{
				$set: {
					wasAssignedStandalone: true,
				},
			}
		);

		// return this goal sub document, it's fast!
		return { ...userAlreadySubscribed, wasAssignedStandalone: true };
	}

	const result = await EvaluateGoalForUser(goalDocument, userID, logger);

	if (!result) {
		throw new Error(`Couldn't evaluate goal? See previous logs.`);
	}

	// standalone assignments shouldn't be allowed to assign instantly-achieved
	// goals
	if (result.achieved && isStandaloneAssignment) {
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
		game: goalDocument.game,
		playtype: goalDocument.playtype,
		goalID: goalDocument.goalID,
		achieved: result.achieved,
		wasInstantlyAchieved: result.achieved,
		wasAssignedStandalone: isStandaloneAssignment,
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
export async function GetQuestSubsWhichDependOnThisGoalSub(
	goalSub: GoalSubscriptionDocument
): Promise<Array<QuestSubscriptionDocument & { quest: QuestDocument }>> {
	const dependencies: Array<QuestSubscriptionDocument & { quest: QuestDocument }> = await db[
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

	return dependencies;
}

/**
 * Given a goalSub, unsubscribe from it.
 *
 * On success, this will return null. On failure, this will return a failure reason.
 * For example, if this goalSub has parent quests involved that prevent its removal, it
 * will return those as an array.
 *
 * @param preventStandaloneRemoval - Some goalsubs might be marked as "standalone". These
 * goals have been explicitly and deliberately assigned by the user, and should therefore
 * only be explicitly un-assigned.
 */
export async function UnsubscribeFromGoal(
	goalSub: GoalSubscriptionDocument,
	preventStandaloneRemoval: boolean
) {
	const dependencies = await GetGoalDependencies(goalSub);

	switch (dependencies.reason) {
		case "HAS_QUEST_DEPENDENCIES":
			// never remove a goalSub if it has quests depending on it
			return dependencies;

		case "WAS_STANDALONE": {
			// only prevent standalone removal if we're told to
			if (preventStandaloneRemoval) {
				return dependencies;
			}

			break;
		}

		// no handling necessary, orphaned goals should never happen.
		case "WAS_ORPHAN":
	}

	// if we have no reason to prevent the removal, remove it.
	await db["goal-subs"].remove({
		userID: goalSub.userID,
		goalID: goalSub.goalID,
	});

	return null;
}

/**
 * Get the reason why a goal was assigned to a user.
 * This is either "WAS_STANDALONE" -- the user assigned this goal directly and deliberately
 * or "HAS_QUEST_DEPENDENCIES" -- the user was assigned this goal as the consequence
 * of a quest subscription.
 *
 * Failing that, the goal will return "WAS_ORPHAN", there's no reason this goal
 * should be subscribed to the user -- it's safe to remove for any reason.
 */
export async function GetGoalDependencies(goalSub: GoalSubscriptionDocument) {
	const parentQuests = await GetQuestSubsWhichDependOnThisGoalSub(goalSub);

	if (parentQuests.length) {
		return {
			reason: "HAS_QUEST_DEPENDENCIES",
			parentQuests,
		} as const;
	}

	if (goalSub.wasAssignedStandalone) {
		return {
			reason: "WAS_STANDALONE",
		} as const;
	}

	return { reason: "WAS_ORPHAN" } as const;
}

/**
 * For a given UGPT, unsubscribe from all their goals that no longer have any parent,
 * for example, a quest was removed, now they are left with some stranded goals that we
 * don't want to keep around.
 */
export async function UnsubscribeFromOrphanedGoalSubs(
	userID: integer,
	game: Game,
	playtype: Playtype
) {
	const goalSubs = await db["goal-subs"].find({ game, playtype, userID });

	const maybeToRemove = await Promise.all(
		goalSubs.map(async (goalSub) => {
			const deps = await GetGoalDependencies(goalSub);

			if (deps.reason === "WAS_ORPHAN") {
				return goalSub.goalID;
			}

			return null;
		})
	);

	// impressive that ts can't resolve this without a cast
	const toRemove = maybeToRemove.filter((e) => e !== null) as Array<string>;

	if (toRemove.length > 0) {
		logger.info(
			`Removing ${toRemove.length} goals from user ${userID} on ${FormatGame(
				game,
				playtype
			)} as they were orphanned.`
		);

		await db["goal-subs"].remove({
			userID,
			goalID: { $in: toRemove },
		});
	}
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
 * @returns An array of Goals, and an array of goalSubs.
 */
export async function GetRelevantGoals(
	game: Game,
	userID: integer,
	chartIDs: Set<string>,
	logger: KtLogger,
	onlyUnachieved = false
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
