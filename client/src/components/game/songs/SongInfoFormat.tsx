import React from "react";
import { ChartDocument, FormatDifficulty, Game, SongDocument } from "tachi-common";
import { FormatBMSTables } from "util/misc";
import DefaultSongChartInfoFormat from "./DefaultSongInfoFormat";

export default function SongChartInfoFormat({
	song: tempSong,
	chart: tempChart,
	game,
}: {
	song: SongDocument;
	chart: ChartDocument | null;
	game: Game;
}) {
	// lazy casting hack to avoid IDStrings
	const props = { song: tempSong, chart: tempChart, game } as any;
	const { song, chart } = props;

	if (game === "bms" || game === "pms") {
		if (!chart) {
			return (
				<>
					<h4>{song.data.genre}</h4>
					<h4 style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{song.title}</h4>
					<h4>{song.artist}</h4>
				</>
			);
		}
		const hasLevel = chart.data.tableFolders.length > 0;

		const levelText = hasLevel ? FormatBMSTables(chart.data.tableFolders) : "No Level";

		return (
			<>
				<h4>{song.data.genre}</h4>
				<h4 style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{song.title}</h4>
				<h4>{song.artist}</h4>
				{chart && <h5>({levelText})</h5>}
			</>
		);
	} else if (game === "iidx") {
		return (
			<>
				<h4>{song.data.genre}</h4>
				<h4 style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{song.title}</h4>
				<h4>{song.artist}</h4>
				{chart && <h5>({FormatDifficulty(chart, game)})</h5>}
			</>
		);
	}

	return <DefaultSongChartInfoFormat {...props} />;
}
