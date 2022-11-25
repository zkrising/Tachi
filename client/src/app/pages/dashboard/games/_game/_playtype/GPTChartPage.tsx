import { APIFetchV1, UnsuccessfulAPIFetchResponse } from "util/api";
import { CreateChartLink, CreateUserMap } from "util/data";
import { SelectRightChart } from "util/misc";
import { MillisToSince } from "util/time";
import useSetSubheader from "components/layout/header/useSetSubheader";
import Card from "components/layout/page/Card";
import LampCell from "components/tables/cells/LampCell";
import ScoreCell from "components/tables/cells/ScoreCell";
import MiniTable from "components/tables/components/MiniTable";
import PBTable from "components/tables/pbs/PBTable";
import ProfilePicture from "components/user/ProfilePicture";
import ApiError from "components/util/ApiError";
import Icon from "components/util/Icon";
import Loading from "components/util/Loading";
import Muted from "components/util/Muted";
import { UserContext } from "context/UserContext";
import React, { useContext, useMemo, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { useQuery } from "react-query";
import { Link, Route, Switch, useParams } from "react-router-dom";
import {
	ChartDocument,
	FormatDifficulty,
	GetGameConfig,
	GetGamePTConfig,
	integer,
	PBScoreDocument,
	UserDocument,
	SongDocument,
} from "tachi-common";
import {
	ChartPBLeaderboardReturn,
	ChartRivalsReturn,
	GoalsOnChartReturn,
	UGPTChartLeaderboardAdjacent,
} from "types/api-returns";
import { GamePT, SetState } from "types/react";
import { PBDataset } from "types/tables";
import useLUGPTSettings from "components/util/useLUGPTSettings";
import TargetInfo from "components/tables/dropdowns/components/TargetInfo";
import useApiQuery from "components/util/query/useApiQuery";
import Divider from "components/util/Divider";
import { TargetsContext } from "context/TargetsContext";
import SelectLinkButton from "components/util/SelectLinkButton";

// This component forms a wrapper around the Real GPT Chart Page
// which handles the case where activeChart == null.
export default function GPTChartPage({
	chart,
	setActiveChart,
	game,
	song,
	playtype,
	allCharts,
}: {
	song: SongDocument;
	chart: ChartDocument | null;
	setActiveChart: SetState<ChartDocument | null>;
	allCharts: ChartDocument[];
} & GamePT) {
	const { difficulty } = useParams<{ difficulty: string }>();

	const gptConfig = GetGamePTConfig(game, playtype);

	const formatSongTitle = `${song.artist} - ${song.title}`;
	const formatDiff = chart ? FormatDifficulty(chart, game) : "Loading...";

	useSetSubheader(
		["Games", GetGameConfig(game).name, playtype, "Songs", formatSongTitle, formatDiff],
		[game, playtype, chart],
		`${formatSongTitle} (${formatDiff})`
	);

	setActiveChart(SelectRightChart(gptConfig, difficulty, allCharts));

	if (!chart) {
		return <Loading />;
	}

	return <InternalGPTChartPage chart={chart} game={game} song={song} playtype={playtype} />;
}

interface ChartPBData {
	leaderboard: ChartPBLeaderboardReturn;
	adjacent?: UGPTChartLeaderboardAdjacent;
	rivals?: ChartRivalsReturn;
	playcount: integer;
}

function InternalGPTChartPage({
	chart,
	game,
	song,
	playtype,
}: {
	song: SongDocument;
	chart: ChartDocument;
} & GamePT) {
	const { user } = useContext(UserContext);

	const [mode, setMode] = useState<"leaderboard" | "adjacent" | "rivals" | "targets">(
		"leaderboard"
	);

	const { data, error } = useQuery<ChartPBData, UnsuccessfulAPIFetchResponse>(
		["PBInfo", `${chart.chartID}`],
		async () => {
			const lRes = await APIFetchV1<ChartPBLeaderboardReturn>(
				`/games/${game}/${playtype}/charts/${chart.chartID}/pbs`
			);

			if (!lRes.success) {
				throw lRes;
			}

			const pRes = await APIFetchV1<{ count: integer }>(
				`/games/${game}/${playtype}/charts/${chart.chartID}/playcount`
			);

			if (!pRes.success) {
				throw pRes;
			}

			if (user) {
				const nRes = await APIFetchV1<UGPTChartLeaderboardAdjacent>(
					`/users/${user.id}/games/${game}/${playtype}/pbs/${chart.chartID}/leaderboard-adjacent`
				);

				const rRes = await APIFetchV1<ChartRivalsReturn>(
					`/users/${user.id}/games/${game}/${playtype}/pbs/${chart.chartID}/rivals`
				);

				const returnValue: ChartPBData = {
					leaderboard: lRes.body,
					playcount: pRes.body.count,
				};

				if (nRes.success) {
					returnValue.adjacent = nRes.body;
				}

				if (rRes.success) {
					returnValue.rivals = rRes.body;
				}

				return returnValue;
			}

			return { leaderboard: lRes.body, playcount: pRes.body.count };
		}
	);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return <Loading />;
	}

	if (data.leaderboard.pbs.length === 0) {
		return <div className="text-center my-8">Nobody has played this chart!</div>;
	}

	const userMap = CreateUserMap(data.leaderboard.users);

	if (data.adjacent) {
		for (const user of data.adjacent.users) {
			userMap.set(user.id, user);
		}
	}

	if (data.rivals) {
		for (const user of data.rivals.rivals) {
			userMap.set(user.id, user);
		}
	}

	if (user) {
		// Add current user, since there's no guarantee they are returned from either API.
		userMap.set(user.id, user);
	}

	const base = CreateChartLink(chart, game);

	return (
		<Row>
			<Col xs={12} className="d-flex mb-8">
				<div className="btn-group w-100">
					<SelectLinkButton to={base}>
						<Icon type="trophy" />
						Best 100
					</SelectLinkButton>
					<SelectLinkButton to={`${base}/me`} disabled={!data.adjacent}>
						<Icon type="user" />
						Your Position
					</SelectLinkButton>
					{user && (
						<>
							<SelectLinkButton to={`${base}/rivals`} disabled={!data.adjacent}>
								<Icon type="users" />
								Vs. Rivals
							</SelectLinkButton>
							<SelectLinkButton to={`${base}/targets`}>
								<Icon type="scroll" />
								Goals & Quests
							</SelectLinkButton>
						</>
					)}
				</div>
			</Col>
			<TopShowcase data={data} user={user} userMap={userMap} />
			<Col xs={12} className="mt-4">
				<Switch>
					<Route
						exact
						path="/dashboard/games/:game/:playtype/songs/:songID/:difficulty/targets"
					>
						<ChartTargetInfo {...{ chart, game, playtype, song, user: user! }} />
					</Route>

					<Route path="/dashboard/games/:game/:playtype/songs/:songID/:difficulty">
						<ChartLeaderboardTable
							{...{
								data,
								game,
								playtype,
								user,
								userMap,
								chart,
								song,
								mode: mode as any,
							}}
						/>
					</Route>
				</Switch>
			</Col>
		</Row>
	);
}

