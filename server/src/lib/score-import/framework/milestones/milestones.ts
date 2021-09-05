import { KtLogger } from "lib/logger/logger";
import {
	integer,
	Game,
	Playtypes,
	GoalImportInfo,
	UserMilestoneDocument,
	MilestoneImportInfo,
	MilestoneDocument,
} from "tachi-common";
import db from "external/mongo/db";
import { BulkWriteUpdateOneOperation } from "mongodb";
import { CalculateMilestoneOutOf, GetGoalIDsFromMilestone } from "utils/milestone";
import { EmitWebhookEvent } from "lib/webhooks/webhooks";

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

	const outOf = CalculateMilestoneOutOf(milestone, goalIDs);

	// milestone achieved!
	if (progress >= outOf) {
		return { achieved: true, progress };
	}

	return { achieved: false, progress };
}

export async function UpdateUsersMilestones(
	importGoalInfo: GoalImportInfo[],
	game: Game,
	playtypes: Playtypes[Game][],
	userID: integer,
	logger: KtLogger
) {
	const userGoalInfoMap: Map<string, GoalImportInfo["new"]> = new Map();

	const goalIDs = [];
	for (const e of importGoalInfo) {
		userGoalInfoMap.set(e.goalID, e.new);
		goalIDs.push(e.goalID);
	}

	const { milestones, userMilestones } = await GetRelevantMilestones(
		goalIDs,
		game,
		playtypes,
		userID,
		logger
	);

	// create a map here to avoid linear searching when
	// co-iterating
	const userMilestoneMap = new Map();
	for (const um of userMilestones) {
		userMilestoneMap.set(um.milestoneID, um);
	}

	const importGoalMap = new Map();

	for (const ig of importGoalInfo) {
		importGoalMap.set(ig.goalID, ig.new);
	}

	const bwrite: BulkWriteUpdateOneOperation<UserMilestoneDocument>[] = [];

	const importMilestoneInfo: MilestoneImportInfo[] = [];

	for (const milestone of milestones) {
		const { achieved, progress } = ProcessMilestoneFromGII(milestone, importGoalMap);

		const userMilestone = userMilestoneMap.get(milestone.milestoneID);

		if (!userMilestone) {
			logger.severe(
				`Invalid state achieved in milestone processing - processed milestone that user did not have? ${milestone.milestoneID}`
			);

			throw new Error("Invalid state achieved in milestone processing.");
		}

		bwrite.push({
			updateOne: {
				filter: { milestoneID: milestone.milestoneID },
				update: {
					$set: {
						achieved,
						progress,
					},
				},
			},
		});

		const milestoneInfo = {
			milestoneID: userMilestone.milestoneID,
			old: {
				progress: userMilestone.progress,
				achieved: userMilestone.achieved,
			},
			new: {
				progress,
				achieved,
			},
		};

		if (progress !== userMilestone.progress) {
			importMilestoneInfo.push(milestoneInfo);
		}

		if (achieved && !userMilestone.achieved) {
			EmitWebhookEvent({
				type: "milestone-achieved/v1",
				content: {
					userID,
					...milestoneInfo,
				},
			});
		}
	}

	if (bwrite.length !== 0) {
		await db["user-milestones"].bulkWrite(bwrite, { ordered: false });
	}

	return importMilestoneInfo;
}

async function GetRelevantMilestones(
	goalIDs: string[],
	game: Game,
	playtypes: Playtypes[Game][],
	userID: integer,
	logger: KtLogger
) {
	const userMilestones = await db["user-milestones"].find({
		game,
		playtype: { $in: playtypes },
		userID,
	});

	logger.debug(`Found ${userMilestones.length} user-milestones.`);

	const milestones = await db.milestones.find({
		milestoneID: { $in: userMilestones.map((e) => e.milestoneID) },
		"milestoneData.goals.goalID": { $in: goalIDs },
	});

	logger.debug(`Found ${milestones.length} relevant milestones.`);

	return { userMilestones, milestones };
}
