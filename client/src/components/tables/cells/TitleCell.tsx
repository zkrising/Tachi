import React from "react";
import { Link } from "react-router-dom";
import { ChartDocument, SongDocument, Game } from "tachi-common";
import { CreateChartLink } from "util/data";

export default function TitleCell({
	game,
	song,
	chart,
	noArtist,
}: {
	song: SongDocument;
	chart: ChartDocument;
	game: Game;
	noArtist?: boolean;
}) {
	return (
		<td style={{ textAlign: "left", minWidth: "140px" }}>
			<Link className="song-title-link" to={CreateChartLink(chart, game)}>
				{song.title}
				{!noArtist && (
					<>
						<br />
						<small>{song.artist}</small>
					</>
				)}
			</Link>
		</td>
	);
}
