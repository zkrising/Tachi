import React from "react";
import { PBScoreDocument, ScoreDocument } from "tachi-common";
import BMSLampCell from "../cells/BMSLampCell";
import DeltaCell from "../cells/DeltaCell";
import LampCell from "../cells/LampCell";
import RatingCell from "../cells/RatingCell";
import ScoreCell from "../cells/ScoreCell";

export default function BMSScoreCoreCells({
	sc,
}: {
	sc: PBScoreDocument<"bms:7K" | "bms:14K"> | ScoreDocument<"bms:7K" | "bms:14K">;
}) {
	return (
		<>
			<ScoreCell score={sc} />
			<DeltaCell
				game="bms"
				playtype={sc.playtype}
				score={sc.scoreData.score}
				percent={sc.scoreData.percent}
				grade={sc.scoreData.grade}
			/>
			<BMSLampCell score={sc} />
			<RatingCell score={sc} />
		</>
	);
}
