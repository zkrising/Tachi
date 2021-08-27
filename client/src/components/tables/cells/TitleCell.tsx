import GentleLink from "components/util/GentleLink";
import React from "react";
import { ChartDocument, SongDocument, Game } from "tachi-common";
import { CreateChartLink } from "util/data";

export default function TitleCell({
	game,
	song,
	chart,
	noArtist,
	comment,
}: {
	song: SongDocument;
	chart: ChartDocument;
	game: Game;
	noArtist?: boolean;
	comment?: string | null;
}) {
	return (
		<td style={{ textAlign: "left", minWidth: "140px", maxWidth: "300px" }}>
			<GentleLink to={CreateChartLink(chart, game)}>
				{song.title}
				{!noArtist && (
					<>
						<br />
						<small>{song.artist}</small>
					</>
				)}
			</GentleLink>
			{comment && (
				<>
					<br />
					<small>"{comment}"</small>
				</>
			)}
		</td>
	);
}
