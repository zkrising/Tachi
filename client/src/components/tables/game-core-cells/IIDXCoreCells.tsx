import React from "react";
import {
	ChartDocument,
	PBScoreDocument,
	ScoreRatingAlgorithms,
	ScoreDocument,
	IIDXLIKE_GBOUNDARIES,
	GetGPTString,
} from "tachi-common";
import { GPT_CLIENT_IMPLEMENTATIONS, GetEnumColour } from "lib/game-implementations";
import BPICell from "../cells/BPICell";
import DeltaCell from "../cells/DeltaCell";
import IIDXLampCell from "../cells/IIDXLampCell";
import RatingCell from "../cells/RatingCell";
import ScoreCell from "../cells/ScoreCell";

export default function IIDXCoreCells({
	sc,
	rating,
	chart,
	short,
}: {
	sc: PBScoreDocument<"iidx:SP" | "iidx:DP"> | ScoreDocument<"iidx:SP" | "iidx:DP">;
	rating: ScoreRatingAlgorithms["iidx:SP" | "iidx:DP"];
	chart: ChartDocument<"iidx:SP" | "iidx:DP">;
	short: boolean;
}) {
	return (
		<>
			<ScoreCell
				colour={GetEnumColour(sc, "grade")}
				grade={sc.scoreData.grade}
				percent={sc.scoreData.percent}
				score={sc.scoreData.score}
			/>
			<DeltaCell
				gradeBoundaries={IIDXLIKE_GBOUNDARIES}
				value={sc.scoreData.percent}
				grade={sc.scoreData.grade}
				formatNumFn={(deltaPercent) => {
					const max = Math.floor(sc.scoreData.score / (sc.scoreData.percent / 100));

					const v = (deltaPercent / 100) * max;

					return Math.floor(v).toFixed(0);
				}}
			/>
			<IIDXLampCell sc={sc} chart={chart} />
			{!short && (
				<>
					{rating === "BPI" ? (
						<BPICell chart={chart} score={sc} />
					) : (
						<RatingCell rating={rating} score={sc} />
					)}
				</>
			)}
		</>
	);
}
