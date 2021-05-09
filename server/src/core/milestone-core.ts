import {
    MilestoneDocument,
    UserMilestoneDocument,
    integer,
    GoalImportInfo,
} from "kamaitachi-common";

/**
 * Processes and updates a user's milestones from their Goal Import Info (i.e. what is returned
 * about goals from imports)
 */
export function ProcessMilestoneFromGII(
    milestone: MilestoneDocument,
    gii: Map<string, GoalImportInfo["new"]>
) {
    let goalIDs = GetGoalIDsFromMilestone(milestone);

    let progress = 0;

    for (const goalID of goalIDs) {
        let userInfo = gii.get(goalID);

        if (!userInfo) {
            continue;
        }

        if (!userInfo.achieved) {
            continue;
        }

        progress++;
    }

    let outOf = CalculateMilestoneOutOf(milestone, goalIDs);

    // milestone achieved!
    if (progress >= outOf) {
        return { achieved: true, progress };
    }

    return { achieved: false, progress };
}

/**
 * Retrieves the goalID documents in a single array from the
 * nested structure of milestones.
 */
function GetGoalIDsFromMilestone(milestone: MilestoneDocument) {
    // this sucks - maybe a nicer way to do this, because nested
    // maps are just ugly
    return milestone.milestoneData.map((e) => e.goals.map((e) => e.goalID)).flat(1);
}

/**
 * Work out how many goals need to be achieved for this
 * milestone to be considered completed.
 */
function CalculateMilestoneOutOf(milestone: MilestoneDocument, goalIDs: string[]): integer {
    if (milestone.criteria.type === "all") {
        return goalIDs.length;
    } else if (milestone.criteria.type === "abs") {
        if (milestone.criteria.value === null) {
            throw new Error(
                `Invalid milestone ${milestone.milestoneID} - abs and null are not compatible.`
            );
        }

        return milestone.criteria.value!;
    } else if (milestone.criteria.type === "proportion") {
        if (milestone.criteria.value === null) {
            throw new Error(
                `Invalid milestone ${milestone.milestoneID} - proportion and null are not compatible.`
            );
        }

        return Math.floor(milestone.criteria.value * goalIDs.length);
    }

    throw new Error(
        `Invalid milestone.criteria.type of ${milestone.criteria.type} -- milestoneID ${milestone.milestoneID}`
    );
}
