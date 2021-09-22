import useScoreRatingAlg from "components/util/useScoreRatingAlg";
import { nanoid } from "nanoid";
import React, { useState } from "react";
import { Game, PublicUserDocument, ScoreCalculatedDataLookup } from "tachi-common";
import { FolderDataset } from "types/tables";
import { Playtype } from "types/tachi";
import { NumericSOV, StrSOV } from "util/sorts";
import { CreateDefaultFolderSearchParams } from "util/tables/create-search";
import DifficultyCell from "../cells/DifficultyCell";
import IndicatorsCell from "../cells/IndicatorsCell";
import RankingCell from "../cells/RankingCell";
import TimestampCell from "../cells/TimestampCell";
import TitleCell from "../cells/TitleCell";
import DropdownRow from "../components/DropdownRow";
import SelectableRating from "../components/SelectableRating";
import TachiTable, { Header, ZTableTHProps } from "../components/TachiTable";
import { usePBState } from "../components/UseScoreState";
import IIDXPBDropdown from "../dropdowns/IIDXPBDropdown";
import IIDXScoreCoreCells from "../game-core-cells/IIDXScoreCoreCells";
import { FolderIndicatorHeader } from "../headers/IndicatorHeader";

export default function IIDXFolderTable({
	dataset,
	reqUser,
	game,
	playtype,
}: {
	dataset: FolderDataset<"iidx:SP" | "iidx:DP">;
	reqUser: PublicUserDocument;
	game: Game;
	playtype: Playtype;
}) {
	const defaultRating = useScoreRatingAlg<"iidx:SP" | "iidx:DP">("iidx", playtype);

	const [rating, setRating] = useState<ScoreCalculatedDataLookup["iidx:SP" | "iidx:DP"]>(
		defaultRating
	);

	const headers: Header<FolderDataset<"iidx:SP" | "iidx:DP">[0]>[] = [
		[
			"Chart",
			"Chart",
			NumericSOV(
				x => x.tierlistInfo["kt-NC"]?.value ?? x.tierlistInfo["kt-HC"]?.value ?? x.levelNum
			),
		],
		FolderIndicatorHeader,
		["Song", "Song", StrSOV(x => x.__related.song.title)],
		["Score", "Score", NumericSOV(x => x.__related.pb?.scoreData.percent ?? -Infinity)],
		["Deltas", "Deltas", NumericSOV(x => x.__related.pb?.scoreData.percent ?? -Infinity)],
		["Lamp", "Lamp", NumericSOV(x => x.__related.pb?.scoreData.lampIndex ?? -Infinity)],
		[
			"Rating",
			"Rating",
			NumericSOV(x => x.__related.pb?.calculatedData[rating] ?? 0),
			(thProps: ZTableTHProps) => (
				<SelectableRating<"iidx:SP" | "iidx:DP">
					key={nanoid()}
					game="iidx"
					playtype="SP"
					rating={rating}
					setRating={setRating}
					{...thProps}
				/>
			),
		],
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
				<Row rating={rating} data={data} key={data.chartID} reqUser={reqUser} game={game} />
			)}
		/>
	);
}

function Row({
	data,
	reqUser,
	rating,
	game,
}: {
	data: FolderDataset<"iidx:SP" | "iidx:DP">[0];
	reqUser: PublicUserDocument;
	rating: ScoreCalculatedDataLookup["iidx:SP" | "iidx:DP"];
	game: Game;
}) {
	const score = data.__related.pb;

	if (!score) {
		return (
			<tr>
				<DifficultyCell game={game} chart={data} />
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
				<IIDXPBDropdown
					chart={data}
					userID={score.userID}
					game={game}
					playtype={data.playtype}
					scoreState={scoreState}
				/>
			}
		>
			<DifficultyCell game={game} chart={data} />
			<IndicatorsCell highlight={scoreState.highlight} />
			<TitleCell song={data.__related.song} chart={data} game={game} />
			<IIDXScoreCoreCells sc={score} rating={rating} />
			<RankingCell rankingData={score.rankingData} />
			<TimestampCell time={score.timeAchieved} />
		</DropdownRow>
	);
}
