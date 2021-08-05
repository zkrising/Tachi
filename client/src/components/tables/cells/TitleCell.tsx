import React from "react";
import { Link } from "react-router-dom";
import { AnyChartDocument, AnySongDocument, Game } from "tachi-common";
import { GamePT } from "types/react";
import { CreateChartLink } from "util/data";

export default function TitleCell({
	game,
	song,
	chart,
}: {
	song: AnySongDocument;
	chart: AnyChartDocument;
	game: Game;
}) {
	return (
		<td style={{ textAlign: "left", minWidth: "140px" }}>
			<Link className="song-title-link" to={CreateChartLink(chart, game)}>
				{song.title}
				<br />
				<small>{song.artist}</small>
			</Link>
		</td>
	);
}
