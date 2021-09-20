import useSetSubheader from "components/layout/header/useSetSubheader";
import BMSDifficultyCell from "components/tables/cells/BMSDifficultyCell";
import DifficultyCell from "components/tables/cells/DifficultyCell";
import TitleCell from "components/tables/cells/TitleCell";
import TachiTable from "components/tables/components/TachiTable";
import ApiError from "components/util/ApiError";
import DebounceSearch from "components/util/DebounceSearch";
import DebugContent from "components/util/DebugContent";
import Divider from "components/util/Divider";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import React, { useState } from "react";
import { Col, Row } from "react-bootstrap";
import {
	GetGameConfig,
	FormatGame,
	ChartDocument,
	SongDocument,
	integer,
	GetGamePTConfig,
} from "tachi-common";
import { GamePT } from "types/react";
import { CreateSongMap } from "util/data";
import { NumericSOV, StrSOV } from "util/sorts";

export default function GPTSongsPage({ game, playtype }: GamePT) {
	useSetSubheader(
		["Games", GetGameConfig(game).name, playtype, "Songs"],
		[game, playtype],
		`${FormatGame(game, playtype)} Songs`
	);

	const [search, setSearch] = useState("");

	return (
		<Row>
			<Col xs={12}>
				<DebounceSearch
					className="form-control-lg"
					setSearch={setSearch}
					placeholder="Search songs and charts..."
				/>
				<Divider />
			</Col>
			<Col xs={12}>
				<SearchSongsTable game={game} search={search} playtype={playtype} />
			</Col>
		</Row>
	);
}

function SearchSongsTable({ game, playtype, search }: { search: string } & GamePT) {
	const params = new URLSearchParams({ search });

	const { data, isLoading, error } = useApiQuery<{
		charts: (ChartDocument & { __playcount: integer })[];
		songs: SongDocument[];
	}>(`/games/${game}/${playtype}/charts${search !== "" ? `?${params.toString()}` : ""}`);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data || isLoading) {
		return <Loading />;
	}

	const songMap = CreateSongMap(data.songs);

	const dataset = [];

	for (const chart of data.charts) {
		dataset.push({
			...chart,
			__related: {
				song: songMap.get(chart.songID)!,
			},
		});
	}

	const gptConfig = GetGamePTConfig(game, playtype);

	return (
		<>
			{search === "" && (
				<div className="w-100 text-center">
					Displaying the most played charts for {FormatGame(game, playtype)}
				</div>
			)}
			<TachiTable
				entryName="Charts"
				dataset={dataset}
				headers={[
					[
						"Chart",
						"Chart",
						NumericSOV(chart => {
							for (const tierlist of gptConfig.tierlists) {
								if (chart.tierlistInfo[tierlist]) {
									return chart.tierlistInfo[tierlist]!.value;
								}
							}

							return chart.levelNum;
						}),
					],
					["Song Title", "Song", StrSOV(x => x.__related.song.title)],
					["Playcount", "Playcount", NumericSOV(x => x.__playcount)],
				]}
				searchFunctions={{
					title: x => x.__related.song.title,
					artist: x => x.__related.song.artist,
					playcount: x => x.__playcount,
					difficulty: x => x.difficulty,
					level: x => x.levelNum,
				}}
				rowFunction={d => (
					<tr>
						{game === "bms" ? (
							<BMSDifficultyCell
								chart={(d as unknown) as ChartDocument<"bms:7K" | "bms:14K">}
							/>
						) : (
							<DifficultyCell game={game} chart={d} />
						)}
						<TitleCell chart={d} game={game} song={d.__related.song} />
						<td>{d.__playcount}</td>
					</tr>
				)}
			/>
		</>
	);
}
