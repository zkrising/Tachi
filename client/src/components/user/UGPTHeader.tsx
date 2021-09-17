import MiniTable from "components/tables/components/MiniTable";
import Divider from "components/util/Divider";
import React from "react";
import { Game, GetGamePTConfig, PublicUserDocument } from "tachi-common";
import { UGPTStatsReturn } from "types/api-returns";
import { Playtype } from "types/tachi";
import { MillisToSince } from "util/time";
import ProfilePicture from "./ProfilePicture";
import Navbar from "components/nav/Navbar";
import NavItem from "components/nav/NavItem";
import ProfileBadges from "./ProfileBadges";
import UGPTRatingsTable from "./UGPTStatsOverview";
import RankingData from "./UGPTRankingData";

export function UGPTHeaderBody({
	reqUser,
	game,
	playtype,
	stats,
}: {
	reqUser: PublicUserDocument;
	game: Game;
	playtype: Playtype;
	stats: UGPTStatsReturn;
}) {
	const gptConfig = GetGamePTConfig(game, playtype);

	return (
		<>
			<div className="col-12 col-lg-3">
				<div className="d-flex justify-content-center mb-3">
					<ProfilePicture user={reqUser} />
				</div>
				<div className="d-flex align-items-center" style={{ flexDirection: "column" }}>
					<ProfileBadges badges={reqUser.badges} />
				</div>
				<div className="d-block d-lg-none">
					<Divider className="mt-4 mb-4" />
				</div>
			</div>

			<div className="col-12 col-md-6 col-lg-3">
				<MiniTable className="table-sm text-center" headers={["Player Info"]} colSpan={2}>
					<tr>
						<td>Scores</td>
						<td>{stats.totalScores}</td>
					</tr>
					<tr>
						<td>Last Played</td>
						<td>
							{stats.mostRecentScore === null ||
							stats.mostRecentScore.timeAchieved === null
								? "Unknown."
								: MillisToSince(stats.mostRecentScore.timeAchieved)}
						</td>
					</tr>
					<tr>
						<td>First Play</td>
						<td>
							{stats.firstScore === null || stats.firstScore.timeAchieved === null
								? "Unknown."
								: MillisToSince(stats.firstScore.timeAchieved)}
						</td>
					</tr>
				</MiniTable>
			</div>
			<div className="col-12 col-md-6 col-lg-3">
				<UGPTRatingsTable ugs={stats.gameStats} />
			</div>
			<div className="col-12 col-lg-3">
				<RankingData rankingData={stats.rankingData} game={game} playtype={playtype} />
			</div>
		</>
	);
}

export function UGPTBottomNav({
	baseUrl,
	isRequestedUser,
}: {
	baseUrl: string;
	isRequestedUser: boolean;
}) {
	const navItems = [
		<NavItem key="overview" to={`${baseUrl}/`}>
			Overview
		</NavItem>,
		<NavItem key="scores" to={`${baseUrl}/scores`}>
			Scores
		</NavItem>,
		<NavItem key="folders" to={`${baseUrl}/folders`}>
			Folders
		</NavItem>,
		// <NavItem key="goals" to={`${baseUrl}/achievables`}>
		// 	Goals &amp; Milestones
		// </NavItem>,
		<NavItem key="sessions" to={`${baseUrl}/sessions`}>
			Sessions
		</NavItem>,
		<NavItem key="leaderboard" to={`${baseUrl}/leaderboard`}>
			Leaderboard
		</NavItem>,
	];

	if (isRequestedUser) {
		navItems.push(
			<NavItem key="settings" to={`${baseUrl}/settings`}>
				Settings
			</NavItem>
		);
	}

	return (
		<div className="row align-items-center mb-0">
			<Navbar>{navItems}</Navbar>
		</div>
	);
}
