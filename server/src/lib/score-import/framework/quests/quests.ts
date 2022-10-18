import db from "external/mongo/db";
import { CalculateQuestOutOf, GetGoalIDsFromQuest } from "lib/targets/quests";
import { EmitWebhookEvent } from "lib/webhooks/webhooks";
import type { KtLogger } from "lib/logger/logger";
import type { BulkWriteUpdateOneOperation } from "mongodb";
import type {
	Game,
	GoalImportInfo,
	integer,
	QuestDocument,
	QuestImportInfo,
	Playtype,
	QuestSubscriptionDocument,
	GoalImportStat,
} from "tachi-common";

/**
 * Processes and updates a user's quests from their Goal Import Info (i.e. what is returned
 * about goals from imports)
 */
export function ProcessQuestFromGII(quest: QuestDocument, gii: Map<string, GoalImportInfo["new"]>) {
	const goalIDs = GetGoalIDsFromQuest(quest);

	let progress = 0;

	for (const goalID of goalIDs) {
		const userInfo = gii.get(goalID);

		if (!userInfo) {
			continue;
		}

		if (!userInfo.achieved) {
			continue;
		}

		progress++;
	}

	const outOf = CalculateQuestOutOf(quest);

	// quest achieved!
	if (progress >= outOf) {
		return { achieved: true, progress };
	}

	return { achieved: false, progress };
}

export async function UpdateUsersQuests(
	importGoalInfo: Array<GoalImportInfo>,
	game: Game,
	playtypes: Array<Playtype>,
	userID: integer,
	logger: KtLogger
) {
	const goalSubInfoMap: Map<string, GoalImportInfo["new"]> = new Map();

	const goalIDs = [];

	for (const e of importGoalInfo) {
		goalSubInfoMap.set(e.goalID, e.new);
		goalIDs.push(e.goalID);
	}

	const { quests, questSubs } = await GetRelevantQuests(goalIDs, game, playtypes, userID, logger);

	// create a map here to avoid linear searching when
	// co-iterating
	const questSubMap = new Map<string, QuestSubscriptionDocument>();

	for (const um of questSubs) {
		questSubMap.set(um.questID, um);
	}

	const importGoalMap = new Map<string, GoalImportStat>();

	for (const ig of importGoalInfo) {
		importGoalMap.set(ig.goalID, ig.new);
	}

	const bwrite: Array<BulkWriteUpdateOneOperation<QuestSubscriptionDocument>> = [];

	const importQuestInfo: Array<QuestImportInfo> = [];

	for (const quest of quests) {
		const { achieved, progress } = ProcessQuestFromGII(quest, importGoalMap);

		const questSub = questSubMap.get(quest.questID);

		if (!questSub) {
			logger.severe(
				`Invalid state achieved in quest processing - processed quest that user did not have? ${quest.questID}`
			);

			throw new Error("Invalid state achieved in quest processing.");
		}

		const bwriteOp: BulkWriteUpdateOneOperation<QuestSubscriptionDocument> = {
			updateOne: {
				filter: { questID: quest.questID },
				update: {
					$set: {
						achieved,
						progress,
					},
				},
			},
		};

		const questInfo = {
			questID: questSub.questID,
			old: {
				progress: questSub.progress,
				achieved: questSub.achieved,
			},
			new: {
				progress,
				achieved,
			},
		};

		if (progress !== questSub.progress) {
			importQuestInfo.push(questInfo);

			// @ts-expect-error This property isn't read only, because I said so.
			bwriteOp.updateOne.update.$set!.lastInteraction = Date.now();
		}

		bwrite.push(bwriteOp);

		if (achieved && !questSub.achieved) {
			void EmitWebhookEvent({
				type: "quest-achieved/v1",
				content: {
					userID,
					...questInfo,
					game,
					playtype: quest.playtype,
				},
			});
		}
	}

	if (bwrite.length !== 0) {
		await db["quest-subs"].bulkWrite(bwrite, { ordered: false });
	}

	return importQuestInfo;
}

async function GetRelevantQuests(
	goalIDs: Array<string>,
	game: Game,
	playtypes: Array<Playtype>,
	userID: integer,
	logger: KtLogger
) {
	const questSubs = await db["quest-subs"].find({
		game,
		playtype: { $in: playtypes },
		userID,
	});

	logger.debug(`Found ${questSubs.length} quest-subs.`);

	const quests = await db.quests.find({
		questID: { $in: questSubs.map((e) => e.questID) },
		"questData.goals.goalID": { $in: goalIDs },
	});

	logger.debug(`Found ${quests.length} relevant quests.`);

	return { questSubs, quests };
}
