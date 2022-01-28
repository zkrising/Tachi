import QuickTooltip from "components/layout/misc/QuickTooltip";
import Divider from "components/util/Divider";
import Muted from "components/util/Muted";
import useUGPTSettings from "components/util/useUGPTSettings";
import React from "react";
import { PoyashiBPI } from "rg-stats";
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
	const { settings } = useUGPTSettings<"iidx:SP" | "iidx:DP">();

	const bpi = score.calculatedData.BPI;
	const { kaidenAverage, worldRecord, notecount, bpiCoefficient } = chart.data;

	if (IsNullish(score.calculatedData.BPI) || IsNullish(kaidenAverage) || IsNullish(worldRecord)) {
		return <td>N/A</td>;
	}

	const bpiTarget = settings?.preferences.gameSpecific.bpiTarget ?? 0;
	let bpiTargetScore = 0;
	let targetDelta: number | null = 0;

	try {
		bpiTargetScore = PoyashiBPI.inverse(
			bpiTarget,
			kaidenAverage!,
			worldRecord!,
			notecount * 2,
			bpiCoefficient
		);

		targetDelta = score.scoreData.score - bpiTargetScore;
	} catch (err) {
		console.warn(err);
		// Wasn't possible to get this BPI!
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

	const { score: TGAverageCell, delta: TGDeltaCell } = FormatAverage(
		bpiTargetScore,
		chart.playtype,
		chart.data.notecount
	);

	return (
		<>
			<QuickTooltip
				wide
				tooltipContent={
					<>
						<MiniTable
							headers={[
								`Your Target (BPI ${bpiTarget})`,
								"皆伝 Average",
								"World Record",
							]}
						>
							<tr>
								{TGAverageCell}
								{KDAverageCell}
								{WRAverageCell}
							</tr>
							<tr>
								{TGDeltaCell}
								{KDDeltaCell}
								{WRDeltaCell}
							</tr>
						</MiniTable>
						<Divider />
						<Muted>
							BPI Coefficient:{" "}
							{IsNullish(chart.data.bpiCoefficient) ||
							chart.data.bpiCoefficient === -1
								? 1.175
								: chart.data.bpiCoefficient}
							<br />
							Tip: Click on your score to see more advanced BPI info.
						</Muted>
					</>
				}
			>
				<td>
					<strong className="underline-on-hover">{bpi}</strong>
					<br />

					<div>
						<BPITargetCell bpiTarget={bpiTarget} targetDelta={targetDelta} />
						{bpiTarget !== 0 && (
							<>
								<br />
								<Muted>皆伝{kavgDelta < 0 ? kavgDelta : `+${kavgDelta}`}</Muted>
							</>
						)}
						{/* {bpiTarget !== 100 && (
							<>
								<br />
								<Muted>WR{wrDelta < 0 ? wrDelta : `+${wrDelta}`}</Muted>
							</>
						)} */}
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

function BPITargetCell({
	targetDelta,
	bpiTarget,
}: {
	targetDelta: number | null;
	bpiTarget: number;
}) {
	if (targetDelta === null) {
		return <small>BPI{bpiTarget} Not Possible</small>;
	}

	let tag = `${bpiTarget}BPI `;

	if (bpiTarget === 0) {
		tag = "皆伝";
	} else if (bpiTarget === 100) {
		tag = "WR";
	}

	return (
		<small
			className={
				targetDelta < 0
					? "text-danger"
					: targetDelta === 0
					? "text-warning"
					: "text-success"
			}
		>
			{tag}
			{targetDelta < 0 ? targetDelta : `+${targetDelta}`}
		</small>
	);
}
