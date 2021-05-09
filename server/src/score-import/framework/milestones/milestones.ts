import { KtLogger } from "../../../types";
import {
    integer,
    Game,
    Playtypes,
    GoalImportInfo,
    UserMilestoneDocument,
    MilestoneImportInfo,
} from "kamaitachi-common";
import db from "../../../db/db";
import { ProcessMilestoneFromGII } from "../../../core/milestone-core";
import { BulkWriteUpdateOneOperation } from "mongodb";

export async function UpdateUsersMilestones(
    importGoalInfo: GoalImportInfo[],
    game: Game,
    playtypes: Playtypes[Game][],
    userID: integer,
    logger: KtLogger
) {
    let userGoalInfoMap: Map<string, GoalImportInfo["new"]> = new Map();

    let goalIDs = [];
    for (const e of importGoalInfo) {
        userGoalInfoMap.set(e.goalID, e.new);
        goalIDs.push(e.goalID);
    }

    let { milestones, userMilestones } = await GetRelevantMilestones(
        goalIDs,
        game,
        playtypes,
        userID,
        logger
    );

    // create a map here to avoid linear searching when
    // co-iterating
    let userMilestoneMap = new Map();
    for (const um of userMilestones) {
        userMilestoneMap.set(um.milestoneID, um);
    }

    let importGoalMap = new Map();

    for (const ig of importGoalInfo) {
        importGoalMap.set(ig.goalID, ig.new);
    }

    let bwrite: BulkWriteUpdateOneOperation<UserMilestoneDocument>[] = [];

    let importMilestoneInfo: MilestoneImportInfo[] = [];

    for (const milestone of milestones) {
        let { achieved, progress } = ProcessMilestoneFromGII(milestone, importGoalMap);

        let userMilestone = userMilestoneMap.get(milestone.milestoneID);

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

        if (progress !== userMilestone.progress) {
            importMilestoneInfo.push({
                milestoneID: userMilestone.milestoneID,
                old: {
                    progress: userMilestone.progress,
                    achieved: userMilestone.achieved,
                },
                new: {
                    progress,
                    achieved,
                },
            });
        }

        if (achieved && !userMilestone.achieved) {
            // @todo emit some sort of event
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
    let userMilestones = await db["user-milestones"].find({
        game,
        playtype: { $in: playtypes },
        userID,
    });

    logger.debug(`Found ${userMilestones.length} user-milestones.`);

    let milestones = await db.milestones.find({
        milestoneID: { $in: userMilestones.map((e) => e.milestoneID) },
        "milestoneData.goals.goalID": { $in: goalIDs },
    });

    logger.debug(`Found ${milestones.length} relevant milestones.`);

    return { userMilestones, milestones };
}
