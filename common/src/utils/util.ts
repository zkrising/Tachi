import { AnyChartDocument, Game, Playtypes } from "..";
import { GamePTConfig, GetGameConfig, GetGamePTConfig } from "../config/config";
import { Difficulties, IDStrings } from "../types";

export function FormatDifficulty(chart: AnyChartDocument, game: Game): string {
	const gameConfig = GetGameConfig(game);

	if (game === "bms") {
		return `${chart.playtype} ${chart.level}`;
	}

	if (gameConfig.validPlaytypes.length > 1) {
		return `${chart.playtype} ${chart.difficulty} ${chart.level}`;
	}

	return `${chart.difficulty}`;
}

/**
 * Formats a chart's difficulty into a shorter variant. This handles a lot of
 * game-specific strange edge cases.
 */
export function FormatDifficultyShort(chart: AnyChartDocument, game: Game): string {
	const gameConfig = GetGameConfig(game);
	const gptConfig = GetGamePTConfig(game, chart.playtype);
	const shortDiff = gptConfig.shortDifficulties[chart.difficulty] ?? chart.difficulty;

	if (game === "bms") {
		return `${chart.playtype} ${chart.level}`;
	}

	if (game === "gitadora" && chart.playtype === "Gita") {
		if (chart.difficulty.startsWith("BASS ")) {
			return shortDiff;
		}

		return `G-${shortDiff}`;
	}

	if (game === "ddr") {
		return `${shortDiff}${chart.playtype}`;
	}

	if (gameConfig.validPlaytypes.length === 1) {
		return shortDiff;
	}

	return `${chart.playtype} ${shortDiff}`;
}

export function FormatGame(game: Game, playtype: Playtypes[Game]): string {
	const gameConfig = GetGameConfig(game);

	if (gameConfig.validPlaytypes.length === 1) {
		return gameConfig.name;
	}

	return `${gameConfig.name} (${playtype})`;
}
