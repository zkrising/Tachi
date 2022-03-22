import { ChangeOpacity } from "util/color-opacity";
import React from "react";

export default function IndicatorsCell({ highlight }: { highlight: boolean }) {
	return (
		<td
			style={{
				backgroundColor: highlight ? ChangeOpacity("#e6a303", 0.5) : "#383838",
				maxWidth: 5,
			}}
		></td>
	);
}
