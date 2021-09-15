import React from "react";
import { ScoreDocument, ScoreCalculatedDataLookup, PBScoreDocument } from "tachi-common";
import { IsNullish } from "util/misc";
import DeltaCell from "../cells/DeltaCell";
import IIDXLampCell from "../cells/IIDXLampCell";
import ScoreCell from "../cells/ScoreCell";

export default function IIDXScoreCoreCells({
	sc,
	rating,
}: {
	sc: PBScoreDocument<"iidx:SP" | "iidx:DP"> | ScoreDocument<"iidx:SP" | "iidx:DP">;
	rating: ScoreCalculatedDataLookup["iidx:SP" | "iidx:DP"];
}) {
	return (
		<>
			<ScoreCell score={sc} />
			<DeltaCell
				game="iidx"
				playtype={sc.playtype}
				score={sc.scoreData.score}
				percent={sc.scoreData.percent}
				grade={sc.scoreData.grade}
			/>
			<IIDXLampCell sc={sc} />
			<td>
				{!IsNullish(sc.calculatedData[rating])
					? sc.calculatedData[rating]!.toFixed(2)
					: "No Data."}
			</td>
		</>
	);
}
