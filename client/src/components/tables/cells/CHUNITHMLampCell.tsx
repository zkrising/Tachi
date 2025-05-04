import { ChangeOpacity } from "util/color-opacity";
import React from "react";
import { GetEnumValue } from "tachi-common/types/metrics";

export default function CHUNITHMLampCell({
	noteLamp,
	clearLamp,
	noteLampColour,
	clearLampColour,
}: {
	clearLamp: GetEnumValue<"chunithm:Single", "clearLamp">;
	noteLamp: GetEnumValue<"chunithm:Single", "noteLamp">;
	noteLampColour: string;
	clearLampColour: string;
}) {
	let content = <div>{clearLamp}</div>;
	let background = ChangeOpacity(clearLampColour, 0.2);

	if (noteLamp !== "NONE") {
		background = ChangeOpacity(noteLampColour, 0.2);

		if (clearLamp === "CLEAR") {
			content = <div>{noteLamp}</div>;
		} else {
			const clearLampLow = ChangeOpacity(clearLampColour, 0.2);
			const noteLampLow = ChangeOpacity(noteLampColour, 0.2);

			background = `linear-gradient(-45deg, ${clearLampLow} 0%, ${clearLampLow} 12%, ${noteLampLow} 12%, ${noteLampLow} 100%)`;

			content = (
				<span>
					<div>{noteLamp}</div>
					<div>{clearLamp}</div>
				</span>
			);
		}
	}

	return (
		<td
			style={{
				background,
				whiteSpace: "nowrap",
			}}
		>
			<strong>{content}</strong>
		</td>
	);
}
