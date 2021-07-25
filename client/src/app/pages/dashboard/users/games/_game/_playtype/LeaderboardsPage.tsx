import useSetSubheader from "components/layout/header/useSetSubheader";
import Card from "components/layout/page/Card";
import MiniTable from "components/tables/components/MiniTable";
import LoadingWrapper from "components/util/LoadingWrapper";
import React from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import {
	COLOUR_SET,
	FormatGame,
	GetGameConfig,
	GetGamePTConfig,
	integer,
	PublicUserDocument,
	UserGameStats,
} from "tachi-common";
import { GPTLeaderboard, UGPTLeaderboardAdjacent } from "types/api-returns";
import { GamePT } from "types/react";
import { APIFetchV1, UnsuccessfulAPIFetchResponse } from "util/api";
import { ChangeOpacity } from "util/color-opacity";

interface LeaderboardsData {
	stats: UGPTLeaderboardAdjacent;
	leaderboard: GPTLeaderboard;
}

export default function LeaderboardsPage({
	reqUser,
	game,
	playtype,
}: { reqUser: PublicUserDocument } & GamePT) {
	const gameConfig = GetGameConfig(game);
	useSetSubheader(
		["Users", reqUser.username, "Games", gameConfig.name, playtype, "Leaderboard"],
		[reqUser, game, playtype],
		`${reqUser.username}'s ${FormatGame(game, playtype)} Leaderboard`
	);

	const url = `/users/${reqUser.id}/games/${game}/${playtype}/leaderboard-adjacent`;

	const { isLoading, error, data } = useQuery<LeaderboardsData, UnsuccessfulAPIFetchResponse>(
		url,
		async () => {
			const res = await APIFetchV1<UGPTLeaderboardAdjacent>(url);

			if (!res.success) {
				throw res;
			}

			const lRes = await APIFetchV1<GPTLeaderboard>(
				`/games/${game}/${playtype}/leaderboard?limit=3`
			);

			if (!lRes.success) {
				throw lRes;
			}

			return {
				stats: res.body,
				leaderboard: lRes.body,
			};
		}
	);

	return (
		<LoadingWrapper {...{ dataset: data, isLoading, error }}>
			<LeaderboardsPageContent {...{ reqUser, game, playtype, data: data! }} />
		</LoadingWrapper>
	);
}

function LeaderboardsPageContent({
	reqUser,
	game,
	playtype,
	data,
}: {
	reqUser: PublicUserDocument;
	data: LeaderboardsData;
} & GamePT) {
	const { stats, leaderboard } = data;

	const userMap = new Map<integer, PublicUserDocument>();

	for (const u of stats.users) {
		userMap.set(u.id, u);
	}

	for (const u of leaderboard.users) {
		userMap.set(u.id, u);
	}

	// hack - we aren't returned from this api call for some reason.
	userMap.set(reqUser.id, reqUser);

	const gptConfig = GetGamePTConfig(game, playtype);

	const bestNearbyUser = stats.thisUsersRanking.ranking - stats.above.length;

	function LeaderboardRow({ s, i }: { s: UserGameStats; i: integer }) {
		return (
			<tr
				style={{
					backgroundColor:
						reqUser.id === s.userID ? ChangeOpacity(COLOUR_SET.gold, 0.15) : undefined,
				}}
			>
				<td>
					<strong>#{stats.thisUsersRanking.ranking - stats.above.length + i}</strong>
					{reqUser.id === s.userID && (
						<small className="text-muted">/{stats.thisUsersRanking.outOf}</small>
					)}
				</td>
				<td>{userMap.get(s.userID)?.username}</td>
				<td>{(s.ratings[gptConfig.defaultProfileRatingAlg] ?? 0).toFixed(2)}</td>
				{/* temp */}
				<td>
					{Object.entries(s.classes).length
						? Object.entries(s.classes).map(([k, v]) => `${k}: ${v}`)
						: "No Classes"}
				</td>
			</tr>
		);
	}

	return (
		<Card header={"Leaderboard"}>
			<MiniTable className="text-center" headers={["Position", "User", "Rating", "Classes"]}>
				<>
					{bestNearbyUser > 1 &&
						leaderboard.gameStats
							.slice(0, bestNearbyUser)
							.map((s, i) => <LeaderboardRow key={s.userID} s={s} i={i} />)}
					{bestNearbyUser > 4 && (
						<tr style={{ lineHeight: "0.5rem" }}>
							<td colSpan={4}>...</td>
						</tr>
					)}
					{[...stats.above, stats.thisUsersStats, ...stats.below].map((s, i) => (
						<LeaderboardRow key={s.userID} s={s} i={i} />
					))}
				</>
			</MiniTable>
			<Link to={`/dashboard/games/${game}/${playtype}/leaderboard`} className="float-right">
				View Global Leaderboards
			</Link>
		</Card>
	);
}
