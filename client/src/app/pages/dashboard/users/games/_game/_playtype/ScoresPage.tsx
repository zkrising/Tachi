import { APIFetchV1 } from "util/api";
import { FormatGPTScoreRatingName } from "util/misc";
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
	GPTString,
	PBScoreDocument,
	UserDocument,
	ScoreRatingAlgorithms,
	ScoreDocument,
	SongDocument,
	UnsuccessfulAPIResponse,
} from "tachi-common";
import { GamePT, SetState, UGPT } from "types/react";
import usePreferredRanking from "components/util/usePreferredRanking";
import { Col, Form, Row } from "react-bootstrap";
import useApiQuery from "components/util/query/useApiQuery";

export default function ScoresPage({
	reqUser,
	game,
	playtype,
}: {
	reqUser: UserDocument;
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
		<Row xs={{ cols: 1 }}>
			<Col className="text-center">
				<div className="btn-group d-flex justify-content-center mb-4">
					<SelectLinkButton className="text-wrap" to={`${base}/scores`}>
						<Icon type="trophy" /> Best 100 PBs
					</SelectLinkButton>
					<SelectLinkButton className="text-wrap" to={`${base}/scores/history`}>
						<Icon type="history" /> Recent 100 Scores
					</SelectLinkButton>
					<SelectLinkButton className="text-wrap" to={`${base}/scores/most-played`}>
						<Icon type="mortar-pestle" /> Most Played
					</SelectLinkButton>
					<SelectLinkButton className="text-wrap" to={`${base}/scores/all`}>
						<Icon type="database" /> All PBs
					</SelectLinkButton>
				</div>
			</Col>
			<Col className="d-flex flex-column gap-4">
				<Switch>
					<Route exact path="/u/:userID/games/:game/:playtype/scores">
						<>
							{Object.keys(gptConfig.scoreRatingAlgs).length > 1 && (
								<AlgSelector {...{ alg, setAlg, game, playtype }} />
							)}
							<PBsOverview
								url={`/users/${reqUser.id}/games/${game}/${playtype}/pbs/best?alg=${alg}`}
								{...{ reqUser, game, playtype, alg }}
							/>
						</>
					</Route>
					<Route path="/u/:userID/games/:game/:playtype/scores/history">
						<ScoresOverview {...{ reqUser, game, playtype }} />
					</Route>
					<Route path="/u/:userID/games/:game/:playtype/scores/all">
						<PBsOverview
							url={`/users/${reqUser.id}/games/${game}/${playtype}/pbs/all`}
							reqUser={reqUser}
							game={game}
							playtype={playtype}
							indexCol={false}
							key="all-pbs"
						/>
					</Route>
					<Route path="/u/:userID/games/:game/:playtype/scores/most-played">
						<PBsOverview
							url={`/users/${reqUser.id}/games/${game}/${playtype}/most-played`}
							reqUser={reqUser}
							game={game}
							playtype={playtype}
							indexCol
							showPlaycount
							key="most-played-pbs"
						/>
					</Route>
				</Switch>
			</Col>
		</Row>
	);
}

function AlgSelector({
	game,
	playtype,
	alg,
	setAlg,
}: {
	alg: ScoreRatingAlgorithms[GPTString];
	setAlg: SetState<ScoreRatingAlgorithms[GPTString]>;
} & GamePT) {
	const gptConfig = GetGamePTConfig(game, playtype);
	return (
		<Form.Group className="d-flex flex-column gap-1">
			<div>Best 100 PBs according to</div>
			<Form.Select value={alg} onChange={(e) => setAlg(e.target.value as any)}>
				{Object.keys(gptConfig.scoreRatingAlgs).map((e) => (
					<option key={e}>{FormatGPTScoreRatingName(game, playtype, e)}</option>
				))}
			</Form.Select>
		</Form.Group>
	);
}

function useFetchPBs(url: string, reqUser: UserDocument) {
	const { data, error } = useApiQuery<{
		pbs: PBScoreDocument[];
		charts: ChartDocument[];
		songs: SongDocument[];
	}>(url);

	return {
		error: error as UnsuccessfulAPIResponse,
		data: data ? FormatData(data.pbs, data.songs, data.charts, reqUser) : undefined,
	};
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
	reqUser: UserDocument;
	url: string;
	indexCol?: boolean;
	showPlaycount?: boolean;
	alg?: ScoreRatingAlgorithms[GPTString];
} & GamePT) {
	const [search, setSearch] = useState("");

	const { data, error } = useFetchPBs(url, reqUser);

	const preferredRanking = usePreferredRanking();

	return (
		<div className="row">
			<div className="col-12">
				<DebounceSearch setSearch={setSearch} placeholder="Search all PBs..." />
			</div>
			<div className="col-12 mt-4">
				{search === "" ? (
					<LoadingWrapper style={{ height: 500 }} {...{ error, dataset: data }}>
						<PBTable
							dataset={data!}
							game={game}
							showPlaycount={showPlaycount}
							indexCol={indexCol}
							alg={alg}
							playtype={playtype}
							defaultRankingViewMode={preferredRanking}
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
	GPT extends GPTString = GPTString,
	G extends Game = Game
>(d: D[], songs: SongDocument<G>[], charts: ChartDocument<GPT>[], reqUser: UserDocument) {
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

function useFetchScores(url: string, reqUser: UserDocument) {
	const { data, error } = useApiQuery<{
		scores: ScoreDocument[];
		charts: ChartDocument[];
		songs: SongDocument[];
	}>(url);

	return {
		error: error as UnsuccessfulAPIResponse,
		data: data ? FormatData(data.scores, data.songs, data.charts, reqUser) : undefined,
	};
}

function PBsSearch({
	reqUser,
	game,
	playtype,
	search,
	alg,
}: {
	reqUser: UserDocument;
	search: string;
	alg?: ScoreRatingAlgorithms[GPTString];
} & GamePT) {
	const { data, error } = useFetchPBs(
		`/users/${reqUser.id}/games/${game}/${playtype}/pbs?search=${search}`,
		reqUser
	);

	return (
		<LoadingWrapper style={{ height: 500 }} {...{ error, dataset: data }}>
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

function ScoresOverview({ reqUser, game, playtype }: UGPT) {
	const [search, setSearch] = useState("");

	const { data, error } = useFetchScores(
		`/users/${reqUser.id}/games/${game}/${playtype}/scores/recent`,
		reqUser
	);

	return (
		<div className="row">
			<div className="col-12">
				<DebounceSearch
					size="lg"
					setSearch={setSearch}
					placeholder="Search all individual scores..."
				/>
			</div>
			<div className="col-12 mt-4">
				{search === "" ? (
					<LoadingWrapper style={{ height: 500 }} {...{ dataset: data, error }}>
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
}: { reqUser: UserDocument; search: string } & GamePT) {
	const { data, error } = useFetchScores(
		`/users/${reqUser.id}/games/${game}/${playtype}/scores?search=${search}`,
		reqUser
	);

	return (
		<LoadingWrapper style={{ height: 500 }} {...{ error, dataset: data }}>
			<ScoreTable dataset={data!} game={game} playtype={playtype as any} />
		</LoadingWrapper>
	);
}
