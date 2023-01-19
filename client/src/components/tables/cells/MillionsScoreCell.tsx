import { ChangeOpacity } from "util/color-opacity";
import { FormatMillions } from "util/misc";
import React from "react";
import { GetGamePTConfig, PBScoreDocument, ScoreDocument, integer } from "tachi-common";

export default function MillionsScoreCell({
	score,
	colour,
	grade,
}: {
	score: integer;
	grade: string;
	colour: string;
}) {
	return (
		<td
			style={{
				backgroundColor: ChangeOpacity(colour, 0.2),
			}}
		>
			<strong>{grade}</strong>
			<br />
			{FormatMillions(score)}
		</td>
	);
}
