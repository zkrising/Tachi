import { ChangeOpacity } from "util/color-opacity";
import React from "react";
import { GetEnumValue } from "tachi-common/types/metrics";

export default function CHUNITHMLampCell({
	comboLamp,
	clearLamp,
	comboLampColour,
	clearLampColour,
}: {
	clearLamp: GetEnumValue<"chunithm:Single", "clearLamp">;
	comboLamp: GetEnumValue<"chunithm:Single", "comboLamp">;
	comboLampColour: string;
	clearLampColour: string;
}) {
	let content = <div>{clearLamp}</div>;
	let background = ChangeOpacity(clearLampColour, 0.2);

	if (comboLamp !== "NONE") {
		background = ChangeOpacity(comboLampColour, 0.2);

		if (clearLamp === "CLEAR") {
			content = <div>{comboLamp}</div>;
		} else {
			const clearLampLow = ChangeOpacity(clearLampColour, 0.2);
			const comboLampLow = ChangeOpacity(comboLampColour, 0.2);

			background = `linear-gradient(-45deg, ${clearLampLow} 0%, ${clearLampLow} 12%, ${comboLampLow} 12%, ${comboLampLow} 100%)`;

			content = (
				<span>
					<div>{comboLamp}</div>
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
