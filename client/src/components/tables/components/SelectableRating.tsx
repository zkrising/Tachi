import { UppercaseFirst } from "util/misc";
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

// type AllRatings<I extends IDStrings> =
// 	| ScoreCalculatedDataLookup[I]
// 	| SessionCalculatedDataLookup[I]
// 	| UGSRatingsLookup[I];

// hack to get everything to work
type AllRatings<I> = any;

export default function SelectableRating<I extends IDStrings>({
	game,
	playtype,
	rating,
	setRating,
	changeSort,
	currentSortMode,
	reverseSort,
	mode = "score",
}: {
	game: Game;
	playtype: Playtypes[Game];
	rating: AllRatings<I>;
	setRating: SetState<AllRatings<I>>;
	mode?: "score" | "session" | "profile";
} & ZTableTHProps) {
	const gptConfig = GetGamePTConfig(game, playtype);

	let key: "scoreRatingAlgs" | "sessionRatingAlgs" | "profileRatingAlgs";
	if (mode === "score") {
		key = "scoreRatingAlgs";
	} else if (mode === "profile") {
		key = "profileRatingAlgs";
	} else {
		key = "sessionRatingAlgs";
	}

	return (
		<th>
			<select
				onChange={v => setRating(v.target.value as AllRatings<I>)}
				value={rating}
				style={{
					backgroundColor: "#131313",
					border: "none",
					color: "#ffffff",
					fontSize: "inherit",
					font: "inherit",
					textAlign: "center",
				}}
			>
				{gptConfig[key].map(s => (
					<option key={s} value={s}>
						{UppercaseFirst(s)}
					</option>
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
