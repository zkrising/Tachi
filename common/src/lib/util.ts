import { GetGamePTConfig } from "../config/config";
import { Grades, integer } from "../types";

const IIDXConfig = GetGamePTConfig("iidx", "SP");

export function CalculateGradeDeltaIIDX(
	cmpGrade: Grades["iidx:SP" | "iidx:DP"],
	score: integer,
	notecount: integer
): string {
	const cmpGradeIDX = IIDXConfig.grades.indexOf(cmpGrade);

	const cmpGradePercent = IIDXConfig.gradeBoundaries[cmpGradeIDX];

	const cmpScore = Math.ceil(notecount * (cmpGradePercent / 100));

	const delta = score - cmpScore;

	if (delta >= 0) {
		return `${cmpGrade}+${delta}`;
	} else {
		// negative numbers implicitly stringify with the - prefix
		return `${cmpGrade}${delta}`;
	}
}
