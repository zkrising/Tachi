import { GetGradeFromPercent, IsNullish } from "util/misc";
import QuickTooltip from "components/layout/misc/QuickTooltip";
import Divider from "components/util/Divider";
import Muted from "components/util/Muted";
import useUGPTSettings from "components/util/useUGPTSettings";
import { UserContext } from "context/UserContext";
import React, { useContext } from "react";
import { PoyashiBPI } from "rg-stats";
import { ChartDocument, integer, PBScoreDocument, ScoreDocument } from "tachi-common";
import MiniTable from "../components/MiniTable";
import DeltaCell from "./DeltaCell";
import ScoreCell from "./ScoreCell";

export default function BPICell({
	score,
	chart,
}: {
	score: ScoreDocument<"iidx:SP" | "iidx:DP"> | PBScoreDocument<"iidx:SP" | "iidx:DP">;
	chart: ChartDocument<"iidx:SP" | "iidx:DP">;
}) {
	const { user } = useContext(UserContext);
	const { settings } = useUGPTSettings<"iidx:SP" | "iidx:DP">();

	const bpi = score.calculatedData.BPI;
	const { kaidenAverage, worldRecord, notecount, bpiCoefficient } = chart.data;

	if (IsNullish(score.calculatedData.BPI) || IsNullish(kaidenAverage) || IsNullish(worldRecord)) {
		return <td>N/A</td>;
	}

	const isRequestingUser = user?.id === score.userID;
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

	const headers = ["皆伝 Average", "World Record"];

	if (isRequestingUser) {
		headers.unshift(`Your Target (BPI ${bpiTarget})`);
	}

	return (
		<>
			<QuickTooltip
				wide
				tooltipContent={
					<>
						<MiniTable headers={headers}>
							<tr>
								{isRequestingUser ? TGAverageCell : null}
								{KDAverageCell}
								{WRAverageCell}
							</tr>
							<tr>
								{isRequestingUser ? TGDeltaCell : null}
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
					<strong className="underline-on-hover">{bpi?.toFixed(2)}</strong>
					<br />

					<div>
						{isRequestingUser ? (
							<>
								<BPITargetCell bpiTarget={bpiTarget} targetDelta={targetDelta} />
								{bpiTarget !== 0 && (
									<>
										<br />
										<Muted>
											皆伝{kavgDelta < 0 ? kavgDelta : `+${kavgDelta}`}
										</Muted>
									</>
								)}
							</>
						) : (
							<>
								<Muted>皆伝{kavgDelta < 0 ? kavgDelta : `+${kavgDelta}`}</Muted>
							</>
						)}
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
