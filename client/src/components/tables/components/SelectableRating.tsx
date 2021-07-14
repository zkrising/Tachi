import React from "react";
import {
	Game,
	GetGamePTConfig,
	IDStrings,
	Playtypes,
	ScoreCalculatedDataLookup,
} from "tachi-common";
import { SetState } from "types/react";

export default function SelectableRating<T extends IDStrings>({
	game,
	playtype,
	setRating,
}: {
	game: Game;
	playtype: Playtypes[Game];
	setRating: SetState<ScoreCalculatedDataLookup[T]>;
}) {
	const gptConfig = GetGamePTConfig(game, playtype);
	return (
		<th>
			<select
				onChange={v => setRating(v.target.value as ScoreCalculatedDataLookup[T])}
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
