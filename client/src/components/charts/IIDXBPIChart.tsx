import { ResponsiveLine } from "@nivo/line";
import BPICell from "components/tables/cells/BPICell";
import DeltaCell from "components/tables/cells/DeltaCell";
import ScoreCell from "components/tables/cells/ScoreCell";
import MiniTable from "components/tables/components/MiniTable";
import Divider from "components/util/Divider";
import React, { useMemo } from "react";
import { PoyashiBPI } from "rg-stats";
import {
	ChartDocument,
	COLOUR_SET,
	GetGamePTConfig,
	Grades,
	IDStrings,
	integer,
	PBScoreDocument,
	ScoreDocument,
} from "tachi-common";
import { GetGradeFromPercent } from "util/misc";
import ChartTooltip from "./ChartTooltip";

interface BPIValue {
	exScore: integer;
	bpi: number;
	percent: number;
	grade: Grades[IDStrings];
	gradeIndex: integer;
	label: string | undefined;
}

const BPIValues: Record<string, BPIValue[]> = {};

export default function IIDXBPIChart({
	chart,
	score,
}: {
	chart: ChartDocument<"iidx:SP" | "iidx:DP">;
	score: ScoreDocument<"iidx:SP" | "iidx:DP"> | PBScoreDocument<"iidx:SP" | "iidx:DP">;
}) {
	const gptConfig = GetGamePTConfig("iidx", chart.playtype);
	const grades = gptConfig.grades;

	const bpiValues = useMemo(() => {
		if (BPIValues[chart.chartID]) {
			return BPIValues[chart.chartID];
		}
		const MAX = chart.data.notecount * 2;

		const arr: BPIValue[] = [];
		for (let exScore = 0; exScore <= MAX; exScore++) {
			const percent = (100 * exScore) / MAX;

			const bpi = PoyashiBPI.calculate(
				exScore,
				chart.data.kaidenAverage!,
				chart.data.worldRecord!,
				MAX,
				chart.data.bpiCoefficient
			);

			if (bpi === -15) {
				continue;
			}

			const grade = GetGradeFromPercent("iidx", chart.playtype, percent);

			const labelArr = [];

			if (exScore === chart.data.kaidenAverage) {
				labelArr.push("皆伝");
			} else if (exScore === chart.data.worldRecord) {
				labelArr.push("WR");
			} else if (exScore === score.scoreData.score) {
				labelArr.push("You");
			}

			const label = labelArr.length === 0 ? undefined : labelArr.join(", ");

			arr.push({
				exScore,
				percent,
				grade,
				gradeIndex: grades.indexOf(grade),
				bpi,
				label,
			});
		}

		BPIValues[chart.chartID] = arr;
		return arr;
	}, [chart.chartID]);

	return (
		<>
			<div className="d-none d-md-block" style={{ height: "250px", width: "100%" }}>
				<ResponsiveLine
					data={[
						{
							id: "data",
							data: bpiValues.map(d => ({
								x: d.percent,
								y: d.bpi,
								other: d,
								label: d.label,
							})),
						},
					]}
					margin={{ top: 30, bottom: 50, left: 50, right: 50 }}
					xScale={{ type: "linear", min: bpiValues[0].percent }}
					axisBottom={{
						format: x =>
							gptConfig.gradeBoundaries!.indexOf(x) === -1
								? null
								: gptConfig.grades[gptConfig.gradeBoundaries!.indexOf(x)],
						tickValues: gptConfig.gradeBoundaries!,
					}}
					motionConfig="stiff"
					crosshairType="bottom-left"
					yScale={{ type: "linear", max: 110, min: -20 }}
					axisLeft={{ format: y => `${y}BPI` }}
					useMesh={true}
					pointSize={0}
					colors={[COLOUR_SET.vibrantBlue]}
					theme={{
						background: "none",
						textColor: "#ffffff",
						grid: {
							line: {
								stroke: "#1c1c1c",
								strokeWidth: 1,
							},
						},
					}}
					curve="natural"
					enablePointLabel
					pointLabel="label"
					tooltip={d => (
						<ChartTooltip
							point={d.point}
							renderFn={(p: any) => {
								const mockScore = {
									game: "iidx",
									playtype: chart.playtype,
									scoreData: {
										score: p.data.other.exScore,
										grade: p.data.other.grade,
										gradeIndex: p.data.other.gradeIndex,
										percent: p.data.other.percent,
									},
									calculatedData: {
										BPI: p.data.other.bpi,
									},
								} as ScoreDocument<"iidx:SP" | "iidx:DP">;

								const exScoreDiff = score.scoreData.score - p.data.other.exScore;
								const bpiDiff = Number(
									(score.calculatedData.BPI! - p.data.other.bpi).toFixed(2)
								);

								return (
									<div>
										<MiniTable headers={["Value", "Delta", "BPI"]}>
											<tr>
												<ScoreCell score={mockScore} />
												<DeltaCell
													game="iidx"
													playtype={chart.playtype}
													grade={p.data.other.grade}
													percent={p.data.other.percent}
													score={p.data.other.exScore}
												/>
												<BPICell chart={chart} score={mockScore} />
											</tr>
										</MiniTable>
										<Divider />
										<strong>
											You {score.scoreData.score}{" "}
											<FormatDiff diff={exScoreDiff} />
											{" | "}
											{score.calculatedData.BPI!.toFixed(2)}{" "}
											<FormatDiff diff={bpiDiff} />
										</strong>
									</div>
								);
							}}
						/>
					)}
					legends={[]}
					enableArea
				/>
			</div>
		</>
	);
}

function FormatDiff({ diff }: { diff: number }) {
	if (diff === 0) {
		return <span className="text-warning">(+{diff})</span>;
	} else if (diff < 0) {
		return <span className="text-danger">({diff})</span>;
	}

	return <span className="text-success">(+{diff})</span>;
}
