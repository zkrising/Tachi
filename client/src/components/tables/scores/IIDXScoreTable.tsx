import useScoreRatingAlg from "components/util/useScoreRatingAlg";
import { nanoid } from "nanoid";
import React, { useState } from "react";
import { integer, Playtypes, ScoreCalculatedDataLookup } from "tachi-common";
import { ScoreDataset } from "types/tables";
import { Playtype } from "types/tachi";
import { NumericSOV, StrSOV } from "util/sorts";
import { CreateDefaultScoreSearchParams } from "util/tables/create-search";
import DifficultyCell from "../cells/DifficultyCell";
import IndicatorsCell from "../cells/IndicatorsCell";
import TimestampCell from "../cells/TimestampCell";
import TitleCell from "../cells/TitleCell";
import UserCell from "../cells/UserCell";
import DropdownRow from "../components/DropdownRow";
import SelectableRating from "../components/SelectableRating";
import TachiTable, { Header, ZTableTHProps } from "../components/TachiTable";
import { useScoreState } from "../components/UseScoreState";
import IIDXScoreDropdown from "../dropdowns/IIDXScoreDropdown";
import IIDXScoreCoreCells from "../game-core-cells/IIDXScoreCoreCells";
import IndicatorHeader from "../headers/IndicatorHeader";

export default function IIDXScoreTable({
	dataset,
	pageLen,
	playtype,
	userCol = false,
}: {
	dataset: ScoreDataset<"iidx:SP" | "iidx:DP">;
	pageLen?: integer;
	playtype: Playtypes["iidx"];
	userCol?: boolean;
}) {
	const defaultRating = useScoreRatingAlg<"iidx:SP" | "iidx:DP">("iidx", playtype);
	const [rating, setRating] = useState<ScoreCalculatedDataLookup["iidx:SP" | "iidx:DP"]>(
		defaultRating
	);

	const headers: Header<ScoreDataset<"iidx:SP" | "iidx:DP">[0]>[] = [
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
	];

	if (userCol) {
		headers.unshift(["User", "User", StrSOV(x => x.__related.user.username)]);
	}

	return (
		<TachiTable
			dataset={dataset}
			pageLen={pageLen}
			headers={headers}
			entryName="Scores"
			searchFunctions={CreateDefaultScoreSearchParams("iidx", playtype)}
			rowFunction={sc => (
				<Row
					key={sc.scoreID}
					playtype={playtype}
					sc={sc}
					rating={rating}
					userCol={userCol}
				/>
			)}
		/>
	);
}

function Row({
	sc,
	rating,
	playtype,
	userCol,
}: {
	sc: ScoreDataset<"iidx:SP" | "iidx:DP">[0];
	rating: ScoreCalculatedDataLookup["iidx:SP" | "iidx:DP"];
	playtype: Playtype;
	userCol: boolean;
}) {
	const scoreState = useScoreState(sc);

	return (
		<DropdownRow
			dropdown={
				<IIDXScoreDropdown
					chart={sc.__related.chart}
					game="iidx"
					playtype={sc.playtype}
					user={sc.__related.user}
					thisScore={sc}
					scoreState={scoreState}
				/>
			}
		>
			{userCol && <UserCell game={sc.game} playtype={sc.playtype} user={sc.__related.user} />}
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
