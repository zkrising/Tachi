import React from "react";
import { IDStrings, PBScoreDocument, ScoreCalculatedDataLookup, ScoreDocument } from "tachi-common";
import BMSOrPMSLampCell from "../cells/BMSOrPMSLampCell";
import DeltaCell from "../cells/DeltaCell";
import LampCell from "../cells/LampCell";
import RatingCell from "../cells/RatingCell";
import ScoreCell from "../cells/ScoreCell";

export default function PMSCoreCells({
	sc,
	rating,
}: {
	sc:
		| PBScoreDocument<"pms:Controller" | "pms:Keyboard">
		| ScoreDocument<"pms:Controller" | "pms:Keyboard">;
	rating: ScoreCalculatedDataLookup[IDStrings];
}) {
	return (
		<>
			<ScoreCell score={sc} />
			<DeltaCell
				game="pms"
				playtype={sc.playtype}
				score={sc.scoreData.score}
				percent={sc.scoreData.percent}
				grade={sc.scoreData.grade}
			/>
			<BMSOrPMSLampCell score={sc} />
			<RatingCell score={sc} rating={rating} />
		</>
	);
}
