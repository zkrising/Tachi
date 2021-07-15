import React from "react";
import {
	AnyChartDocument,
	FormatDifficulty,
	FormatDifficultyShort,
	Game,
	GetGamePTConfig,
} from "tachi-common";
import { ChangeOpacity } from "util/color-opacity";

export default function DifficultyCell({ game, chart }: { game: Game; chart: AnyChartDocument }) {
	const gptConfig = GetGamePTConfig(game, chart.playtype);

	return (
		<td
			style={{
				backgroundColor: ChangeOpacity(gptConfig.difficultyColours[chart.difficulty]!, 0.2),
			}}
		>
			<span className="d-none d-lg-block">{FormatDifficulty(chart, game)}</span>
			<span className="d-lg-none">{FormatDifficultyShort(chart, game)}</span>
		</td>
	);
}