function ChartTargetInfo({
	user,
	game,
	playtype,
	chart,
	song,
}: {
	user: UserDocument;
	chart: ChartDocument;
	song: SongDocument;
} & GamePT) {
	const { reloadTargets } = useContext(TargetsContext);
	const [shouldReload, setShouldReload] = useState(0);

	const { error, data } = useApiQuery<GoalsOnChartReturn>(
		`/users/${user.id ?? ""}/games/${game}/${playtype}/targets/on-chart/${chart.chartID}`,
		undefined,
		// force a reload of this data when the user adds a new goal
		[shouldReload.toString()]
	);

	return (
		<Col xs={12} className="text-center">
			<Divider />
			<TargetInfo
				{...{
					chart,
					data,
					error,
					game,
					playtype,
					reqUser: user,
					song,
					onGoalSet: () => {
						// reload local query, then reload global targets.
						setShouldReload(shouldReload + 1);
						reloadTargets();
					},
				}}
			/>
		</Col>
	);
}

function ChartLeaderboardTable({
	data,
	userMap,
	user,
	game,
	playtype,
	mode,
	chart,
	song,
}: {
	data: ChartPBData;
	user: UserDocument | null;
	userMap: Map<integer, UserDocument>;
	mode: "leaderboard" | "adjacent" | "rivals";
	chart: ChartDocument;
	song: SongDocument;
} & GamePT) {
	const { settings } = useLUGPTSettings();

	const dataset: PBDataset = useMemo(() => {
		const ds: PBDataset = [];

		let pbs: Array<PBScoreDocument> = [];
		if (mode === "leaderboard") {
			pbs = data.leaderboard.pbs;
		} else if (mode === "adjacent") {
			pbs = [
				...data.adjacent!.adjacentAbove,
				data.adjacent!.pb,
				...data.adjacent!.adjacentBelow,
			];
		} else if (mode === "rivals") {
			pbs = data.rivals!.pbs;
		}

		for (const pb of pbs) {
			ds.push({
				...pb,
				__related: {
					chart,
					song,
					index: pb.rankingData.rank - 1,
					user: userMap.get(pb.userID)!,
				},
			});
		}

		return ds;
	}, [data, mode, user]);

	return (
		<PBTable
			defaultRankingViewMode={mode === "rivals" ? "global-no-switch" : "both-if-self"}
			key={mode}
			dataset={dataset}
			game={game}
			playtype={playtype}
			showChart={false}
			alg={settings?.preferences.preferredScoreAlg ?? undefined}
			showUser
		/>
	);
}

