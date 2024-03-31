import { ChangeOpacity } from "util/color-opacity";
import React from "react";

export default function OngekiLampCell({
	lamp1,
	lamp2,
	colour,
}: {
	lamp1: string;
	lamp2: string;
	colour: string;
}) {
	// eslint-disable-next-line no-param-reassign
	lamp1 = lamp1.replace(/ /gu, "\u00A0");
	// eslint-disable-next-line no-param-reassign
	lamp2 = lamp2.replace(/ /gu, "\u00A0");

	let content = <div>{lamp1}</div>;

	if (lamp2 !== "NONE") {
		if (lamp1 === "CLEAR") {
			content = <div>{lamp2}</div>;
		} else {
			content = (
				<span>
					<div>{lamp1}</div>
					<div>{lamp2}</div>
				</span>
			);
		}
	}

	return (
		<td
			style={{
				backgroundColor: ChangeOpacity(colour, 0.2),
			}}
		>
			<strong>{content}</strong>
		</td>
	);
}
