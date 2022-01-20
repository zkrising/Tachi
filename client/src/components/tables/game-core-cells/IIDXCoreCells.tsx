import React from "react";
import {
	ChartDocument,
	PBScoreDocument,
	ScoreCalculatedDataLookup,
	ScoreDocument,
} from "tachi-common";
import { IsNullish } from "util/misc";
import BPICell from "../cells/BPICell";
import DeltaCell from "../cells/DeltaCell";
import IIDXLampCell from "../cells/IIDXLampCell";
import RatingCell from "../cells/RatingCell";
import ScoreCell from "../cells/ScoreCell";

export default function IIDXCoreCells({
	sc,
	rating,
	chart,
}: {
	sc: PBScoreDocument<"iidx:SP" | "iidx:DP"> | ScoreDocument<"iidx:SP" | "iidx:DP">;
	rating: ScoreCalculatedDataLookup["iidx:SP" | "iidx:DP"];
	chart: ChartDocument<"iidx:SP" | "iidx:DP">;
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
			{rating === "BPI" ? (
				<BPICell chart={chart} score={sc} />
			) : (
				<RatingCell rating={rating} score={sc} />
			)}
		</>
	);
}
