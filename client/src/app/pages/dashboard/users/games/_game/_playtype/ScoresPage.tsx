import useSetSubheader from "components/layout/header/useSetSubheader";
import DebounceSearch from "components/util/DebounceSearch";
import React, { useState } from "react";
import { useQuery } from "react-query";
import {
	PBScoreDocument,
	ChartDocument,
	SongDocument,
	PublicUserDocument,
	GetGameConfig,
	ScoreDocument,
	IDStrings,
	Game,
	UnsuccessfulAPIResponse,
	FormatGame,
} from "tachi-common";
import { GamePT } from "types/react";
import { APIFetchV1 } from "util/api";
import IIDXScoreTable from "components/tables/scores/IIDXScoreTable";
import LoadingWrapper from "components/util/LoadingWrapper";
import Icon from "components/util/Icon";
import SelectButton from "components/util/SelectButton";
import PBTable from "components/tables/pbs/PBTable";
import ScoreTable from "components/tables/scores/ScoreTable";

export default function ScoresPage({
	reqUser,
	game,
	playtype,
}: {
	reqUser: PublicUserDocument;
} & GamePT) {
	const [scoreSet, setScoreSet] = useState<"recent" | "best" | "all" | "playcount">("best");

	const gameConfig = GetGameConfig(game);

	useSetSubheader(
		["Users", reqUser.username, "Games", gameConfig.name, playtype, "Scores"],
		[reqUser],
		`${reqUser.username}'s ${FormatGame(game, playtype)} Scores`
	);

	return (
		<div className="row">
			<div className="col-12 text-center">
				<div className="btn-group mb-4">
					<SelectButton id="best" setValue={setScoreSet} value={scoreSet}>
						<Icon type="trophy" />
						Best PBs
					</SelectButton>
					<SelectButton id="recent" setValue={setScoreSet} value={scoreSet}>
						<Icon type="history" />
						Recent Scores
					</SelectButton>
					<SelectButton id="playcount" setValue={setScoreSet} value={scoreSet}>
						<Icon type="mortar-pestle" />
						Most Played
					</SelectButton>
					<SelectButton id="all" setValue={setScoreSet} value={scoreSet}>
						<Icon type="database" />
						All PBs
					</SelectButton>
				</div>
			</div>
			<div className="col-12 mt-4">
				{scoreSet === "best" ? (
					<PBsOverview
						url={`/users/${reqUser.id}/games/${game}/${playtype}/pbs/best`}
						{...{ reqUser, game, playtype }}
					/>
				) : scoreSet === "recent" ? (
					<ScoresOverview {...{ reqUser, game, playtype }} />
				) : scoreSet === "all" ? (
					<PBsOverview
						url={`/users/${reqUser.id}/games/${game}/${playtype}/pbs/all`}
						reqUser={reqUser}
						game={game}
						playtype={playtype}
						indexCol={false}
					/>
				) : (
					<PBsOverview
						url={`/users/${reqUser.id}/games/${game}/${playtype}/most-played`}
						reqUser={reqUser}
						game={game}
						playtype={playtype}
						indexCol
						showPlaycount
					/>
				)}
			</div>
		</div>
	);
}

function useFetchPBs(url: string) {
	const { isLoading, error, data } = useQuery(url, async () => {
		const res = await APIFetchV1<{
			pbs: PBScoreDocument<"iidx:SP">[];
			charts: ChartDocument<"iidx:SP">[];
			songs: SongDocument<"iidx">[];
		}>(url);

		if (!res.success) {
			throw res;
		}

		return FormatData(res.body.pbs, res.body.songs, res.body.charts);
	});

	return { isLoading, error: error as UnsuccessfulAPIResponse, data };
}

