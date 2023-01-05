import { GetGameConfig, GetGamePTConfig, GetSpecificGPTConfig } from "../config/config";
import type {
	ChartDocument,
	GPTStrings,
	Game,
	PBScoreDocument,
	Playtypes,
	SongDocument,
} from "../types";
import type { PrudenceSchema, ValidSchemaValue } from "prudence";
import type { AnyZodObject } from "zod";

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
		const ch = chart as ChartDocument<GPTStrings["gitadora"]>;

		const gptConfig = GetSpecificGPTConfig<GPTStrings["gitadora"]>(
			game,
			chart.playtype as Playtypes["gitadora"]
		);

		// @ts-expect-error maybe this new config format was a mistake.
		// it's complaining that since the dora config doesn't have shorthand for
		// "BASS BASIC", this assignment may fail.
		// it's technically correct, but in the worst way, since this isn't
		// actually possible.
		// todo: come up with something better.
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const shortDiff = gptConfig.difficulties.difficultyShorthand[ch.difficulty];

		// gitadora should always use short diffs. they just look better.
		return `${shortDiff} ${chart.level}`;
	}

	const gameConfig = GetGameConfig(game);

	if (gameConfig.playtypes.length > 1) {
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

	if (gptConfig.difficulties.type === "DYNAMIC") {
		// TODO cap string length
		return `${chart.difficulty} ${chart.level}`;
	}

	const shortDiff = gptConfig.difficulties.shorthand[chart.difficulty] ?? chart.difficulty;

	if (gameConfig.playtypes.length === 1 || game === "gitadora") {
		return `${shortDiff} ${chart.level}`;
	}

	if (game === "usc") {
		return `${chart.playtype === "Controller" ? "CON" : "KB"} ${shortDiff} ${chart.level}`;
	}

	return `${chart.playtype}${shortDiff} ${chart.level}`;
}

export function FormatGame(game: Game, playtype: Playtypes[Game]): string {
	const gameConfig = GetGameConfig(game);

	if (gameConfig.playtypes.length === 1) {
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
		const tables = (chart as ChartDocument<GPTStrings["bms"]>).data.tableFolders;

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
		const uscChart = chart as ChartDocument<GPTStrings["usc"]>;

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

	if (gameConfig.playtypes.length === 1) {
		playtypeStr = "";
	}

	const gptConfig = GetGamePTConfig(game, chart.playtype);

	let diff: string;

	if (gptConfig.difficulties.type === "DYNAMIC") {
		diff = chart.difficulty;
	} else {
		diff = gptConfig.difficulties.shorthand[chart.difficulty] ?? chart.difficulty;
	}

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

// For games with 'BP', show that next to the clear.
export function IIDXBMSLampGoalFormatter(pb: PBScoreDocument<GPTStrings["bms" | "iidx" | "pms"]>) {
	if (typeof pb.scoreData.additionalMetrics.bp === "number") {
		return `${pb.scoreData.lamp.string} (BP: ${pb.scoreData.additionalMetrics.bp})`;
	}

	return pb.scoreData.lamp;
}

/**
 * Run a zod schema inside prudence.
 */
export function PrudenceZodShim(zodSchema: AnyZodObject): ValidSchemaValue {
	return (self) => {
		const res = zodSchema.safeParse(self);

		if (res.success) {
			return true;
		}

		return res.error.message;
	};
}
