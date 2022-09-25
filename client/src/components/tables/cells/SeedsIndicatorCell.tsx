import { ChangeOpacity } from "util/color-opacity";
import React from "react";
import { COLOUR_SET } from "tachi-common";
import { ChangeIndicator } from "types/seeds";

export default function SeedsIndicatorCell({ indicate }: { indicate: ChangeIndicator }) {
	if (indicate === "ADDED") {
		return (
			<td
				style={{
					backgroundColor: ChangeOpacity(COLOUR_SET.green, 0.2),
					borderRight: "1px black solid",
				}}
			>
				<strong>+</strong>
			</td>
		);
	} else if (indicate === "REMOVED") {
		return (
			<td
				style={{
					backgroundColor: ChangeOpacity(COLOUR_SET.red, 0.2),
					borderRight: "1px black solid",
				}}
			>
				<strong>-</strong>
			</td>
		);
	} else if (indicate === "MODIFIED") {
		return (
			<td
				style={{
					backgroundColor: ChangeOpacity(COLOUR_SET.orange, 0.2),
					borderRight: "1px black solid",
				}}
			>
				<strong>~</strong>
			</td>
		);
	}

	return <td />;
}
