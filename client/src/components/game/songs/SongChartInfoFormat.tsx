import React from "react";
import { ChartDocument, Game, SongDocument } from "tachi-common";
import { DisplayLevelNum } from "components/tables/cells/DifficultyCell";
import Muted from "components/util/Muted";
import DefaultSongChartInfoFormat from "./DefaultSongChartInfoFormat";
import IIDXStyleSongChartInfoFormat from "./IIDXStyleSongChartInfoFormat";

export default function SongChartInfoFormat({
	song,
	chart,
	game,
}: {
	song: SongDocument;
	chart: ChartDocument | null;
	game: Game;
}) {
	if (["iidx", "popn", "bms", "pms"].includes(game)) {
		return (
			<IIDXStyleSongChartInfoFormat
				{...{ song: song as SongDocument<"iidx" | "popn" | "bms" | "pms">, chart, game }}
			/>
		);
	}
	if (game === "ongeki") {
		return (
			<>
				<IIDXStyleSongChartInfoFormat
					{...{ song: song as SongDocument<"ongeki">, chart, game }}
				/>
				{chart && (
					<>
						<h6>
							<DisplayLevelNum
								game={game}
								level={chart.level}
								levelNum={chart.levelNum}
								prefix="Internal Level: "
							/>
						</h6>
						<h6>
							<Muted>
								From オンゲキ{" "}
								{(chart as ChartDocument<"ongeki:Single">).data.displayVersion
									.replace("オンゲキ", "")
									.trim()}
							</Muted>
						</h6>
					</>
				)}
			</>
		);
	}

	return <DefaultSongChartInfoFormat {...{ song, chart, game }} />;
}
