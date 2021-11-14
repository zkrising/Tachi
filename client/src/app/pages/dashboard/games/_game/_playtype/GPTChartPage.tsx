import useSetSubheader from "components/layout/header/useSetSubheader";
import QuickTooltip from "components/layout/misc/QuickTooltip";
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
import SelectButton from "components/util/SelectButton";
import { UserContext } from "context/UserContext";
import React, { useContext, useMemo, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { useQuery } from "react-query";
import { Link, useParams } from "react-router-dom";
import {
	ChartDocument,
	FormatDifficulty,
	GetGameConfig,
	GetGamePTConfig,
	integer,
	PBScoreDocument,
	PublicUserDocument,
	SongDocument,
} from "tachi-common";
import { ChartPBLeaderboardReturn, UGPTChartLeaderboardAdjacent } from "types/api-returns";
import { GamePT, SetState } from "types/react";
import { PBDataset } from "types/tables";
import { APIFetchV1, UnsuccessfulAPIFetchResponse } from "util/api";
import { CreateUserMap } from "util/data";
import { SelectRightChart } from "util/misc";
import { FormatDate, MillisToSince } from "util/time";

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

	const [mode, setMode] = useState<"leaderboard" | "adjacent">("leaderboard");

	const { data, isLoading, error } = useQuery<ChartPBData, UnsuccessfulAPIFetchResponse>(
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

				if (!nRes.success) {
					return { leaderboard: lRes.body, playcount: pRes.body.count };
				}

				return {
					leaderboard: lRes.body,
					adjacent: nRes.body,
					playcount: pRes.body.count,
				};
			}

			return { leaderboard: lRes.body, playcount: pRes.body.count };
		}
	);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data || isLoading) {
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

	return (
		<Row>
			<Col xs={12} className="text-center mb-2">
				<h4 className="display-4">Leaderboard</h4>
			</Col>
			<Col xs={12} className="d-flex justify-content-center mb-8">
				<div className="btn-group">
					<SelectButton value={mode} setValue={setMode} id="leaderboard">
						<Icon type="trophy" />
						Best 100
					</SelectButton>
					<SelectButton
						value={mode}
						setValue={setMode}
						id="adjacent"
						disabled={!data.adjacent}
					>
						<Icon type="user" />
						Your Position
					</SelectButton>
				</div>
			</Col>
			<TopShowcase data={data} user={user} userMap={userMap} />
			<Col xs={12} className="mt-4">
				<ChartLeaderboardTable
					{...{ data, game, playtype, user, userMap, chart, song, mode }}
				/>
			</Col>
		</Row>
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
	user: PublicUserDocument | null;
	userMap: Map<integer, PublicUserDocument>;
	mode: "leaderboard" | "adjacent";
	chart: ChartDocument;
	song: SongDocument;
} & GamePT) {
	const dataset: PBDataset = useMemo(() => {
		const ds: PBDataset = [];

		let pbs = [];
		if (mode === "leaderboard") {
			pbs = data.leaderboard.pbs;
		} else {
			pbs = [
				...data.adjacent!.adjacentAbove,
				data.adjacent!.pb,
				...data.adjacent!.adjacentBelow,
			];
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

	return <PBTable dataset={dataset} game={game} playtype={playtype} showChart={false} showUser />;
}

function TopShowcase({
	data,
	user,
	userMap,
}: {
	data: ChartPBData;
	user: PublicUserDocument | null;
	userMap: Map<integer, PublicUserDocument>;
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
				<PlayCard name="Best Play" pb={bestPlay} user={bestUser} />
			</Col>
		);
	}

	if (!data.adjacent) {
		return (
			<>
				<Col xs={12} lg={6}>
					<PlayCard name="Best Play" pb={bestPlay} user={bestUser} />
				</Col>
				<Col xs={12} lg={6}>
					<Card header="Your Score" className="text-center">
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
				<PlayCard name="Your Score" pb={thisUsersPlay} user={user!} />
			</Col>
		</>
	);
}

function PlayCard({
	pb,
	user,
	name,
}: {
	pb: PBScoreDocument;
	user: PublicUserDocument;
	name: string;
}) {
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
					<MiniTable headers={["Score Info"]}>
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
