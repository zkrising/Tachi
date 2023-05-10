import { NumericSOV, StrSOV } from "util/sorts";
import { CreateDefaultScoreSearchParams } from "util/tables/create-search";
import useScoreRatingAlg from "components/util/useScoreRatingAlg";
import React, { useState } from "react";
import { AnyScoreRatingAlg, Game, Playtype, ScoreDocument, integer } from "tachi-common";
import { ScoreDataset } from "types/tables";
import DifficultyCell from "../cells/DifficultyCell";
import DropdownIndicatorCell from "../cells/DropdownIndicatorCell";
import IndicatorsCell from "../cells/IndicatorsCell";
import TimestampCell from "../cells/TimestampCell";
import TitleCell from "../cells/TitleCell";
import UserCell from "../cells/UserCell";
import DropdownRow from "../components/DropdownRow";
import TachiTable, { Header } from "../components/TachiTable";
import { useScoreState } from "../components/UseScoreState";
import ScoreDropdown from "../dropdowns/ScoreDropdown";
import ScoreCoreCells from "../game-core-cells/ScoreCoreCells";
import ChartHeader from "../headers/ChartHeader";
import { GetGPTCoreHeaders } from "../headers/GameHeaders";
import IndicatorHeader, { EmptyHeader } from "../headers/IndicatorHeader";

export default function ScoreTable({
	dataset,
	pageLen,
	playtype,
	userCol = false,
	game,
	alg,
	noTopDisplayStr,
	onScoreUpdate,
	timeline = false,
	active = false, //setOpen,
}: {
	dataset: ScoreDataset;
	pageLen?: integer;
	playtype: Playtype;
	userCol?: boolean;
	game: Game;
	alg?: AnyScoreRatingAlg;
	noTopDisplayStr?: boolean;
	onScoreUpdate?: (sc: ScoreDocument) => void;
	timeline?: boolean;
	active?: boolean;
	//setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	if (timeline && !active) {
		return null;
	}

	const defaultRating = useScoreRatingAlg(game, playtype);
	const [rating, setRating] = useState(alg ?? defaultRating);

	const headers: Header<ScoreDataset[0]>[] = [
		ChartHeader(game, (k) => k.__related.chart),
		IndicatorHeader,
		["Song", "Song", StrSOV((x) => x.__related.song.title)],
		...GetGPTCoreHeaders<ScoreDataset>(game, playtype, rating, setRating, (k) => k),
		["Timestamp", "Timestamp", NumericSOV((x) => x.timeAchieved ?? 0)],
		EmptyHeader,
	];

	if (userCol) {
		headers.unshift(["User", "User", StrSOV((x) => x.__related.user.username)]);
	}

	/*const handleClose = !timeline
		? () => {
				if (setOpen) {
					setOpen(false);
				}
		  }
		: undefined;
	*/
	return (
		<TachiTable
			noTopDisplayStr={noTopDisplayStr}
			dataset={dataset}
			pageLen={pageLen}
			headers={headers}
			entryName="Scores"
			searchFunctions={CreateDefaultScoreSearchParams(game, playtype)}
			rowFunction={(sc) => (
				<Row
					game={game}
					key={sc.scoreID}
					playtype={playtype}
					sc={sc}
					rating={rating as any}
					userCol={userCol}
					onScoreUpdate={onScoreUpdate}
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
	game,
	onScoreUpdate,
}: {
	sc: ScoreDataset[0];
	rating: AnyScoreRatingAlg;
	game: Game;
	playtype: Playtype;
	userCol: boolean;
	onScoreUpdate?: (sc: ScoreDocument) => void;
}) {
	const scoreState = useScoreState(sc);

	return (
		<DropdownRow
			dropdown={
				<ScoreDropdown
					chart={sc.__related.chart}
					song={sc.__related.song}
					game={game}
					playtype={playtype}
					user={sc.__related.user}
					thisScore={sc}
					scoreState={scoreState}
					onScoreUpdate={onScoreUpdate}
				/>
			}
		>
			{userCol && <UserCell game={sc.game} playtype={playtype} user={sc.__related.user} />}
			<DifficultyCell chart={sc.__related.chart} game={game} />
			<IndicatorsCell highlight={scoreState.highlight} />
			<TitleCell
				song={sc.__related.song}
				comment={scoreState.comment}
				chart={sc.__related.chart}
				game={game}
			/>
			<ScoreCoreCells score={sc} rating={rating} game={game} chart={sc.__related.chart} />
			<TimestampCell time={sc.timeAchieved} service={sc.service} />
			<DropdownIndicatorCell />
		</DropdownRow>
	);
}