function PBsOverview({
	reqUser,
	game,
	playtype,
	indexCol = true,
	showPlaycount = false,
	url,
}: {
	reqUser: PublicUserDocument;
	url: string;
	indexCol?: boolean;
	showPlaycount?: boolean;
} & GamePT) {
	const [search, setSearch] = useState("");

	const { isLoading, error, data } = useFetchPBs(url);

	return (
		<div className="row">
			<div className="col-12">
				<DebounceSearch
					className="form-control-lg"
					setSearch={setSearch}
					placeholder="Search all PBs..."
				/>
			</div>
			<div className="col-12 mt-8">
				{search === "" ? (
					<LoadingWrapper
						style={{ height: 500 }}
						{...{ isLoading, error, dataset: data }}
					>
						<PBTable
							reqUser={reqUser}
							dataset={data!}
							game={game}
							showPlaycount={showPlaycount}
							indexCol={indexCol}
							playtype={playtype as "SP" | "DP"}
						/>
					</LoadingWrapper>
				) : (
					<PBsSearch {...{ reqUser, game, playtype, search }} />
				)}
			</div>
		</div>
	);
}

function FormatData<
	D extends PBScoreDocument | ScoreDocument,
	I extends IDStrings = IDStrings,
	G extends Game = Game
>(d: D[], songs: SongDocument<G>[], charts: ChartDocument<I>[]) {
	const songMap = new Map();
	const chartMap = new Map();

	for (const song of songs) {
		songMap.set(song.id, song);
	}

	for (const chart of charts) {
		chartMap.set(chart.chartID, chart);
	}

	const data = d.map((e, i) => ({
		...e,
		__related: {
			song: songMap.get(e.songID),
			chart: chartMap.get(e.chartID),
			index: i,
		},
	}));

	return data;
}

function useFetchScores(url: string) {
	const { isLoading, error, data } = useQuery(url, async () => {
		const res = await APIFetchV1<{
			scores: ScoreDocument[];
			charts: ChartDocument[];
			songs: SongDocument[];
		}>(url);

		if (!res.success) {
			throw res;
		}

		return FormatData(res.body.scores, res.body.songs, res.body.charts);
	});

	return { isLoading, error: error as UnsuccessfulAPIResponse, data };
}

function PBsSearch({
	reqUser,
	game,
	playtype,
	search,
}: { reqUser: PublicUserDocument; search: string } & GamePT) {
	const { isLoading, error, data } = useFetchPBs(
		`/users/${reqUser.id}/games/${game}/${playtype}/pbs?search=${search}`
	);

	return (
		<LoadingWrapper style={{ height: 500 }} {...{ isLoading, error, dataset: data }}>
			<PBTable
				reqUser={reqUser}
				indexCol={false}
				dataset={data!}
				game={game}
				playtype={playtype as "SP" | "DP"}
			/>
		</LoadingWrapper>
	);
}

function ScoresOverview({ reqUser, game, playtype }: { reqUser: PublicUserDocument } & GamePT) {
	const [search, setSearch] = useState("");

	const { isLoading, error, data } = useFetchScores(
		`/users/${reqUser.id}/games/${game}/${playtype}/scores/recent`
	);

	return (
		<div className="row">
			<div className="col-12">
				<DebounceSearch
					className="form-control-lg"
					setSearch={setSearch}
					placeholder="Search all individual scores..."
				/>
			</div>
			<div className="col-12 mt-8">
				{search === "" ? (
					<LoadingWrapper
						style={{ height: 500 }}
						{...{ isLoading, dataset: data, error }}
					>
						<ScoreTable
							dataset={data!}
							game={game}
							reqUser={reqUser}
							playtype={playtype as any}
						/>
					</LoadingWrapper>
				) : (
					<ScoresSearch {...{ reqUser, game, playtype, search }} />
				)}
			</div>
		</div>
	);
}

function ScoresSearch({
	reqUser,
	game,
	playtype,
	search,
}: { reqUser: PublicUserDocument; search: string } & GamePT) {
	const { isLoading, error, data } = useFetchScores(
		`/users/${reqUser.id}/games/${game}/${playtype}/scores?search=${search}`
	);

	return (
		<LoadingWrapper style={{ height: 500 }} {...{ isLoading, error, dataset: data }}>
			<ScoreTable dataset={data!} game={game} reqUser={reqUser} playtype={playtype as any} />
		</LoadingWrapper>
	);
}
