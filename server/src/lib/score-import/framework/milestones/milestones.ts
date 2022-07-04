import db from "external/mongo/db";
import { CalculateMilestoneOutOf, GetGoalIDsFromMilestone } from "lib/targets/milestones";
import { EmitWebhookEvent } from "lib/webhooks/webhooks";
import type { KtLogger } from "lib/logger/logger";
import type { BulkWriteUpdateOneOperation } from "mongodb";
import type {
	Game,
	GoalImportInfo,
	integer,
	MilestoneDocument,
	MilestoneImportInfo,
	Playtype,
	MilestoneSubscriptionDocument,
	GoalImportStat,
} from "tachi-common";

/**
 * Processes and updates a user's milestones from their Goal Import Info (i.e. what is returned
 * about goals from imports)
 */
export function ProcessMilestoneFromGII(
	milestone: MilestoneDocument,
	gii: Map<string, GoalImportInfo["new"]>
) {
	const goalIDs = GetGoalIDsFromMilestone(milestone);

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

	const outOf = CalculateMilestoneOutOf(milestone);

	// milestone achieved!
	if (progress >= outOf) {
		return { achieved: true, progress };
	}

	return { achieved: false, progress };
}

export async function UpdateUsersMilestones(
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

	const { milestones, milestoneSubs } = await GetRelevantMilestones(
		goalIDs,
		game,
		playtypes,
		userID,
		logger
	);

	// create a map here to avoid linear searching when
	// co-iterating
	const milestoneSubMap = new Map<string, MilestoneSubscriptionDocument>();

	for (const um of milestoneSubs) {
		milestoneSubMap.set(um.milestoneID, um);
	}

	const importGoalMap = new Map<string, GoalImportStat>();

	for (const ig of importGoalInfo) {
		importGoalMap.set(ig.goalID, ig.new);
	}

	const bwrite: Array<BulkWriteUpdateOneOperation<MilestoneSubscriptionDocument>> = [];

	const importMilestoneInfo: Array<MilestoneImportInfo> = [];

	for (const milestone of milestones) {
		const { achieved, progress } = ProcessMilestoneFromGII(milestone, importGoalMap);

		const milestoneSub = milestoneSubMap.get(milestone.milestoneID);

		if (!milestoneSub) {
			logger.severe(
				`Invalid state achieved in milestone processing - processed milestone that user did not have? ${milestone.milestoneID}`
			);

			throw new Error("Invalid state achieved in milestone processing.");
		}

		const bwriteOp: BulkWriteUpdateOneOperation<MilestoneSubscriptionDocument> = {
			updateOne: {
				filter: { milestoneID: milestone.milestoneID },
				update: {
					$set: {
						achieved,
						progress,
					},
				},
			},
		};

		const milestoneInfo = {
			milestoneID: milestoneSub.milestoneID,
			old: {
				progress: milestoneSub.progress,
				achieved: milestoneSub.achieved,
			},
			new: {
				progress,
				achieved,
			},
		};

		if (progress !== milestoneSub.progress) {
			importMilestoneInfo.push(milestoneInfo);

			// @ts-expect-error This property isn't read only, because I said so.
			bwriteOp.updateOne.update.$set!.lastInteraction = Date.now();
		}

		bwrite.push(bwriteOp);

		if (achieved && !milestoneSub.achieved) {
			void EmitWebhookEvent({
				type: "milestone-achieved/v1",
				content: {
					userID,
					...milestoneInfo,
					game,
					playtype: milestone.playtype,
				},
			});
		}
	}

	if (bwrite.length !== 0) {
		await db["milestone-subs"].bulkWrite(bwrite, { ordered: false });
	}

	return importMilestoneInfo;
}

async function GetRelevantMilestones(
	goalIDs: Array<string>,
	game: Game,
	playtypes: Array<Playtype>,
	userID: integer,
	logger: KtLogger
) {
	const milestoneSubs = await db["milestone-subs"].find({
		game,
		playtype: { $in: playtypes },
		userID,
	});

	logger.debug(`Found ${milestoneSubs.length} milestone-subs.`);

	const milestones = await db.milestones.find({
		milestoneID: { $in: milestoneSubs.map((e) => e.milestoneID) },
		"milestoneData.goals.goalID": { $in: goalIDs },
	});

	logger.debug(`Found ${milestones.length} relevant milestones.`);

	return { milestoneSubs, milestones };
}
