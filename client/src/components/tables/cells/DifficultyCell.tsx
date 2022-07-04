import { ChangeOpacity } from "util/color-opacity";
import QuickTooltip from "components/layout/misc/QuickTooltip";
import Icon from "components/util/Icon";
import Muted from "components/util/Muted";
import React from "react";
import {
	ChartDocument,
	FormatDifficulty,
	FormatDifficultyShort,
	Game,
	GetGamePTConfig,
} from "tachi-common";
import BMSPMSDifficultyCell from "./BMSDifficultyCell";
import TierlistInfoPart from "./TierlistInfoPart";
import USCDifficultyCell from "./USCDifficultyCell";
import ITGDifficultyCell from "./ITGDifficultyCell";

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
	} else if (game === "usc") {
		return (
			<USCDifficultyCell chart={chart as ChartDocument<"usc:Controller" | "usc:Keyboard">} />
		);
	} else if (game === "itg") {
		return <ITGDifficultyCell chart={chart as ChartDocument<"itg:Stamina">} />;
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
			<DisplayLevelNum level={chart.level} levelNum={chart.levelNum} />
			{"isHot" in chart.data && chart.data.isHot && (
				<QuickTooltip tooltipContent="This chart is from the latest version of the game!">
					<div>
						<Icon type="fire" />
					</div>
				</QuickTooltip>
			)}
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

export function DisplayLevelNum({
	level,
	levelNum,
	prefix,
}: {
	levelNum: number;
	level: string;
	prefix?: string;
}) {
	// Don't display levelnum if its identical to the level, the decimal places in the
	// level end with .0, or the levelNum itself is 0.
	if (levelNum.toString() === level || level.endsWith(".0") || levelNum === 0) {
		return null;
	}

	return (
		<Muted>
			{prefix}
			{levelNum.toString()}
		</Muted>
	);
}
