import React from "react";
import { Difficulties, integer } from "tachi-common";

export default function OngekiPlatinumCell({
	platScore: platScore,
	notecount: notecount,
	difficulty,
}: {
	platScore: integer | null | undefined;
	notecount: integer;
	difficulty: Difficulties["ongeki:Single"];
}) {
	if (difficulty !== "MASTER" && difficulty !== "LUNATIC") {
		return <td>N/A</td>;
	}

	if (platScore === null || platScore === undefined) {
		return <td>Unknown</td>;
	}

	const maxScore = notecount * 2;

	return (
		<td>
			<strong>MAX-{maxScore - platScore}</strong>
			{platScore !== undefined && (
				<>
					<br />
					<small className="text-body-secondary">
						[{platScore}/{maxScore}]
					</small>
				</>
			)}
		</td>
	);
}
