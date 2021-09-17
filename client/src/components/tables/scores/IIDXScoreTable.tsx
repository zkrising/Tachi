import useScoreRatingAlg from "components/util/useScoreRatingAlg";
import { nanoid } from "nanoid";
import React, { useState } from "react";
import { integer, Playtypes, PublicUserDocument, ScoreCalculatedDataLookup } from "tachi-common";
import { ScoreDataset } from "types/tables";
import { Playtype } from "types/tachi";
import { NumericSOV, StrSOV } from "util/sorts";
import { CreateDefaultScoreSearchParams } from "util/tables/create-search";
import DifficultyCell from "../cells/DifficultyCell";
import IndicatorsCell from "../cells/IndicatorsCell";
import TimestampCell from "../cells/TimestampCell";
import TitleCell from "../cells/TitleCell";
import DropdownRow from "../components/DropdownRow";
import SelectableRating from "../components/SelectableRating";
import TachiTable, { Header, ZTableTHProps } from "../components/TachiTable";
import { useScoreState } from "../components/UseScoreState";
import IIDXScoreDropdown from "../dropdowns/IIDXScoreDropdown";
import IIDXScoreCoreCells from "../game-core-cells/IIDXScoreCoreCells";
import IndicatorHeader from "../headers/IndicatorHeader";

export default function IIDXScoreTable({
	reqUser,
	dataset,
	pageLen,
	playtype,
}: {
	reqUser: PublicUserDocument;
	dataset: ScoreDataset<"iidx:SP" | "iidx:DP">;
	pageLen?: integer;
	playtype: Playtypes["iidx"];
}) {
	const defaultRating = useScoreRatingAlg<"iidx:SP" | "iidx:DP">("iidx", playtype);
	const [rating, setRating] = useState<ScoreCalculatedDataLookup["iidx:SP" | "iidx:DP"]>(
		defaultRating
	);

	return (
		<TachiTable
			dataset={dataset}
			pageLen={pageLen}
			headers={
				[
					[
						"Chart",
						"Chart",
						NumericSOV(
							x =>
								x.__related.chart.tierlistInfo["kt-NC"]?.value ??
								x.__related.chart.tierlistInfo["kt-HC"]?.value ??
								x.__related.chart.levelNum
						),
					],
					IndicatorHeader,
					["Song", "Song", StrSOV(x => x.__related.song.title)],
					["Score", "Score", NumericSOV(x => x.scoreData.percent)],
					["Deltas", "Deltas", NumericSOV(x => x.scoreData.percent)],
					["Lamp", "Lamp", NumericSOV(x => x.scoreData.lampIndex)],
					[
						"Rating",
						"Rating",
						NumericSOV(x => x.calculatedData[rating] ?? 0),
						(thProps: ZTableTHProps) => (
							<SelectableRating<"iidx:SP" | "iidx:DP">
								key={nanoid()}
								game="iidx"
								playtype={playtype}
								rating={rating}
								setRating={setRating}
								{...thProps}
							/>
						),
					],
					["Timestamp", "Timestamp", NumericSOV(x => x.timeAchieved ?? 0)],
				] as Header<ScoreDataset<"iidx:SP" | "iidx:DP">[0]>[]
			}
			entryName="Scores"
			searchFunctions={CreateDefaultScoreSearchParams("iidx", playtype)}
			rowFunction={sc => (
				<Row
					key={sc.scoreID}
					playtype={playtype}
					sc={sc}
					reqUser={reqUser}
					rating={rating}
				/>
			)}
		/>
	);
}

function Row({
	sc,
	reqUser,
	rating,
	playtype,
}: {
	sc: ScoreDataset<"iidx:SP" | "iidx:DP">[0];
	reqUser: PublicUserDocument;
	rating: ScoreCalculatedDataLookup["iidx:SP" | "iidx:DP"];
	playtype: Playtype;
}) {
	const scoreState = useScoreState(sc);

	return (
		<DropdownRow
			className={scoreState.highlight ? "highlighted-row" : ""}
			dropdown={
				<IIDXScoreDropdown
					chart={sc.__related.chart}
					game="iidx"
					playtype={sc.playtype}
					reqUser={reqUser}
					thisScore={sc}
					scoreState={scoreState}
				/>
			}
		>
			<DifficultyCell chart={sc.__related.chart} game="iidx" />
			<IndicatorsCell highlight={scoreState.highlight} />
			<TitleCell
				song={sc.__related.song}
				comment={sc.comment}
				chart={sc.__related.chart}
				game="iidx"
			/>
			<IIDXScoreCoreCells sc={sc} rating={rating} />
			<TimestampCell time={sc.timeAchieved} service={sc.service} />
		</DropdownRow>
	);
}
