import GentleLink from "components/util/GentleLink";
import Muted from "components/util/Muted";
import React from "react";
import { ChartDocument, Game, SongDocument } from "tachi-common";
import { ToCDNURL } from "util/api";
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
	const backgroundImage =
		game !== "popn"
			? undefined
			: `linear-gradient(to left, rgba(19, 19, 19, 0.8), rgba(19, 19, 19, 1)), url(${ToCDNURL(
					`/misc/popn/banners/${(chart as any).data.inGameID}.png`
			  )})`;

	return (
		<td
			style={{
				textAlign: "left",
				minWidth: "140px",
				maxWidth: "300px",
				backgroundRepeat: "no-repeat",
				backgroundSize: "cover",
				backgroundImage,
			}}
		>
			{game === "popn" && (
				<>
					{(song as SongDocument<"popn">).data.genre === song.title ||
					(song as SongDocument<"popn">).data.genre === null ? (
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
