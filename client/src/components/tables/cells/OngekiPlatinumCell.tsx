import React from "react";
import { Difficulties, integer } from "tachi-common";

export default function OngekiPlatinumCell({
	platScore: platScore,
	maxPlatScore: maxPlatScore,
	difficulty,
}: {
	platScore: integer | null | undefined;
	maxPlatScore: integer;
	difficulty: Difficulties["ongeki:Single"];
}) {
	if (difficulty !== "MASTER" && difficulty !== "LUNATIC") {
		return <td>N/A</td>;
	}

	if (platScore === null || platScore === undefined) {
		return <td>Unknown</td>;
	}

	return (
		<td>
			<strong>MAX-{maxPlatScore - platScore}</strong>
			{platScore !== undefined && (
				<>
					<br />
					<small className="text-body-secondary">
						[{platScore}/{maxPlatScore}]
					</small>
				</>
			)}
		</td>
	);
}
