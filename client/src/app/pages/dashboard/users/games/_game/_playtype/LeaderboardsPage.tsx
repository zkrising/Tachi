import ClassBadge from "components/game/ClassBadge";
import useSetSubheader from "components/layout/header/useSetSubheader";
import Card from "components/layout/page/Card";
import MiniTable from "components/tables/components/MiniTable";
import GentleLink from "components/util/GentleLink";
import LoadingWrapper from "components/util/LoadingWrapper";
import { useProfileRatingAlg } from "components/util/useScoreRatingAlg";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import {
	COLOUR_SET,
	FormatGame,
	GetGameConfig,
	GetGamePTConfig,
	IDStrings,
	integer,
	PublicUserDocument,
	UGSRatingsLookup,
	UserGameStats,
} from "tachi-common";
import { GameClassSets } from "tachi-common/js/game-classes";
import { GPTLeaderboard, UGPTLeaderboardAdjacent } from "types/api-returns";
import { GamePT, SetState } from "types/react";
import { APIFetchV1, UnsuccessfulAPIFetchResponse } from "util/api";
import { ChangeOpacity } from "util/color-opacity";
import { UppercaseFirst } from "util/misc";

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

	const defaultRating = useProfileRatingAlg(game, playtype);
	const [alg, setAlg] = useState(defaultRating);

	const url = `/users/${reqUser.id}/games/${game}/${playtype}/leaderboard-adjacent?alg=${alg}`;

	const { isLoading, error, data } = useQuery<LeaderboardsData, UnsuccessfulAPIFetchResponse>(
		url,
		async () => {
			const res = await APIFetchV1<UGPTLeaderboardAdjacent>(url);

			if (!res.success) {
				throw res;
			}

			const lRes = await APIFetchV1<GPTLeaderboard>(
				`/games/${game}/${playtype}/leaderboard?limit=3&alg=${alg}`
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
			<LeaderboardsPageContent {...{ reqUser, game, playtype, data: data!, alg, setAlg }} />
		</LoadingWrapper>
	);
}

function LeaderboardsPageContent({
	reqUser,
	game,
	playtype,
	data,
	alg,
}: {
	reqUser: PublicUserDocument;
	data: LeaderboardsData;
	alg: UGSRatingsLookup[IDStrings];
	setAlg: SetState<UGSRatingsLookup[IDStrings]>;
} & GamePT) {
	const { stats, leaderboard } = data;

	const gptConfig = GetGamePTConfig(game, playtype);

	const userMap = new Map<integer, PublicUserDocument>();

	for (const u of stats.users) {
		userMap.set(u.id, u);
	}

	for (const u of leaderboard.users) {
		userMap.set(u.id, u);
	}

	// hack - we aren't returned from this api call for some reason.
	userMap.set(reqUser.id, reqUser);

	const bestNearbyUser = stats.thisUsersRanking.ranking - stats.above.length - 1;

	function LeaderboardRow({ s, i }: { s: UserGameStats; i: integer }) {
		return (
			<tr
				style={{
					backgroundColor:
						reqUser.id === s.userID ? ChangeOpacity(COLOUR_SET.gold, 0.15) : undefined,
					height: reqUser.id === s.userID ? "50px" : undefined,
				}}
			>
				<td>
					<strong>#{i}</strong>
					{reqUser.id === s.userID && (
						<small className="text-muted">/{stats.thisUsersRanking.outOf}</small>
					)}
				</td>
				<td>
					<GentleLink
						to={`/dashboard/users/${
							userMap.get(s.userID)!.username
						}/games/${game}/${playtype}`}
					>
						{userMap.get(s.userID)?.username}
					</GentleLink>
				</td>
				<td>
					{s.ratings[alg]
						? gptConfig.profileRatingAlgFormatters[alg]
							? gptConfig.profileRatingAlgFormatters[alg]!(s.ratings[alg]!)
							: s.ratings[alg]!.toFixed(2)
						: "No Data."}
				</td>
				{/* temp */}
				<td>
					{Object.entries(s.classes).length
						? Object.entries(s.classes).map(([k, v]) => (
								<ClassBadge
									key={`${k}:${v}`}
									classValue={v}
									classSet={k as GameClassSets[IDStrings]}
									game={game}
									playtype={playtype}
								/>
						  ))
						: "No Classes"}
				</td>
			</tr>
		);
	}

	return (
		<Card
			header={"Leaderboard"}
			footer={
				<Link
					to={`/dashboard/games/${game}/${playtype}/leaderboards`}
					className="float-right"
				>
					View Global Leaderboards
				</Link>
			}
		>
			<MiniTable
				className="text-center"
				headers={["Position", "User", UppercaseFirst(alg), "Classes"]}
			>
				<>
					{bestNearbyUser >= 1 &&
						leaderboard.gameStats
							.slice(0, bestNearbyUser)
							.map((s, i) => <LeaderboardRow key={s.userID} s={s} i={i + 1} />)}
					{bestNearbyUser > 4 && (
						<tr style={{ lineHeight: "0.5rem" }}>
							<td colSpan={4}>...</td>
						</tr>
					)}
					{[...stats.above, stats.thisUsersStats, ...stats.below].map((s, i) => (
						<LeaderboardRow
							key={s.userID}
							s={s}
							i={stats.thisUsersRanking.ranking - stats.above.length + i}
						/>
					))}
				</>
			</MiniTable>
		</Card>
	);
}
