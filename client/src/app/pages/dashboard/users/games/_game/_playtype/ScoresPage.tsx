import { APIFetchV1 } from "util/api";
import useSetSubheader from "components/layout/header/useSetSubheader";
import PBTable from "components/tables/pbs/PBTable";
import ScoreTable from "components/tables/scores/ScoreTable";
import DebounceSearch from "components/util/DebounceSearch";
import Icon from "components/util/Icon";
import LoadingWrapper from "components/util/LoadingWrapper";
import SelectLinkButton from "components/util/SelectLinkButton";
import useScoreRatingAlg from "components/util/useScoreRatingAlg";
import useUGPTBase from "components/util/useUGPTBase";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { Route, Switch } from "react-router-dom";
import {
	ChartDocument,
	FormatGame,
	Game,
	GamePTConfig,
	GetGameConfig,
	GetGamePTConfig,
	IDStrings,
	PBScoreDocument,
	PublicUserDocument,
	ScoreCalculatedDataLookup,
	ScoreDocument,
	SongDocument,
	UnsuccessfulAPIResponse,
} from "tachi-common";
import { GamePT, SetState } from "types/react";

export default function ScoresPage({
	reqUser,
	game,
	playtype,
}: {
	reqUser: PublicUserDocument;
} & GamePT) {
	const gameConfig = GetGameConfig(game);
	const gptConfig = GetGamePTConfig(game, playtype);

	const defaultRating = useScoreRatingAlg(game, playtype);

	const [alg, setAlg] = useState(defaultRating);

	useSetSubheader(
		["Users", reqUser.username, "Games", gameConfig.name, playtype, "Scores"],
		[reqUser],
		`${reqUser.username}'s ${FormatGame(game, playtype)} Scores`
	);

	const base = useUGPTBase({ reqUser, game, playtype });

	return (
		<div className="row">
			<div className="col-12 text-center">
				<div className="btn-group mb-4">
					<SelectLinkButton to={`${base}/scores`}>
						<Icon type="trophy" />
						Best 100 PBs
					</SelectLinkButton>
					<SelectLinkButton to={`${base}/scores/history`}>
						<Icon type="history" />
						Recent 100 Scores
					</SelectLinkButton>
					<SelectLinkButton to={`${base}/scores/most-played`}>
						<Icon type="mortar-pestle" />
						Most Played
					</SelectLinkButton>
					<SelectLinkButton to={`${base}/scores/all`}>
						<Icon type="database" />
						All PBs
					</SelectLinkButton>
				</div>
			</div>
			<div className="col-12 mt-4">
				<Switch>
					<Route exact path="/dashboard/users/:userID/games/:game/:playtype/scores">
						<>
							{gptConfig.scoreRatingAlgs.length > 1 && (
								<AlgSelector {...{ alg, setAlg, gptConfig }} />
							)}
							<PBsOverview
								url={`/users/${reqUser.id}/games/${game}/${playtype}/pbs/best?alg=${alg}`}
								{...{ reqUser, game, playtype, alg }}
							/>
						</>
					</Route>
					<Route path="/dashboard/users/:userID/games/:game/:playtype/scores/history">
						<ScoresOverview {...{ reqUser, game, playtype }} />
					</Route>
					<Route path="/dashboard/users/:userID/games/:game/:playtype/scores/all">
						<PBsOverview
							url={`/users/${reqUser.id}/games/${game}/${playtype}/pbs/all`}
							reqUser={reqUser}
							game={game}
							playtype={playtype}
							indexCol={false}
						/>
					</Route>
					<Route path="/dashboard/users/:userID/games/:game/:playtype/scores/most-played">
						<PBsOverview
							url={`/users/${reqUser.id}/games/${game}/${playtype}/most-played`}
							reqUser={reqUser}
							game={game}
							playtype={playtype}
							indexCol
							showPlaycount
						/>
					</Route>
				</Switch>
			</div>
		</div>
	);
}

