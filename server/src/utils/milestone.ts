import { MilestoneDocument, integer } from "kamaitachi-common";

/**
 * Retrieves the goalID documents in a single array from the
 * nested structure of milestones.
 */
export function GetGoalIDsFromMilestone(milestone: MilestoneDocument) {
    // this sucks - maybe a nicer way to do this, because nested
    // maps are just ugly
    return milestone.milestoneData.map((e) => e.goals.map((e) => e.goalID)).flat(1);
}

/**
 * Work out how many goals need to be achieved for this
 * milestone to be considered completed.
 */
export function CalculateMilestoneOutOf(milestone: MilestoneDocument, goalIDs: string[]): integer {
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
