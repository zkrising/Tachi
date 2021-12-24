import React from "react";
import { Game, PublicUserDocument } from "tachi-common";
import { FolderDataset } from "types/tables";
import { Playtype } from "types/tachi";
import { NumericSOV, StrSOV } from "util/sorts";
import { CreateDefaultFolderSearchParams } from "util/tables/create-search";
import BMSDifficultyCell from "../cells/BMSDifficultyCell";
import IndicatorsCell from "../cells/IndicatorsCell";
import RankingCell from "../cells/RankingCell";
import TimestampCell from "../cells/TimestampCell";
import TitleCell from "../cells/TitleCell";
import DropdownRow from "../components/DropdownRow";
import TachiTable, { Header } from "../components/TachiTable";
import { usePBState } from "../components/UseScoreState";
import GenericPBDropdown from "../dropdowns/GenericPBDropdown";
import BMSCoreCells from "../game-core-cells/BMSCoreCells";
import { FolderIndicatorHeader } from "../headers/IndicatorHeader";

export default function BMSFolderTable({
	dataset,
	reqUser,
	game,
	playtype,
}: {
	dataset: FolderDataset<"bms:7K" | "bms:14K">;
	reqUser: PublicUserDocument;
	game: Game;
	playtype: Playtype;
}) {
	const headers: Header<FolderDataset<"bms:7K" | "bms:14K">[0]>[] = [
		[
			"Chart",
			"Chart",
			NumericSOV(
				x =>
					x.tierlistInfo["sgl-EC"]?.value ?? x.tierlistInfo["sgl-HC"]?.value ?? x.levelNum
			),
		],
		FolderIndicatorHeader,
		["Song", "Song", StrSOV(x => x.__related.song.title)],
		["Score", "Score", NumericSOV(x => x.__related.pb?.scoreData.percent ?? -Infinity)],
		["Deltas", "Deltas", NumericSOV(x => x.__related.pb?.scoreData.percent ?? -Infinity)],
		["Lamp", "Lamp", NumericSOV(x => x.__related.pb?.scoreData.lampIndex ?? -Infinity)],
		["Sieglinde", "sgl.", NumericSOV(x => x.__related.pb?.calculatedData.sieglinde ?? 0)],
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
	data: FolderDataset<"bms:7K" | "bms:14K">[0];
	reqUser: PublicUserDocument;
	game: Game;
}) {
	const score = data.__related.pb;

	if (!score) {
		return (
			<tr>
				<BMSDifficultyCell chart={data} />
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
					userID={score.userID}
					game={game}
					playtype={data.playtype}
					scoreState={scoreState}
				/>
			}
		>
			<BMSDifficultyCell chart={data} />
			<IndicatorsCell highlight={scoreState.highlight} />
			<TitleCell song={data.__related.song} chart={data} game={game} />
			<BMSCoreCells sc={score} />
			<RankingCell rankingData={score.rankingData} />
			<TimestampCell time={score.timeAchieved} />
		</DropdownRow>
	);
}