function AlgSelector({
	gptConfig,
	alg,
	setAlg,
}: {
	gptConfig: GamePTConfig;
	alg: ScoreCalculatedDataLookup[IDStrings];
	setAlg: SetState<ScoreCalculatedDataLookup[IDStrings]>;
}) {
	return (
		<div className="row justify-content-center mb-4">
			<div className="form-group">
				<span className="form-group-prefix">Best 100 PBs according to </span>
				<select
					className="form-control"
					value={alg}
					onChange={e => setAlg(e.target.value as any)}
				>
					{gptConfig.scoreRatingAlgs.map(e => (
						<option key={e}>{e}</option>
					))}
				</select>
			</div>
		</div>
	);
}

function useFetchPBs(url: string, reqUser: PublicUserDocument) {
	const { isLoading, error, data } = useQuery(url, async () => {
		const res = await APIFetchV1<{
			pbs: PBScoreDocument<"iidx:SP">[];
			charts: ChartDocument<"iidx:SP">[];
			songs: SongDocument<"iidx">[];
		}>(url);

		if (!res.success) {
			throw res;
		}

		return FormatData(res.body.pbs, res.body.songs, res.body.charts, reqUser);
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
	alg,
}: {
	reqUser: PublicUserDocument;
	url: string;
	indexCol?: boolean;
	showPlaycount?: boolean;
	alg?: ScoreCalculatedDataLookup[IDStrings];
} & GamePT) {
	const [search, setSearch] = useState("");

	const { isLoading, error, data } = useFetchPBs(url, reqUser);

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
							dataset={data!}
							game={game}
							showPlaycount={showPlaycount}
							indexCol={indexCol}
							alg={alg}
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
>(d: D[], songs: SongDocument<G>[], charts: ChartDocument<I>[], reqUser: PublicUserDocument) {
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
			user: reqUser,
		},
	}));

	return data;
}

function useFetchScores(url: string, reqUser: PublicUserDocument) {
	const { isLoading, error, data } = useQuery(url, async () => {
		const res = await APIFetchV1<{
			scores: ScoreDocument[];
			charts: ChartDocument[];
			songs: SongDocument[];
		}>(url);

		if (!res.success) {
			throw res;
		}

		return FormatData(res.body.scores, res.body.songs, res.body.charts, reqUser);
	});

	return { isLoading, error: error as UnsuccessfulAPIResponse, data };
}

function PBsSearch({
	reqUser,
	game,
	playtype,
	search,
	alg,
}: {
	reqUser: PublicUserDocument;
	search: string;
	alg?: ScoreCalculatedDataLookup[IDStrings];
} & GamePT) {
	const { isLoading, error, data } = useFetchPBs(
		`/users/${reqUser.id}/games/${game}/${playtype}/pbs?search=${search}`,
		reqUser
	);

	return (
		<LoadingWrapper style={{ height: 500 }} {...{ isLoading, error, dataset: data }}>
			<PBTable
				indexCol={false}
				dataset={data!}
				game={game}
				alg={alg}
				playtype={playtype as "SP" | "DP"}
			/>
		</LoadingWrapper>
	);
}

function ScoresOverview({ reqUser, game, playtype }: { reqUser: PublicUserDocument } & GamePT) {
	const [search, setSearch] = useState("");

	const { isLoading, error, data } = useFetchScores(
		`/users/${reqUser.id}/games/${game}/${playtype}/scores/recent`,
		reqUser
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
						<ScoreTable dataset={data!} game={game} playtype={playtype as any} />
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
		`/users/${reqUser.id}/games/${game}/${playtype}/scores?search=${search}`,
		reqUser
	);

	return (
		<LoadingWrapper style={{ height: 500 }} {...{ isLoading, error, dataset: data }}>
			<ScoreTable dataset={data!} game={game} playtype={playtype as any} />
		</LoadingWrapper>
	);
}
