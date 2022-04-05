import { ChartDocument, SongDocument, Game, IDStrings, Playtypes } from "..";
import { GetGameConfig, GetGamePTConfig } from "../config/config";
import { Grades, integer } from "../types";

export function FormatInt(v: number): string {
	return v.toString();
}

export function FormatDifficulty(chart: ChartDocument, game: Game): string {
	if (game === "bms" || game === "pms") {
		const bmsChart = chart as ChartDocument<"bms:7K" | "bms:14K">;
		return (
			bmsChart.data.tableFolders.map((e) => `${e.table}${e.level}`).join(", ") || "Unrated"
		);
	}

	const gameConfig = GetGameConfig(game);

	if (gameConfig.validPlaytypes.length > 1) {
		return `${chart.playtype} ${chart.difficulty} ${chart.level}`;
	}

	return `${chart.difficulty} ${chart.level}`;
}

/**
 * Formats a chart's difficulty into a shorter variant. This handles a lot of
 * game-specific strange edge cases.
 */
export function FormatDifficultyShort(chart: ChartDocument, game: Game): string {
	const gameConfig = GetGameConfig(game);
	const gptConfig = GetGamePTConfig(game, chart.playtype);
	const shortDiff = gptConfig.shortDifficulties[chart.difficulty] ?? chart.difficulty;

	if (game === "ddr") {
		return `${shortDiff}${chart.playtype}`;
	}

	if (gameConfig.validPlaytypes.length === 1 || game === "gitadora") {
		return `${shortDiff} ${chart.level}`;
	}

	if (game === "usc") {
		return `${chart.playtype === "Controller" ? "CON" : "KB"} ${shortDiff} ${chart.level}`;
	}

	return `${chart.playtype}${shortDiff} ${chart.level}`;
}

export function FormatGame(game: Game, playtype: Playtypes[Game]): string {
	const gameConfig = GetGameConfig(game);

	if (gameConfig.validPlaytypes.length === 1) {
		return gameConfig.name;
	}

	return `${gameConfig.name} (${playtype})`;
}

export function FormatChart(
	game: Game,
	song: SongDocument,
	chart: ChartDocument<IDStrings>
): string {
	if (game === "bms") {
		const tables = (chart as ChartDocument<"bms:7K" | "bms:14K">).data.tableFolders;

		const bmsSong = song as SongDocument<"bms">;

		let realTitle = bmsSong.title;

		if (bmsSong.data.subtitle) {
			realTitle += ` - ${bmsSong.data.subtitle}`;
		}

		if (bmsSong.data.genre) {
			realTitle += ` [${bmsSong.data.genre}]`;
		}

		if (tables.length === 0) {
			return realTitle;
		}

		return `${realTitle} (${tables.map((e) => `${e.table}${e.level}`).join(", ")})`;
	}

	const gameConfig = GetGameConfig(game);

	let playtypeStr = `${chart.playtype} `;

	if (gameConfig.validPlaytypes.length === 1) {
		playtypeStr = "";
	}

	// return the most recent version this chart appeared in if it
	// is not primary.
	if (!chart.isPrimary) {
		return `${song.title} (${playtypeStr}${chart.difficulty} ${chart.level} ${chart.versions[0]})`;
	}

	return `${song.title} (${playtypeStr}${chart.difficulty} ${chart.level})`;
}

export function AbsoluteGradeDelta<I extends IDStrings = IDStrings>(
	game: Game,
	playtype: Playtypes[Game],
	score: number,
	percent: number,
	gradeOrIndex: Grades[I] | integer
): number {
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
): { grade: string; delta: number } | null {
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
	formatNumFn: (n: number) => number = (s) => s
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
