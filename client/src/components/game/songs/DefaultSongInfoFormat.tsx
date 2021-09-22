import React from "react";
import { ChartDocument, FormatDifficulty, Game, SongDocument } from "tachi-common";

export default function DefaultSongChartInfoFormat({
	song,
	chart,
	game,
}: {
	song: SongDocument;
	chart: ChartDocument | null;
	game: Game;
}) {
	return (
		<>
			<h4>
				{song.artist} - {song.title}
			</h4>
			{chart && <h5>({FormatDifficulty(chart, game)})</h5>}
		</>
	);
}
