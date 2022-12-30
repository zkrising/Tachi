import { GetGameConfig, GetGamePTConfig } from "../config/old-config";
import type { ChartDocument, Game, IDStrings, Playtypes, SongDocument } from "..";
import type { Grades, integer, PBScoreDocument } from "../types";
import type { PrudenceError } from "prudence";

export function FormatInt(v: number): string {
	return Math.floor(v).toFixed(0);
}

export function FormatDifficulty(chart: ChartDocument, game: Game): string {
	if (game === "bms" || game === "pms") {
		const bmsChart = chart as ChartDocument<"bms:7K" | "bms:14K">;

		return (
			bmsChart.data.tableFolders.map((e) => `${e.table}${e.level}`).join(", ") || "Unrated"
		);
	}

	if (game === "itg") {
		const itgChart = chart as ChartDocument<"itg:Stamina">;

		return `${itgChart.data.difficultyTag} ${itgChart.level}`;
	}

	if (game === "gitadora") {
		const gptConfig = GetGamePTConfig(game, chart.playtype);

		const shortDiff = gptConfig.shortDifficulties[chart.difficulty] ?? chart.difficulty;

		// gitadora should always use short diffs. they just look better.
		return `${shortDiff} ${chart.level}`;
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

	if (game === "itg") {
		const itgChart = chart as ChartDocument<"itg:Stamina">;

		return `S${itgChart.data.difficultyTag} ${chart.level}`;
	}

	const shortDiff = gptConfig.shortDifficulties[chart.difficulty] ?? chart.difficulty;

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
	chart: ChartDocument,
	short = false
): string {
	if (game === "bms") {
		const tables = (chart as ChartDocument<"bms:7K" | "bms:14K">).data.tableFolders;

		const bmsSong = song as SongDocument<"bms">;

		let realTitle = bmsSong.title;

		if (bmsSong.data.subtitle) {
			realTitle = `${realTitle} - ${bmsSong.data.subtitle}`;
		}

		if (bmsSong.data.genre) {
			realTitle = `${realTitle} [${bmsSong.data.genre}]`;
		}

		if (tables.length === 0) {
			return realTitle;
		}

		return `${realTitle} (${tables.map((e) => `${e.table}${e.level}`).join(", ")})`;
	} else if (game === "usc") {
		const uscChart = chart as ChartDocument<"usc:Controller" | "usc:Keyboard">;

		// If this chart isn't an official, render it differently
		if (!uscChart.data.isOfficial) {
			// Same as BMS. turn this into SongTitle (Keyboard MXM normal1, insane2)
			return `${song.title} (${chart.playtype} ${
				chart.difficulty
			} ${uscChart.data.tableFolders.map((e) => `${e.table}${e.level}`).join(", ")})`;
		} else if (uscChart.data.tableFolders.length !== 0) {
			// if this chart is an official **AND** is on tables (unlikely), render
			// it as so:

			// SongTitle (Keyboard MXM 17, normal1, insane2)
			return `${song.title} (${chart.playtype} ${chart.difficulty} ${
				chart.level
			}, ${uscChart.data.tableFolders.map((e) => `${e.table}${e.level}`).join(", ")})`;
		}

		// otherwise, it's just an official and should be rendered like any other game.
	} else if (game === "itg") {
		const itgChart = chart as ChartDocument<"itg:Stamina">;
		const itgSong = song as SongDocument<"itg">;

		return `${itgSong.title}${itgSong.data.subtitle ? ` ${itgSong.data.subtitle}` : ""} ${
			itgChart.data.difficultyTag
		} ${chart.level}`;
	}

	const gameConfig = GetGameConfig(game);

	let playtypeStr = `${chart.playtype}`;

	if (gameConfig.validPlaytypes.length === 1) {
		playtypeStr = "";
	}

	const gptConfig = GetGamePTConfig(game, chart.playtype);

	const diff = short
		? gptConfig.shortDifficulties[chart.difficulty] ?? chart.difficulty
		: chart.difficulty;

	// iidx formats things like SPA instead of SP A.
	// this is a hack, this should be part of the gptConfig, tbh.
	let space = "";

	if ((game === "iidx" && short) || !playtypeStr) {
		space = "";
	} else {
		space = " ";
	}

	// return the most recent version this chart appeared in if it
	// is not primary.
	if (!chart.isPrimary) {
		return `${song.title} (${playtypeStr}${space}${diff} ${chart.level} ${chart.versions[0]})`;
	}

	return `${song.title} (${playtypeStr}${space}${diff} ${chart.level})`;
}

export function AbsoluteGradeDelta<I extends IDStrings = IDStrings>(
	game: Game,
	playtype: Playtypes[Game],
	score: number,
	percent: number,
	gradeOrIndex: Grades[I] | integer
): number {
	const gptConfig = GetGamePTConfig(game, playtype);

	const maxScore = Math.round(score * (100 / percent));

	const gradeIndex =
		typeof gradeOrIndex === "number" ? gradeOrIndex : gptConfig.grades.indexOf(gradeOrIndex);

	const gradeValue = gptConfig.gradeBoundaries[gradeIndex];

	if (gradeValue === undefined) {
		throw new Error(`Grade Index ${gradeIndex} has no corresponding grade value?`);
	}

	const gradeScore = Math.ceil((gradeValue / 100) * maxScore);

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

	const nextGrade = gptConfig.grades[nextGradeIndex];

	if (nextGrade === undefined) {
		throw new Error(
			`Unexpectedly found no grade at index ${nextGradeIndex} for ${game} ${playtype}.`
		);
	}

	return {
		grade: nextGrade,
		delta: AbsoluteGradeDelta(game, playtype, score, percent, nextGradeIndex),
	};
}

function WrapGrade(grade: string) {
	if (grade.endsWith("-") || grade.endsWith("+")) {
		return `(${grade})`;
	}

	return grade;
}

type FormatGradeDeltaReturns =
	| {
			lower: string;
			upper: string;
			closer: "upper";
	  }
	| {
			lower: string;
			upper?: string;
			closer: "lower";
	  };

export function GenericFormatGradeDelta<I extends IDStrings = IDStrings>(
	game: Game,
	playtype: Playtypes[Game],
	score: number,
	percent: number,
	grade: Grades[I],
	formatNumFn: (n: number) => string = (s) => s.toString()
): FormatGradeDeltaReturns {
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

	// are we closer to the lower bound, or the upper one?
	let closer: "lower" | "upper" = upper.delta + lower < 0 ? "lower" : "upper";

	// lovely hardcoded exception for IIDX - (MAX-)+ is always a stupid metric
	// so always mute it.
	if (game === "iidx" && formatLower.startsWith("(MAX-)+")) {
		closer = "upper";
	}

	return {
		lower: formatLower,
		upper: formatUpper,
		closer,
	};
}

export function GetCloserGradeDelta<I extends IDStrings = IDStrings>(
	game: Game,
	playtype: Playtypes[Game],
	score: number,
	percent: number,
	grade: Grades[I],
	formatNumFn: (n: number) => string = (s) => s.toString()
): string {
	const { lower, upper, closer } = GenericFormatGradeDelta(
		game,
		playtype,
		score,
		percent,
		grade,
		formatNumFn
	);

	if (closer === "upper") {
		// this type assertion is unecessary in theory, but in practice older versions
		// of TS aren't happy with it.
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
		return upper as string;
	}

	return lower;
}

export function CreateSongMap<G extends Game = Game>(songs: Array<SongDocument<G>>) {
	const songMap = new Map<integer, SongDocument<G>>();

	for (const song of songs) {
		songMap.set(song.id, song);
	}

	return songMap;
}

export function CreateChartMap<I extends IDStrings = IDStrings>(charts: Array<ChartDocument<I>>) {
	const chartMap = new Map<string, ChartDocument<I>>();

	for (const chart of charts) {
		chartMap.set(chart.chartID, chart);
	}

	return chartMap;
}

/**
 * Formats a PrudenceError into something a little more readable.
 * @param err - The prudence error to format.
 * @param foreword - A description of what kind of error this was. Defaults to "Error".
 */
export function FormatPrError(err: PrudenceError, foreword = "Error"): string {
	const receivedText =
		typeof err.userVal === "object" && err.userVal !== null
			? ""
			: ` | Received ${err.userVal} [${err.userVal === null ? "null" : typeof err.userVal}]`;

	return `${foreword}: ${err.keychain} | ${err.message}${receivedText}.`;
}

// games that have funny relative grades, basically.
type IIDXBMSGPTs = "bms:7K" | "bms:14K" | "iidx:DP" | "iidx:SP" | "pms:Controller" | "pms:Keyboard";
export function IIDXBMSGradeGoalFormatter(pb: PBScoreDocument<IIDXBMSGPTs>) {
	const { closer, lower, upper } = GenericFormatGradeDelta(
		pb.game,
		pb.playtype,
		pb.scoreData.score,
		pb.scoreData.percent,
		pb.scoreData.grade
	);

	// if upper doesn't exist, we have to return lower (this is a MAX)
	// or something.
	if (!upper) {
		return lower;
	}

	// if the upper bound is relevant to the grade we're looking for
	// i.e. the goal is to AAA a chart and the user has AA+20/AAA-100
	// prefer AAA-100 instead of AA+20.
	if (upper.startsWith(`${pb.scoreData.grade}-`)) {
		return upper;
	}

	// otherwise, return whichever is closer.
	return closer === "lower" ? lower : upper;
}

export function GradeGoalFormatter(pb: PBScoreDocument) {
	const { closer, lower, upper } = GenericFormatGradeDelta(
		pb.game,
		pb.playtype,
		pb.scoreData.score,
		pb.scoreData.percent,
		pb.scoreData.grade
	);

	// if upper doesn't exist, we have to return lower (this is a MAX)
	// or something.
	if (!upper) {
		return lower;
	}

	// if the upper bound is relevant to the grade we're looking for
	// i.e. the goal is to AAA a chart and the user has AA+20/AAA-100
	// prefer AAA-100 instead of AA+20.
	if (upper.startsWith(`${pb.scoreData.grade}-`)) {
		return upper;
	}

	// otherwise, return whichever is closer.
	return closer === "lower" ? lower : upper;
}

// For games with 'BP', show that next to the clear.
export function IIDXBMSLampGoalFormatter(pb: PBScoreDocument<IIDXBMSGPTs>) {
	if (typeof pb.scoreData.hitMeta.bp === "number") {
		return `${pb.scoreData.lamp} (BP: ${pb.scoreData.hitMeta.bp})`;
	}

	return pb.scoreData.lamp;
}
