import { ChangeOpacity } from "util/color-opacity";
import React from "react";
import { integer } from "tachi-common";

export default function ScoreCell({
	score,
	colour,
	grade,
	percent,
	scoreRenderFn,
}: {
	score?: integer;
	percent: number;
	grade: string;
	colour: string;
	showScore?: boolean;
	scoreRenderFn?: (s: number) => string;
}) {
	return (
		<td
			style={{
				backgroundColor: ChangeOpacity(colour, 0.2),
			}}
		>
			<strong>{grade}</strong>
			<br />
			{`${percent.toFixed(2)}%`}

			{score !== undefined && (
				<>
					<br />
					<small className="text-body-secondary">
						[{scoreRenderFn ? scoreRenderFn(score) : score}]
					</small>
				</>
			)}
		</td>
	);
}
