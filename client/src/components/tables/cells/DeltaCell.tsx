import React from "react";
import { GetGradeDeltas, GradeBoundary } from "tachi-common";

export default function DeltaCell({
	value,
	grade,
	gradeBoundaries,
}: {
	value: number;
	grade: string;
	gradeBoundaries: Array<GradeBoundary<string>>;
}) {
	if (value === 0) {
		return <td>N/A</td>;
	}

	// eslint-disable-next-line prefer-const
	let { lower, upper, closer } = GetGradeDeltas(gradeBoundaries, grade, value);

	// (max-)+20 is a stupid statistic. hard override it.
	if (lower.startsWith("(MAX-)+")) {
		closer = "upper";
	}

	if (closer === "upper") {
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
