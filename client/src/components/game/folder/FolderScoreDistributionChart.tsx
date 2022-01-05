import { ResponsiveBar } from "@nivo/bar";
import { BarChartTooltip } from "components/charts/ChartTooltip";
import React, { useMemo } from "react";
import { GetGamePTConfig } from "tachi-common";
import { GamePT } from "types/react";
import { FolderDataset } from "types/tables";
import { DEFAULT_BAR_PROPS } from "util/charts";
import { ChangeOpacity } from "util/color-opacity";
import { CreateChartIDMap } from "util/data";
import { ComposeExpFn, ComposeInverseExpFn, CountElements, Reverse } from "util/misc";
import { GetGradeChartExpScale } from "util/scales";
import { NumericSOV } from "util/sorts";
import FolderDistributionTable from "./FolderDistributionTable";

type Props = {
	folderDataset: FolderDataset;
	view: "grade" | "lamp";
} & GamePT;

export default function FolderScoreDistributionChart({
	game,
	playtype,
	folderDataset,
	view,
}: Props) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const values = useMemo(() => {
		if (view === "grade") {
			return CountElements(folderDataset, x => x.__related.pb?.scoreData.grade ?? null);
		}

		return CountElements(folderDataset, x => x.__related.pb?.scoreData.lamp ?? null);
	}, [folderDataset, view]);

	return (
		<div className="row">
			<div className="col-12 col-lg-6 offset-lg-3">
				{view === "grade" ? (
					<FolderDistributionTable
						colours={gptConfig.gradeColours}
						keys={Reverse(gptConfig.grades)}
						max={folderDataset.length}
						values={values}
					/>
				) : (
					<FolderDistributionTable
						colours={gptConfig.lampColours}
						keys={Reverse(gptConfig.lamps)}
						max={folderDataset.length}
						values={values}
					/>
				)}
			</div>
			{/* <div className="col-12 col-lg-8">
				<ScoreDistributionChart {...{ game, playtype, folderDataset, view }} />
			</div> */}
		</div>
	);
}

// function ScoreDistributionChart({ game, folderDataset, playtype, view }: Props) {
// 	if (view === "grade") {
// 		return <ScoreBarChart game={game} playtype={playtype} folderDataset={folderDataset} />;
// 	}

// 	return <>LAMP TODO</>;
// }

// function ScoreBarChart({ game, playtype, folderDataset }: Omit<Props, "view">) {
// 	const dataMap = CreateChartIDMap(folderDataset);
// 	const gptConfig = GetGamePTConfig(game, playtype);

// 	const expScale = GetGradeChartExpScale(game);
// 	const expFn = ComposeExpFn(expScale);
// 	const invExpFn = ComposeInverseExpFn(expScale);

// 	const dataset = [];

// 	for (const data of folderDataset) {
// 		const value = data.__related.pb ? expFn(data.__related.pb.scoreData.percent) : 0;
// 		dataset.push({
// 			chartID: data.chartID,
// 			expValue: expFn(value),
// 			value,
// 			grade: data.__related.pb?.scoreData.grade,
// 		});
// 	}

// 	dataset.sort(NumericSOV(x => x.expValue));

// 	return (
// 		<div style={{ height: 400 }}>
// 			<ResponsiveBar
// 				indexBy="chartID"
// 				tooltip={d => (
// 					<BarChartTooltip
// 						point={d}
// 						renderFn={d => {
// 							const data = dataMap.get(d.indexValue as string)!;

// 							return (
// 								<div className="w-100 text-center">
// 									{data.__related.song.title}
// 									<br />
// 									{data.__related.pb?.scoreData.percent.toFixed(2)}%
// 								</div>
// 							);
// 						}}
// 					/>
// 				)}
// 				key={"value"}
// 				colors={k => {
// 					if (!k.data.grade) {
// 						return "black";
// 					}
// 					// @ts-expect-error temp
// 					return ChangeOpacity(gptConfig.gradeColours[k.data.grade], 0.5);
// 				}}
// 				// @ts-expect-error temp
// 				borderColor={k => gptConfig.gradeColours[k.data.grade]}
// 				borderWidth={1}
// 				padding={0.2}
// 				// @ts-expect-error temp
// 				data={dataset}
// 				minValue={0}
// 				maxValue={expFn(100)}
// 				margin={{ left: 50, top: 20, bottom: 20 }}
// 				valueFormat={e => `${invExpFn(e).toFixed(2)}%`}
// 				axisLeft={{
// 					tickValues: gptConfig.gradeBoundaries.map(e => (e === 0 ? 0 : expFn(e))),
// 					format: x => {
// 						let nearest;

// 						const lgv = invExpFn(x);

// 						for (const [i, gradeBnd] of gptConfig.gradeBoundaries.entries()) {
// 							if (Math.abs(gradeBnd - lgv) < 0.00005) {
// 								nearest = i;
// 								break;
// 							}
// 						}

// 						if (nearest === undefined) {
// 							return null;
// 						}

// 						return gptConfig.grades[nearest];
// 					},
// 				}}
// 				axisBottom={null}
// 				{...DEFAULT_BAR_PROPS}
// 				labelSkipWidth={40}
// 			/>
// 		</div>
// 	);
// }
