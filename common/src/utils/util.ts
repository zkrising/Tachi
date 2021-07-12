import { AnyChartDocument, Game } from "..";
import { GetGameConfig } from "../config/config";

export function FormatDifficulty(chart: AnyChartDocument, game: Game): string {
	const gameConfig = GetGameConfig(game);
	if (gameConfig.validPlaytypes.length > 1) {
		return `${chart.playtype} ${chart.difficulty} ${chart.level}`;
	}

	return `${chart.difficulty}`;
}
