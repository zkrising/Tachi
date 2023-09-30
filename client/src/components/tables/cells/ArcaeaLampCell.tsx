import { ChangeOpacity } from "util/color-opacity";
import React from "react";
import { GPTStrings, PBScoreDocument, ScoreDocument } from "tachi-common";
import { GetEnumColour } from "lib/game-implementations";

export default function ArcaeaLampCell({
	sc,
}: {
	sc: ScoreDocument<GPTStrings["arcaea"]> | PBScoreDocument<GPTStrings["arcaea"]>;
}) {
	return (
		<td
			style={{
				backgroundColor: ChangeOpacity(GetEnumColour(sc, "lamp"), 0.2),
			}}
		>
			<strong>{sc.scoreData.lamp}</strong>
			{sc.scoreData.optional.gauge && (
				<>
					<br />
					<small className="text-body-secondary">{sc.scoreData.optional.gauge}%</small>
				</>
			)}
		</td>
	);
}
