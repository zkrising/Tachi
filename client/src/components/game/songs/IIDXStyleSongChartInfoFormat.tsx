import { FormatTables } from "util/misc";
import React from "react";
import { ChartDocument, FormatDifficulty, Game, SongDocument } from "tachi-common";

export default function IIDXStyleSongChartInfoFormat({
	song,
	chart,
	game,
}: {
	song: SongDocument<"iidx" | "popn" | "bms" | "pms" | "ongeki" | "chunithm">;
	chart: ChartDocument | null;
	game: Game;
}) {
	return (
		<>
			<h4>{song.data.genre}</h4>
			<h4 style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{song.title}</h4>
			<h4>{song.artist}</h4>
			{chart && <h5>({LevelText(chart, game)})</h5>}
		</>
	);
}

function LevelText(chart: ChartDocument, game: Game) {
	if ("tableFolders" in chart.data) {
		const hasLevel = chart.data.tableFolders.length > 0;
		return hasLevel ? FormatTables(chart.data.tableFolders) : "No Level";
	}
	return FormatDifficulty(chart, game);
}
