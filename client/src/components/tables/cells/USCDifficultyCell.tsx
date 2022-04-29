import { ChangeOpacity } from "util/color-opacity";
import { FormatTables } from "util/misc";
import QuickTooltip from "components/layout/misc/QuickTooltip";
import Icon from "components/util/Icon";
import React from "react";
import { ChartDocument, COLOUR_SET, GetGamePTConfig } from "tachi-common";
import TierlistInfoPart from "./TierlistInfoPart";

export default function USCDifficultyCell({
	chart,
}: {
	chart: ChartDocument<"usc:Controller" | "usc:Keyboard">;
}) {
	const levelText = chart.data.isOfficial
		? `${chart.difficulty} ${chart.level}`
		: FormatTables(chart.data.tableFolders);

	const gptConfig = GetGamePTConfig("usc", chart.playtype);

	const bgColour = ChangeOpacity(
		chart.data.isOfficial ? gptConfig.difficultyColours[chart.difficulty]! : COLOUR_SET.red,
		0.2
	);

	return (
		<td
			style={{
				backgroundColor: bgColour,
			}}
		>
			<span>{levelText}</span>
			<TierlistInfoPart chart={chart} game="usc" />
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
