import { Game, GetGamePTConfig, Grades, IDStrings, integer, Playtypes } from "tachi-common";

export function AbsoluteGradeDelta<I extends IDStrings = IDStrings>(
	game: Game,
	playtype: Playtypes[Game],
	score: number,
	percent: number,
	gradeOrIndex: Grades[I] | integer
) {
	const gptConfig = GetGamePTConfig(game, playtype);

	if (!gptConfig.gradeBoundaries) {
		return 0;
	}

	const maxScore = Math.round(score * (100 / percent));

	const gradeIndex =
		typeof gradeOrIndex === "number" ? gradeOrIndex : gptConfig.grades.indexOf(gradeOrIndex);

	const gradeScore = Math.ceil((gptConfig.gradeBoundaries[gradeIndex] / 100) * maxScore);

	return score - gradeScore;
}

export function RelativeGradeDelta<I extends IDStrings = IDStrings>(
	game: Game,
	playtype: Playtypes[Game],
	score: number,
	percent: number,
	grade: Grades[I],
	relativeIndex: integer
) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const nextGradeIndex = gptConfig.grades.indexOf(grade) + relativeIndex;

	if (nextGradeIndex < 0 || nextGradeIndex >= gptConfig.grades.length) {
		return null;
	}

	return {
		grade: gptConfig.grades[nextGradeIndex],
		delta: AbsoluteGradeDelta(game, playtype, score, percent, nextGradeIndex),
	};
}

function WrapGrade(grade: string) {
	if (grade.endsWith("-") || grade.endsWith("+")) {
		return `(${grade})`;
	}

	return grade;
}

export function GenericFormatGradeDelta<I extends IDStrings = IDStrings>(
	game: Game,
	playtype: Playtypes[Game],
	score: number,
	percent: number,
	grade: Grades[I],
	formatNumFn: (n: number) => number = s => s
): {
	lower: string;
	upper?: string;
	closer: "lower" | "upper";
} {
	const upper = RelativeGradeDelta(game, playtype, score, percent, grade, 1);
	const lower = AbsoluteGradeDelta(game, playtype, score, percent, grade);

	const formatLower = `${WrapGrade(grade)}+${formatNumFn(lower)}`;

	if (!upper) {
		return {
			lower: formatLower,
			closer: "lower",
		};
	}

	const formatUpper = `${WrapGrade(upper.grade)}${formatNumFn(upper.delta)}`;

	return {
		lower: formatLower,
		upper: formatUpper,
		closer: upper.delta + lower < 0 ? "lower" : "upper",
	};
}
