import GentleLink from "components/util/GentleLink";
import Muted from "components/util/Muted";
import React from "react";
import { ChartDocument, Game, SongDocument } from "tachi-common";
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
			{game === "popn" && (
				<>
					{(song as SongDocument<"popn">).data.genre === song.title ? (
						<Muted>Unknown Genre</Muted>
					) : (
						(song as SongDocument<"popn">).data.genre
					)}
					<br />
				</>
			)}
			<GentleLink to={CreateChartLink(chart, game)}>
				{song.title}
				{!noArtist && (
					<>
						<br />
						<small>{song.artist}</small>
					</>
				)}
				{!chart.isPrimary && (
					<>
						<br />
						<small className="text-muted">({chart.versions.join("/")})</small>
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
