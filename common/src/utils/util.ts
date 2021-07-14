import { AnyChartDocument, Game, Playtypes } from "..";
import { GetGameConfig } from "../config/config";

export function FormatDifficulty(chart: AnyChartDocument, game: Game): string {
	const gameConfig = GetGameConfig(game);
	if (gameConfig.validPlaytypes.length > 1) {
		return `${chart.playtype} ${chart.difficulty} ${chart.level}`;
	}

	return `${chart.difficulty}`;
}

export function FormatGame(game: Game, playtype: Playtypes[Game]): string {
	const gameConfig = GetGameConfig(game);

	if (gameConfig.validPlaytypes.length === 1) {
		return gameConfig.name;
	}

	return `${gameConfig.name} (${playtype})`;
}
