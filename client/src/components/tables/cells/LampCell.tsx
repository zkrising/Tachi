import { ChangeOpacity } from "util/color-opacity";
import React from "react";

export default function LampCell({ lamp, colour }: { lamp: string; colour: string }) {
	return (
		<td
			style={{
				backgroundColor: ChangeOpacity(colour, 0.2),
			}}
		>
			<strong>{lamp}</strong>
		</td>
	);
}
