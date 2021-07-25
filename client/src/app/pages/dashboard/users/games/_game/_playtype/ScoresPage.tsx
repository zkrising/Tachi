import useSetSubheader from "components/layout/header/useSetSubheader";
import IIDXPBTable from "components/tables/pbs/IIDXPBTable";
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

export default function ScoresPage({
	reqUser,
	game,
	playtype,
}: {
	reqUser: PublicUserDocument;
} & GamePT) {
	const [scoreSet, setScoreSet] = useState<"recent" | "best">("best");

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
					<div
						className={`btn btn-${scoreSet === "best" ? "primary" : "secondary"}`}
						onClick={() => setScoreSet("best")}
					>
						Best Scores
					</div>
					<div
						className={`btn btn-${scoreSet === "recent" ? "primary" : "secondary"}`}
						onClick={() => setScoreSet("recent")}
					>
						Recent Scores
					</div>
				</div>
			</div>
			<div className="col-12 mt-4">
				{scoreSet === "best" ? (
					<PBsOverview {...{ reqUser, game, playtype }} />
				) : (
					<ScoresOverview {...{ reqUser, game, playtype }} />
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

function PBsOverview({ reqUser, game, playtype }: { reqUser: PublicUserDocument } & GamePT) {
	const [search, setSearch] = useState("");

	const { isLoading, error, data } = useFetchPBs(
		`/users/${reqUser.id}/games/${game}/${playtype}/pbs/best`
	);

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
					<LoadingWrapper {...{ isLoading, error, dataset: data }}>
						<IIDXPBTable dataset={data!} />
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
			scores: ScoreDocument<"iidx:SP">[];
			charts: ChartDocument<"iidx:SP">[];
			songs: SongDocument<"iidx">[];
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
		<LoadingWrapper {...{ isLoading, error, dataset: data }}>
			<IIDXPBTable indexCol={false} dataset={data!} />
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
					<LoadingWrapper {...{ isLoading, dataset: data, error }}>
						<IIDXScoreTable dataset={data!} />
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
		<LoadingWrapper {...{ isLoading, error, dataset: data }}>
			<IIDXScoreTable dataset={data!} />
		</LoadingWrapper>
	);
}
