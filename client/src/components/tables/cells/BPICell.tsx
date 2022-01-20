import QuickTooltip from "components/layout/misc/QuickTooltip";
import Divider from "components/util/Divider";
import Muted from "components/util/Muted";
import React, { useState } from "react";
import { ChartDocument, integer, PBScoreDocument, ScoreDocument } from "tachi-common";
import { GetGradeFromPercent, IsNullish } from "util/misc";
import MiniTable from "../components/MiniTable";
import DeltaCell from "./DeltaCell";
import ScoreCell from "./ScoreCell";
// import { BPI_COLOURS } from "util/constants/colours";

// tried it - doesn't look good. - zkldi
// import colorInterpolate from "color-interpolate";

// const scale = colorInterpolate([
// 	BPI_COLOURS.ZERO,
// 	BPI_COLOURS.TEN,
// 	BPI_COLOURS.TWENTY,
// 	BPI_COLOURS.THIRTY,
// 	BPI_COLOURS.FOURTY,
// 	BPI_COLOURS.FIFTY,
// 	BPI_COLOURS.SIXTY,
// 	BPI_COLOURS.SEVENTY,
// 	BPI_COLOURS.EIGHTY,
// 	BPI_COLOURS.NINETY,
// 	BPI_COLOURS.MAX,
// ]);

// function GetColor(bpi: number) {
// 	if (bpi < 0) {
// 		return BPI_COLOURS.NEGATIVE;
// 	} else if (bpi < 10) {
// 		return BPI_COLOURS.ZERO;
// 	} else if (bpi < 20) {
// 		return BPI_COLOURS.TEN;
// 	} else if (bpi < 30) {
// 		return BPI_COLOURS.TWENTY;
// 	} else if (bpi < 40) {
// 		return BPI_COLOURS.THIRTY;
// 	} else if (bpi < 50) {
// 		return BPI_COLOURS.FOURTY;
// 	} else if (bpi < 60) {
// 		return BPI_COLOURS.FIFTY;
// 	} else if (bpi < 70) {
// 		return BPI_COLOURS.SIXTY;
// 	} else if (bpi < 80) {
// 		return BPI_COLOURS.SEVENTY;
// 	} else if (bpi < 90) {
// 		return BPI_COLOURS.EIGHTY;
// 	} else if (bpi < 100) {
// 		return BPI_COLOURS.NINETY;
// 	} else {
// 		return BPI_COLOURS.MAX;
// 	}
// }

export default function BPICell({
	score,
	chart,
}: {
	score: ScoreDocument<"iidx:SP" | "iidx:DP"> | PBScoreDocument<"iidx:SP" | "iidx:DP">;
	chart: ChartDocument<"iidx:SP" | "iidx:DP">;
}) {
	const bpi = score.calculatedData.BPI;
	const { kaidenAverage, worldRecord } = chart.data;

	if (IsNullish(score.calculatedData.BPI) || IsNullish(kaidenAverage) || IsNullish(worldRecord)) {
		return <td>N/A</td>;
	}

	const kavgDelta = score.scoreData.score - kaidenAverage!;
	const wrDelta = score.scoreData.score - worldRecord!;

	const { score: WRAverageCell, delta: WRDeltaCell } = FormatAverage(
		worldRecord!,
		chart.playtype,
		chart.data.notecount
	);

	const { score: KDAverageCell, delta: KDDeltaCell } = FormatAverage(
		kaidenAverage!,
		chart.playtype,
		chart.data.notecount
	);

	const [show, setShow] = useState(false);

	return (
		<>
			<QuickTooltip
				tooltipContent={
					<>
						<MiniTable headers={["皆伝 Average", "World Record"]}>
							<tr>
								{KDAverageCell}
								{WRAverageCell}
							</tr>
							<tr>
								{KDDeltaCell}
								{WRDeltaCell}
							</tr>
						</MiniTable>
						<Divider />
						<Muted>
							BPI Coefficient:{" "}
							{IsNullish(chart.data.bpiCoefficient) || chart.data.bpiCoefficient === 1
								? 1.175
								: chart.data.bpiCoefficient}
							<br />
							Tip: Click on your score to see more advanced BPI info.
						</Muted>
					</>
				}
			>
				<td>
					<strong className="underline-on-hover" onClick={() => setShow(true)}>
						{bpi}
					</strong>
					<br />

					<div>
						<Muted>皆伝{kavgDelta < 0 ? kavgDelta : `+${kavgDelta}`}</Muted>
						<br />
						<Muted>WR{wrDelta < 0 ? wrDelta : `+${wrDelta}`}</Muted>
					</div>
				</td>
			</QuickTooltip>
		</>
	);
}

function FormatAverage(score: integer, playtype: "SP" | "DP", notecount: integer) {
	const percent = (100 * score) / (notecount * 2);

	const grade = GetGradeFromPercent("iidx", playtype, percent);

	return {
		score: (
			<ScoreCell
				score={
					{
						game: "iidx",
						playtype,
						scoreData: {
							grade,
							percent,
							score,
						},
					} as any
				}
			/>
		),
		delta: (
			<DeltaCell
				game="iidx"
				playtype={playtype}
				score={score}
				percent={percent}
				grade={grade}
			/>
		),
	};
}
