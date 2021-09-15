import React from "react";
import { Game, PublicUserDocument } from "tachi-common";
import { FolderDataset } from "types/tables";
import { Playtype } from "types/tachi";
import { NumericSOV, StrSOV } from "util/sorts";
import { CreateDefaultFolderSearchParams } from "util/tables/create-search";
import BMSDifficultyCell from "../cells/BMSDifficultyCell";
import DifficultyCell from "../cells/DifficultyCell";
import IndicatorsCell from "../cells/IndicatorsCell";
import RankingCell from "../cells/RankingCell";
import TimestampCell from "../cells/TimestampCell";
import TitleCell from "../cells/TitleCell";
import DropdownRow from "../components/DropdownRow";
import TachiTable, { Header } from "../components/TachiTable";
import { usePBState } from "../components/UseScoreState";
import GenericPBDropdown from "../dropdowns/GenericPBDropdown";
import BMSScoreCoreCells from "../game-core-cells/BMSScoreCoreCells";
import SDVXScoreCoreCells from "../game-core-cells/SDVXCoreCells";
import { FolderIndicatorHeader } from "../headers/IndicatorHeader";

export default function SDVXFolderTable({
	dataset,
	reqUser,
	game,
	playtype,
}: {
	dataset: FolderDataset<"sdvx:Single">;
	reqUser: PublicUserDocument;
	game: Game;
	playtype: Playtype;
}) {
	const headers: Header<FolderDataset<"sdvx:Single">[0]>[] = [
		["Chart", "Ch.", NumericSOV(x => x.levelNum)],
		FolderIndicatorHeader,
		["Song", "Song", StrSOV(x => x.__related.song.title)],
		["Score", "Score", NumericSOV(x => x.__related.pb?.scoreData.percent ?? -Infinity)],
		["Near - Miss", "Nr. Ms.", NumericSOV(x => x.__related.pb?.scoreData.percent ?? -Infinity)],
		["Lamp", "Lamp", NumericSOV(x => x.__related.pb?.scoreData.lampIndex ?? -Infinity)],
		["VF6", "sgl.", NumericSOV(x => x.__related.pb?.calculatedData.VF6 ?? 0)],
		[
			"Site Ranking",
			"Site Rank",
			NumericSOV(x => x.__related.pb?.rankingData.rank ?? -Infinity),
		],
		["Last Raised", "Last Raised", NumericSOV(x => x.__related.pb?.timeAchieved ?? 0)],
	];

	return (
		<TachiTable
			dataset={dataset}
			headers={headers}
			entryName="Charts"
			searchFunctions={CreateDefaultFolderSearchParams(game, playtype)}
			rowFunction={data => (
				<Row data={data} key={data.chartID} reqUser={reqUser} game={game} />
			)}
		/>
	);
}

function Row({
	data,
	reqUser,
	game,
}: {
	data: FolderDataset<"sdvx:Single">[0];
	reqUser: PublicUserDocument;
	game: Game;
}) {
	const score = data.__related.pb;

	if (!score) {
		return (
			<tr>
				<DifficultyCell chart={data} game={game} />
				<IndicatorsCell highlight={false} />
				<TitleCell song={data.__related.song} chart={data} game={game} />
				<td colSpan={6}>Not Played.</td>
			</tr>
		);
	}

	// screw the rules of hooks
	const scoreState = usePBState(score);

	return (
		<DropdownRow
			dropdown={
				<GenericPBDropdown
					chart={data}
					reqUser={reqUser}
					game={game}
					playtype={data.playtype}
					scoreState={scoreState}
				/>
			}
		>
			<DifficultyCell chart={data} game={game} />
			<IndicatorsCell highlight={scoreState.highlight} />
			<TitleCell song={data.__related.song} chart={data} game={game} />
			<SDVXScoreCoreCells sc={score} />
			<RankingCell rankingData={score.rankingData} />
			<TimestampCell time={score.timeAchieved} />
		</DropdownRow>
	);
}
