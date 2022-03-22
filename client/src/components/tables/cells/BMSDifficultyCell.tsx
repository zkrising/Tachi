import { ChangeOpacity } from "util/color-opacity";
import { FormatBMSTables } from "util/misc";
import QuickTooltip from "components/layout/misc/QuickTooltip";
import Icon from "components/util/Icon";
import React from "react";
import { ChartDocument, COLOUR_SET } from "tachi-common";
import TierlistInfoPart from "./TierlistInfoPart";

export default function BMSPMSDifficultyCell({
	chart,
	game,
}: {
	chart: ChartDocument<"bms:7K" | "bms:14K" | "pms:Controller" | "pms:Keyboard">;
	game: "bms" | "pms";
}) {
	const hasLevel = chart.data.tableFolders.length > 0;

	const levelText = hasLevel ? FormatBMSTables(chart.data.tableFolders) : "No Level";
	return (
		<td
			style={{
				backgroundColor: ChangeOpacity(hasLevel ? COLOUR_SET.red : COLOUR_SET.gray, 0.2),
			}}
		>
			<span>{levelText}</span>
			<TierlistInfoPart chart={chart} game={game} />
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
