import { ChangeOpacity } from "util/color-opacity";
import React from "react";
import QuickTooltip from "components/layout/misc/QuickTooltip";

export default function IndicatorsCell({ highlight }: { highlight: boolean }) {
	if (highlight) {
		return (
			<QuickTooltip tooltipContent="This score has been highlighted!">
				<td
					style={{
						backgroundColor: ChangeOpacity("#e6a303", 0.5),
						maxWidth: 5,
					}}
				></td>
			</QuickTooltip>
		);
	}

	return (
		<td
			style={{
				backgroundColor: "#383838",
				maxWidth: 5,
			}}
		></td>
	);
}
