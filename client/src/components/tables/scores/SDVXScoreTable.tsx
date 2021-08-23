import React, { useState } from "react";
import { FormatDifficulty } from "tachi-common/js/utils/util";
import TitleCell from "../cells/TitleCell";
import TimestampCell from "../cells/TimestampCell";
import { NumericSOV, StrSOV } from "util/sorts";
import { ScoreDataset } from "types/tables";
import { integer, PublicUserDocument, Playtypes, ScoreDocument } from "tachi-common";
import TachiTable from "../components/TachiTable";
import DifficultyCell from "../cells/DifficultyCell";
import ScoreCell from "../cells/ScoreCell";
import { HumanFriendlyStrToGradeIndex, HumanFriendlyStrToLampIndex } from "util/str-to-num";
import DropdownRow from "../components/DropdownRow";
import { IsNullish } from "util/misc";
import LampCell from "../cells/LampCell";
import MillionsScoreCell from "../cells/MillionsScoreCell";
import GenericScoreDropdown from "../dropdowns/GenericScoreDropdown";
import SDVXJudgementCell from "../cells/SDVXJudgementCell";
import { useScoreState } from "../components/UseScoreState";
import SDVXScoreCoreCells from "../game-core-cells/SDVXCoreCells";
import { CreateDefaultScoreSearch } from "util/tables";

export default function SDVXScoreTable({
	reqUser,
	dataset,
	pageLen,
}: {
	reqUser: PublicUserDocument;
	dataset: ScoreDataset<"sdvx:Single">;
	pageLen?: integer;
	playtype: Playtypes["sdvx"];
}) {
	return (
		<TachiTable
			dataset={dataset}
			pageLen={pageLen}
			headers={[
				["Chart", "Ch.", NumericSOV(x => x.__related.chart.levelNum)],
				["Song", "Song", StrSOV(x => x.__related.song.title)],
				["Score", "Score", NumericSOV(x => x.scoreData.percent)],
				["Near - Miss", "Nr-Ms", NumericSOV(x => x.scoreData.percent)],
				["Lamp", "Lamp", NumericSOV(x => x.scoreData.lampIndex)],
				["VF6", "VF6", NumericSOV(x => x.calculatedData.VF6 ?? 0)],

				["Timestamp", "Timestamp", NumericSOV(x => x.timeAchieved ?? 0)],
			]}
			entryName="Scores"
			searchFunctions={CreateDefaultScoreSearch<"sdvx:Single">("sdvx", "Single")}
			rowFunction={sc => <Row key={sc.scoreID} sc={sc} reqUser={reqUser} />}
		/>
	);
}

function Row({ sc, reqUser }: { sc: ScoreDataset<"sdvx:Single">[0]; reqUser: PublicUserDocument }) {
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
			<DifficultyCell chart={sc.__related.chart} game="sdvx" />
			<TitleCell
				song={sc.__related.song}
				comment={sc.comment}
				chart={sc.__related.chart}
				game="sdvx"
			/>
			<SDVXScoreCoreCells sc={sc} />
			<TimestampCell time={sc.timeAchieved} service={sc.service} />
		</DropdownRow>
	);
}
