import MiniTable from "components/tables/components/MiniTable";
import Divider from "components/util/Divider";
import React from "react";
import {
	Game,
	ScoreCalculatedDataLookup,
	GetGamePTConfig,
	IDStrings,
	PublicUserDocument,
	FormatGame,
} from "tachi-common";
import { UGPTStatsReturn } from "types/api-returns";
import { Playtype } from "types/tachi";
import { MillisToSince } from "util/time";
import ProfilePicture from "./ProfilePicture";
import Navbar from "components/nav/Navbar";
import NavItem from "components/nav/NavItem";
import ClassBadge from "components/game/ClassBadge";
import { FormatGPTRating, UppercaseFirst } from "util/misc";
import ProfileBadges from "./ProfileBadges";
import { GameClassSets } from "tachi-common/js/game-classes";

export default function UGPTHeader({
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
		<div className="row">
			<div className="col-12">
				<div className="card card-custom">
					<div className="card-header">
						<h4>
							{reqUser.username}'s {FormatGame(game, playtype)} Profile
						</h4>
					</div>
					<div className="card-body">
						<div className="row align-items-center">
							<div className="col-12 col-lg-3">
								<div className="d-flex justify-content-center mb-3">
									<ProfilePicture user={reqUser} />
								</div>
								<div
									className="d-flex align-items-center"
									style={{ flexDirection: "column" }}
								>
									<ProfileBadges badges={reqUser.badges} />
								</div>
								<div className="d-block d-lg-none">
									<Divider className="mt-4 mb-4" />
								</div>
							</div>

							<div className="col-12 col-md-6 col-lg-3">
								<MiniTable
									className="table-sm text-center"
									headers={["Player Info"]}
									colSpan={2}
								>
									<tr>
										<td>Playcount</td>
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
											{stats.firstScore === null ||
											stats.firstScore.timeAchieved === null
												? "Unknown."
												: MillisToSince(stats.firstScore.timeAchieved)}
										</td>
									</tr>
								</MiniTable>
							</div>
							<div className="col-12 col-md-6 col-lg-3">
								<MiniTable
									className="table-sm text-center"
									headers={["Player Stats"]}
									colSpan={2}
								>
									<>
										{(Object.keys(
											gptConfig.classHumanisedFormat
										) as GameClassSets[IDStrings][]).map(k => (
											<tr key={k}>
												<td>{UppercaseFirst(k)}</td>
												<td>
													{stats.gameStats.classes[k] ? (
														<ClassBadge
															showSetOnHover={false}
															key={`${k}:${stats.gameStats.classes[k]}`}
															game={game}
															playtype={playtype}
															classSet={k}
															classValue={stats.gameStats.classes[k]!}
														/>
													) : (
														"No Data"
													)}
												</td>
											</tr>
										))}
										{Object.entries(stats.gameStats.ratings).map(([k, v]) => (
											<tr key={k}>
												<td>{UppercaseFirst(k)}</td>
												<td>
													{FormatGPTRating(
														game,
														playtype,
														k as ScoreCalculatedDataLookup[IDStrings],
														v
													)}
												</td>
											</tr>
										))}
									</>
								</MiniTable>
							</div>
							<div className="col-12 col-lg-3">
								<RankingData
									ranking={stats.rankingData.ranking}
									outOf={stats.rankingData.outOf}
								/>
							</div>
						</div>
					</div>
					<div className="card-footer pb-0 pt-0">
						<BottomNav
							baseUrl={`/dashboard/users/${reqUser.username}/games/${game}/${playtype}`}
						/>
					</div>
				</div>
			</div>
			<div className="col-12">
				<Divider className="mt-8 mb-4" />
			</div>
		</div>
	);
}

function RankingData({ ranking, outOf }: { ranking: number; outOf: number }) {
	return (
		<div className="row text-center">
			<div className="col-12">
				<h4>Ranking</h4>
			</div>
			<div className="col-12">
				<strong className="display-4">#{ranking}</strong>
				<span className="text-muted">/{outOf}</span>
			</div>
		</div>
	);
}

function BottomNav({ baseUrl }: { baseUrl: string }) {
	return (
		<div className="row align-items-center mb-0">
			<Navbar>
				<NavItem to={`${baseUrl}/`}>Overview</NavItem>
				<NavItem to={`${baseUrl}/scores`}>Scores</NavItem>
				<NavItem to={`${baseUrl}/folders`}>Folders</NavItem>
				<NavItem to={`${baseUrl}/achievables`}>Goals &amp; Milestones</NavItem>
				<NavItem to={`${baseUrl}/sessions`}>Sessions</NavItem>
				<NavItem to={`${baseUrl}/leaderboard`}>Leaderboard</NavItem>
				<NavItem to={`${baseUrl}/leaderboard`}>Settings</NavItem>
			</Navbar>
		</div>
	);
}
