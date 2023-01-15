import { ChangeOpacity } from "util/color-opacity";
import { FormatTables } from "util/misc";
import QuickTooltip from "components/layout/misc/QuickTooltip";
import Icon from "components/util/Icon";
import { GPT_CLIENT_IMPLEMENTATIONS } from "lib/game-implementations";
import { GPTClientImplementation } from "lib/types";
import React from "react";
import { COLOUR_SET, ChartDocument } from "tachi-common";
import RatingSystemPart from "./RatingSystemPart";

export default function USCDifficultyCell({
	chart,
}: {
	chart: ChartDocument<"usc:Controller" | "usc:Keyboard">;
}) {
	const levelText = chart.data.isOfficial
		? `${chart.difficulty} ${chart.level}`
		: FormatTables(chart.data.tableFolders);

	const gptImpl = GPT_CLIENT_IMPLEMENTATIONS[
		`usc:${chart.playtype}`
	] as GPTClientImplementation<"usc:Controller">;

	const bgColour = ChangeOpacity(
		chart.data.isOfficial ? gptImpl.difficultyColours[chart.difficulty]! : COLOUR_SET.teal,
		0.2
	);

	return (
		<td
			style={{
				backgroundColor: bgColour,
			}}
		>
			<span>{levelText}</span>
			<RatingSystemPart chart={chart} game="usc" />
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
