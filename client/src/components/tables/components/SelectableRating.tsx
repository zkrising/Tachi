import { UppercaseFirst } from "util/misc";
import React from "react";
import { Game, GetGamePTConfig, GPTString, Playtypes, ScoreRatingAlgorithms } from "tachi-common";
import { SetState } from "types/react";
import { ZTableTHProps } from "./TachiTable";

// hack to get everything to work
type AllRatings<I> = any;

export default function SelectableRating<GPT extends GPTString>({
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
	rating: AllRatings<GPT>;
	setRating: SetState<AllRatings<GPT>>;
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
				onChange={(v) => setRating(v.target.value as AllRatings<GPT>)}
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
				{Object.keys(gptConfig[key]).map((s) => (
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
