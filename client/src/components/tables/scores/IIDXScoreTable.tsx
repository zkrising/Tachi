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
			searchFunctions={{
				artist: x => x.__related.song.artist,
				title: x => x.__related.song.title,
				difficulty: x => FormatDifficulty(x.__related.chart, "iidx"),
				level: x => x.__related.chart.levelNum,
				score: x => x.scoreData.score,
				percent: x => x.scoreData.percent,
				lamp: {
					valueGetter: x => [x.scoreData.lamp, x.scoreData.lampIndex],
					strToNum: HumanFriendlyStrToLampIndex("iidx", "SP"),
				},
				grade: {
					valueGetter: x => [x.scoreData.grade, x.scoreData.gradeIndex],
					strToNum: HumanFriendlyStrToGradeIndex("iidx", "SP"),
				},
			}}
			rowFunction={sc => <Row key={sc.scoreID} sc={sc} reqUser={reqUser} rating={rating} />}
		/>
	);
}

function Row({
	sc,
	reqUser,
	rating,
}: {
	sc: ScoreDataset<"iidx:SP" | "iidx:DP">[0];
	reqUser: PublicUserDocument;
	rating: ScoreCalculatedDataLookup["iidx:SP" | "iidx:DP"];
}) {
	const [highlight, setHighlight] = useState(sc.highlight);
	const [comment, setComment] = useState(sc.comment);

	const scoreState = { highlight, comment, setHighlight, setComment };

	return (
		<DropdownRow
			className={highlight ? "highlighted-row" : ""}
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
			<DifficultyCell chart={sc.__related.chart} game={"iidx"} />
			<TitleCell song={sc.__related.song} chart={sc.__related.chart} game="iidx" />
			<ScoreCell score={sc} game="iidx" playtype="SP" />
			<DeltaCell
				game="iidx"
				playtype="SP"
				score={sc.scoreData.score}
				percent={sc.scoreData.percent}
				grade={sc.scoreData.grade}
			/>
			<IIDXLampCell sc={sc} />
			<td>
				{!IsNullish(sc.calculatedData[rating])
					? sc.calculatedData[rating]!.toFixed(2)
					: "No Data."}
			</td>
			<TimestampCell time={sc.timeAchieved} />
		</DropdownRow>
	);
}
