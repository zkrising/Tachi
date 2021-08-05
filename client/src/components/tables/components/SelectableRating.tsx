import React from "react";
import {
	Game,
	GetGamePTConfig,
	IDStrings,
	Playtypes,
	ScoreCalculatedDataLookup,
} from "tachi-common";
import { SetState } from "types/react";
import { ZTableTHProps } from "./TachiTable";

export default function SelectableRating<I extends IDStrings>({
	game,
	playtype,
	rating,
	setRating,
	changeSort,
	currentSortMode,
	reverseSort,
}: {
	game: Game;
	playtype: Playtypes[Game];
	rating: ScoreCalculatedDataLookup[I];
	setRating: SetState<ScoreCalculatedDataLookup[I]>;
} & ZTableTHProps) {
	const gptConfig = GetGamePTConfig(game, playtype);
	return (
		<th>
			<select
				onChange={v => setRating(v.target.value as ScoreCalculatedDataLookup[I])}
				value={rating}
				style={{
					backgroundColor: "#131313",
					border: "none",
					color: "#ffffff",
					fontSize: "inherit",
					font: "inherit",
				}}
			>
				{gptConfig.scoreRatingAlgs.map(s => (
					<option key={s}>{s}</option>
				))}
			</select>
			<br />
			<span onClick={() => changeSort("Rating")}>
				<i
					className={`flaticon2-arrow-up icon-sm sort-icon ${
						currentSortMode === "Rating" && reverseSort ? "active" : ""
					}`}
				></i>
				<i
					className={`flaticon2-arrow-down icon-sm sort-icon ${
						currentSortMode === "Rating" && !reverseSort ? "active" : ""
					}`}
				></i>
			</span>
		</th>
	);
}
