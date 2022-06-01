import { DisplayLevelNum } from "components/tables/cells/DifficultyCell";
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
			{chart && (
				<>
					<h5>({FormatDifficulty(chart, game)})</h5>
					<h6>
						<DisplayLevelNum
							level={chart.level}
							levelNum={chart.levelNum}
							prefix="Internal Level: "
						/>
					</h6>
				</>
			)}
		</>
	);
}
