import React from "react";
import { Difficulties, integer } from "tachi-common";

export default function OngekiPlatinumCell({
	score,
	maxScore,
	difficulty,
}: {
	score: integer;
	maxScore: integer;
	difficulty: Difficulties["ongeki:Single"];
}) {
	return difficulty === "MASTER" || difficulty === "LUNATIC" ? (
		<td>
			<strong>MAX-{maxScore - score}</strong>
			{score !== undefined && (
				<>
					<br />
					<small className="text-body-secondary">
						[{score}/{maxScore}]
					</small>
				</>
			)}
		</td>
	) : (
		<td>N/A</td>
	);
}
