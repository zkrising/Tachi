import React from "react";
import {
	Game,
	GetGamePTConfig,
	IDStrings,
	Playtypes,
	ScoreCalculatedDataLookup,
} from "tachi-common";
import { SetState } from "types/react";

export default function SelectableRating<I extends IDStrings>({
	game,
	playtype,
	rating,
	setRating,
}: {
	game: Game;
	playtype: Playtypes[Game];
	rating: ScoreCalculatedDataLookup[I];
	setRating: SetState<ScoreCalculatedDataLookup[I]>;
}) {
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
		</th>
	);
}
