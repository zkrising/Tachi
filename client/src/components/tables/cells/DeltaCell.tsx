import React from "react";
import { Game, Grades, IDStrings, Playtypes } from "tachi-common";
import { GenericFormatGradeDelta } from "util/grade-deltas";

export default function DeltaCell({
	game,
	playtype,
	score,
	percent,
	grade,
}: {
	game: Game;
	playtype: Playtypes[Game];
	score: number;
	percent: number;
	grade: Grades[IDStrings];
}) {
	if (score === 0) {
		return <td>N/A</td>;
	}

	const { lower, upper, closer } = GenericFormatGradeDelta(game, playtype, score, percent, grade);

	let close = closer;

	// lovely hardcoded exception for IIDX - (MAX-)+ is always a stupid metric
	// so always mute it.
	if (game === "iidx" && lower.startsWith("(MAX-)+")) {
		close = "upper";
	}

	if (close === "upper") {
		return (
			<td>
				<strong>{upper}</strong>
				<br />
				<small className="text-muted">{lower}</small>
			</td>
		);
	} else {
		return (
			<td>
				<strong>{lower}</strong>
				<br />
				<small className="text-muted">{upper}</small>
			</td>
		);
	}
}
