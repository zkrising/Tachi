import { ChangeOpacity } from "util/color-opacity";
import React from "react";
import { COLOUR_SET } from "tachi-common";

export default function OngekiLampCell({
	noteLamp,
	bellLamp,
	colour,
}: {
	noteLamp: "ALL BREAK" | "FULL COMBO" | "CLEAR" | "LOSS";
	bellLamp: "FULL BELL" | "NONE";
	colour: string;
}) {
	let content = <div>{noteLamp}</div>;

	if (bellLamp !== "NONE") {
		if (noteLamp === "CLEAR") {
			content = <div>{bellLamp}</div>;
		} else {
			content = (
				<span>
					<div>{noteLamp}</div>
					<div>{bellLamp}</div>
				</span>
			);
		}
	}

	const low = ChangeOpacity(colour, 0.2);
	const lowCorner = ChangeOpacity(COLOUR_SET.gold, 0.4);

	return (
		<td
			style={{
				background:
					bellLamp === "FULL BELL"
						? `linear-gradient(-45deg, ${lowCorner} 0%,${lowCorner} 12%,${low} 12%,${low} 100%)`
						: low,
				whiteSpace: "nowrap",
			}}
		>
			<strong>{content}</strong>
		</td>
	);
}
