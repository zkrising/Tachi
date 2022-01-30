import QuickTooltip from "components/layout/misc/QuickTooltip";
import Icon from "components/util/Icon";
import React from "react";
import {
	ChartDocument,
	FormatDifficulty,
	FormatDifficultyShort,
	Game,
	GetGamePTConfig,
} from "tachi-common";
import { ChangeOpacity } from "util/color-opacity";
import BMSPMSDifficultyCell from "./BMSDifficultyCell";
import TierlistInfoPart from "./TierlistInfoPart";

export default function DifficultyCell({
	game,
	chart,
	alwaysShort,
}: {
	game: Game;
	chart: ChartDocument;
	alwaysShort?: boolean;
}) {
	const gptConfig = GetGamePTConfig(game, chart.playtype);

	if (!gptConfig) {
		throw new Error(`Was passed nonsense combination of ${game}, ${chart.playtype}`);
	}

	if (game === "bms" || game === "pms") {
		return (
			<BMSPMSDifficultyCell
				chart={
					chart as ChartDocument<"bms:7K" | "bms:14K" | "pms:Keyboard" | "pms:Controller">
				}
				game={game}
			/>
		);
	}

	return (
		<td
			style={{
				backgroundColor: ChangeOpacity(gptConfig.difficultyColours[chart.difficulty]!, 0.2),
				minWidth: "80px",
			}}
		>
			{!alwaysShort && (
				<span className="d-none d-lg-block">{FormatDifficulty(chart, game)}</span>
			)}
			<span className={!alwaysShort ? "d-lg-none" : ""}>
				{FormatDifficultyShort(chart, game)}
			</span>
			{Object.keys(chart.tierlistInfo).length > 0 && (
				<TierlistInfoPart chart={chart} game={game} />
			)}
			{!chart.isPrimary && (
				<QuickTooltip tooltipContent="This chart is an alternate, old chart.">
					<div>
						<Icon type="exclamation-triangle" />
					</div>
				</QuickTooltip>
			)}
		</td>
	);
}
