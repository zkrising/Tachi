import React, { useState } from "react";
import { FormatDifficulty } from "tachi-common/js/utils/util";
import TitleCell from "../cells/TitleCell";
import TimestampCell from "../cells/TimestampCell";
import { NumericSOV, StrSOV } from "util/sorts";
import { ScoreDataset } from "types/tables";
import { integer, PublicUserDocument, Playtypes, ScoreDocument } from "tachi-common";
import TachiTable from "../components/TachiTable";
import ScoreCell from "../cells/ScoreCell";
import DeltaCell from "../cells/DeltaCell";
import { HumanFriendlyStrToGradeIndex, HumanFriendlyStrToLampIndex } from "util/str-to-num";
import DropdownRow from "../components/DropdownRow";
import { IsNullish } from "util/misc";
import LampCell from "../cells/LampCell";
import BMSDifficultyCell from "../cells/BMSDifficultyCell";
import { Playtype } from "types/tachi";
import GenericScoreDropdown from "../dropdowns/GenericScoreDropdown";
import SDVXJudgementCell from "../cells/SDVXJudgementCell";
import { useScoreState } from "../components/UseScoreState";
import RatingCell from "../cells/RatingCell";
import BMSScoreCoreCells from "../game-core-cells/BMSScoreCoreCells";
import { CreateDefaultScoreSearch } from "util/tables";

export default function BMSScoreTable({
	reqUser,
	dataset,
	pageLen,
	playtype,
}: {
	reqUser: PublicUserDocument;
	dataset: ScoreDataset<"bms:7K" | "bms:14K">;
	pageLen?: integer;
	playtype: Playtypes["bms"];
}) {
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
				["Sieglinde", "sgl.", NumericSOV(x => x.calculatedData.sieglinde ?? 0)],

				["Timestamp", "Timestamp", NumericSOV(x => x.timeAchieved ?? 0)],
			]}
			entryName="Scores"
			searchFunctions={CreateDefaultScoreSearch<"bms:7K" | "bms:14K">("bms", playtype)}
			rowFunction={sc => (
				<Row playtype={playtype} key={sc.scoreID} sc={sc} reqUser={reqUser} />
			)}
		/>
	);
}

function Row({
	sc,
	reqUser,
	playtype,
}: {
	sc: ScoreDataset<"bms:7K" | "bms:14K">[0];
	reqUser: PublicUserDocument;
	playtype: Playtype;
}) {
	const scoreState = useScoreState(sc);

	return (
		<DropdownRow
			className={scoreState.highlight ? "highlighted-row" : ""}
			dropdown={
				<GenericScoreDropdown
					chart={sc.__related.chart}
					reqUser={reqUser}
					game={sc.game}
					thisScore={sc}
					playtype={sc.playtype}
					scoreState={scoreState}
				/>
			}
		>
			<BMSDifficultyCell chart={sc.__related.chart} />
			<TitleCell
				song={sc.__related.song}
				chart={sc.__related.chart}
				game="bms"
				comment={sc.comment}
			/>
			<BMSScoreCoreCells sc={sc} />
			<TimestampCell time={sc.timeAchieved} service={sc.scoreMeta.client} />
		</DropdownRow>
	);
}
