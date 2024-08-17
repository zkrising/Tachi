import chalk from "chalk";
import { GoalDocument } from "tachi-common";
import { CreateGoalID, ReadCollection } from "../util";
import { FormatFunctions } from "./test-utils";

let success = 0;
let fails = 0;

const goals = ReadCollection("goals.json", true) as GoalDocument[];

for (const goal of goals) {
	const pretty = FormatFunctions.goals!(goal, null);

	const expectedGoalID = CreateGoalID(goal.charts, goal.criteria, goal.game, goal.playtype);

	if (expectedGoalID !== goal.goalID) {
		console.error(
			chalk.red(
				`[ERR] | ${pretty} | Expected goalID to be ${expectedGoalID}. Got ${goal.goalID}.`
			)
		);

		fails++;
	} else {
		success++;
	}
}

console.log(chalk[fails === 0 ? "green" : "red"](`[GOAL_ID]: ${success} good, ${fails} bad.`));

if (fails !== 0) {
	console.log(
		chalk.yellow("Run scripts/rerunners/fix-goal-ids.js to automatically fix these issues.")
	);
}

process.exit(fails !== 0 ? 1 : 0);
