import React, { useState } from "react";
import { FormatDifficulty } from "tachi-common/js/utils/util";
import TitleCell from "../cells/TitleCell";
import TimestampCell from "../cells/TimestampCell";
import { NumericSOV, StrSOV } from "util/sorts";
import SelectableRating from "../components/SelectableRating";
import { ScoreDataset } from "types/tables";
import {
	GetGamePTConfig,
	integer,
	ScoreCalculatedDataLookup,
	PublicUserDocument,
	Playtypes,
	ScoreDocument,
} from "tachi-common";
import TachiTable, { ZTableTHProps } from "../components/TachiTable";
import DifficultyCell from "../cells/DifficultyCell";
import ScoreCell from "../cells/ScoreCell";
import DeltaCell from "../cells/DeltaCell";
import { HumanFriendlyStrToGradeIndex, HumanFriendlyStrToLampIndex } from "util/str-to-num";
import { nanoid } from "nanoid";
import IIDXLampCell from "../cells/IIDXLampCell";
import DropdownRow from "../components/DropdownRow";
import IIDXScoreDropdown from "../dropdowns/IIDXScoreDropdown";
import { IsNullish } from "util/misc";
import { Playtype } from "types/tachi";
import { useScoreState } from "../components/UseScoreState";
import IIDXScoreCoreCells from "../game-core-cells/IIDXScoreCoreCells";
import { CreateDefaultScoreSearch } from "util/tables";
import RankingCell from "../cells/RankingCell";

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
	const gptConfig = GetGamePTConfig<"iidx:SP" | "iidx:DP">("iidx", playtype);

	const [rating, setRating] = useState<ScoreCalculatedDataLookup["iidx:SP" | "iidx:DP"]>(
		gptConfig.defaultScoreRatingAlg
	);

	return (
		<TachiTable
			dataset={dataset}
			pageLen={pageLen}
			headers={[
				["Chart", "Ch.", NumericSOV(x => x.__related.chart.levelNum)],
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
			]}
			entryName="Scores"
			searchFunctions={CreateDefaultScoreSearch<"iidx:SP" | "iidx:DP">("iidx", playtype)}
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
