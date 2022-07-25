import { ChangeOpacity } from "util/color-opacity";
import React from "react";
import QuickTooltip from "components/layout/misc/QuickTooltip";

export default function IndicatorsCell({ highlight }: { highlight: boolean }) {
	return (
		<QuickTooltip
			tooltipContent={
				highlight
					? "This score has been highlighted!"
					: "This score has not been highlighted. If it was, this lamp lights up!"
			}
		>
			<td
				style={{
					backgroundColor: highlight ? ChangeOpacity("#e6a303", 0.5) : "#383838",
					maxWidth: 5,
				}}
			></td>
		</QuickTooltip>
	);
}