function TopShowcase({
	data,
	user,
	userMap,
}: {
	data: ChartPBData;
	user: UserDocument | null;
	userMap: Map<integer, UserDocument>;
}) {
	// We have a couple of conditions.
	// User is #1: col-12 #1,
	// User has played: col-6 col-6,
	// User has not played: col-12 #1,

	const bestPlay = data.leaderboard.pbs[0];
	const bestUser = userMap.get(bestPlay.userID)!;

	// User hasn't played, or isn't logged in or something.
	if (user?.id === bestPlay.userID) {
		return (
			<Col xs={12}>
				<PlayCard name="Best PB" pb={bestPlay} user={bestUser} />
			</Col>
		);
	}

	if (!data.adjacent) {
		return (
			<>
				<Col xs={12} lg={6}>
					<PlayCard name="Best PB" pb={bestPlay} user={bestUser} />
				</Col>
				<Col xs={12} lg={6}>
					<Card header="Your PB" className="text-center">
						<Muted>You've not played this chart.</Muted>
					</Card>
				</Col>
			</>
		);
	}

	const thisUsersPlay = data.adjacent.pb;

	return (
		<>
			<Col xs={12} lg={6}>
				<PlayCard name="Best Play" pb={bestPlay} user={bestUser} />
			</Col>
			<Col xs={12} lg={6}>
				<PlayCard name="Your PB" pb={thisUsersPlay} user={user!} />
			</Col>
		</>
	);
}

function PlayCard({ pb, user, name }: { pb: PBScoreDocument; user: UserDocument; name: string }) {
	return (
		<Card header={name}>
			<Row className="align-items-center">
				<Col lg={3}>
					<ProfilePicture user={user} />
				</Col>
				<Col lg={3}>
					<h4>
						<Link
							className="gentle-link"
							to={`/dashboard/users/${user.username}/games/${pb.game}/${pb.playtype}`}
						>
							{user.username}
						</Link>
					</h4>
					<strong className="display-4">#{pb.rankingData.rank}</strong>
					<span className="text-muted">/{pb.rankingData.outOf}</span>
				</Col>
				<Col lg={6}>
					<MiniTable headers={["PB Info"]}>
						<tr>
							<ScoreCell score={pb} />
						</tr>
						<tr>
							<LampCell score={pb} />
						</tr>
					</MiniTable>
					<div className="text-center">
						<Muted>
							{pb.timeAchieved
								? MillisToSince(pb.timeAchieved) ?? ""
								: "No Timestamp Info"}
						</Muted>
					</div>
				</Col>
			</Row>
		</Card>
	);
}
