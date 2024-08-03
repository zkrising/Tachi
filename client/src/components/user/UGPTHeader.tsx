import { FormatDurationHours, MillisToSince } from "util/time";
import { APIFetchV1 } from "util/api";
import { HumaniseError } from "util/humanise-error";
import { SendErrorToast, SendSuccessToast } from "util/toaster";
import Navbar from "components/nav/Navbar";
import MiniTable from "components/tables/components/MiniTable";
import Divider from "components/util/Divider";
import React, { useContext } from "react";
import { Button } from "react-bootstrap";
import { Game, Playtype, UserDocument, integer } from "tachi-common";
import { UGPTStatsReturn } from "types/api-returns";
import useLUGPTSettings from "components/util/useLUGPTSettings";
import { UserSettingsContext } from "context/UserSettingsContext";
import FollowUserButton from "components/util/FollowUserButton";
import { GetGPTUtilsName } from "components/gpt-utils/GPTUtils";
import ApiError from "components/util/ApiError";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import QuickTooltip from "components/layout/misc/QuickTooltip";
import { TachiConfig } from "lib/config";
import ProfileBadges from "./ProfileBadges";
import ProfilePicture from "./ProfilePicture";
import RankingData from "./UGPTRankingData";
import UGPTRatingsTable from "./UGPTStatsOverview";

export function UGPTHeaderBody({
	reqUser,
	game,
	playtype,
	stats,
}: {
	reqUser: UserDocument;
	game: Game;
	playtype: Playtype;
	stats: UGPTStatsReturn;
}) {
	const { settings, setSettings } = useLUGPTSettings();
	const { settings: userSettings } = useContext(UserSettingsContext);

	const { data: MAX_RIVALS, error } = useApiQuery<integer>("/config/max-rivals");

	if (error) {
		return <ApiError error={error} />;
	}

	if (!MAX_RIVALS) {
		return <Loading />;
	}

	return (
		<>
			<div className="col-12 col-lg-3">
				<div className="d-flex justify-content-center mb-3">
					<ProfilePicture user={reqUser} />
				</div>
				<div className="d-flex align-items-center" style={{ flexDirection: "column" }}>
					<ProfileBadges user={reqUser} />
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
					<tr>
						<td>
							<QuickTooltip
								tooltipContent={`All of your session lengths added together. This makes for a rough estimate of playtime, depending on how much you use ${TachiConfig.NAME}.`}
							>
								<div
									style={{
										textDecoration: "underline",
										textDecorationStyle: "dotted",
									}}
								>
									Session Playtime
								</div>
							</QuickTooltip>
						</td>
						<td>{FormatDurationHours(stats.playtime)}</td>
					</tr>
				</MiniTable>
			</div>
			<div className="col-12 col-md-6 col-lg-3">
				<UGPTRatingsTable ugs={stats.gameStats} />
			</div>
			<div className="col-12 col-lg-3">
				<RankingData
					rankingData={stats.rankingData}
					game={game}
					playtype={playtype}
					userID={reqUser.id}
				/>
			</div>
			{/* if someone is logged in and they aren't the user they're viewing */}
			{/* give them the option to add them as a rival or follow them */}
			{userSettings && reqUser.id !== userSettings.userID && (
				<div
					className="col-12 w-100 d-flex justify-content-center mt-8"
					style={{
						gap: "30px",
					}}
				>
					{/* has the logged in user played this game? */}
					{/* otherwise, they can't rival. */}
					{settings && (
						<>
							{settings.rivals.includes(reqUser.id) ? (
								<Button
									variant="outline-danger"
									onClick={async () => {
										const newRivals = settings.rivals.filter(
											(e) => e !== reqUser.id
										);

										const res = await APIFetchV1(
											`/users/${settings.userID}/games/${game}/${playtype}/rivals`,
											{
												method: "PUT",
												body: JSON.stringify({
													rivalIDs: newRivals,
												}),
												headers: {
													"Content-Type": "application/json",
												},
											}
										);

										if (res.success) {
											SendSuccessToast(
												`Removed ${reqUser.username} from your rivals.`
											);
											setSettings({
												...settings,
												rivals: newRivals,
											});
										} else {
											SendErrorToast(HumaniseError(res.description));
										}
									}}
								>
									Remove as Rival
								</Button>
							) : (
								<Button
									variant="outline-success"
									disabled={settings.rivals.length >= MAX_RIVALS}
									onClick={async () => {
										const newRivals = [...settings.rivals, reqUser.id];

										const res = await APIFetchV1(
											`/users/${settings.userID}/games/${game}/${playtype}/rivals`,
											{
												method: "PUT",
												body: JSON.stringify({
													rivalIDs: newRivals,
												}),
												headers: {
													"Content-Type": "application/json",
												},
											}
										);

										if (res.success) {
											SendSuccessToast(
												`Added ${reqUser.username} to your rivals!`
											);
											setSettings({
												...settings,
												rivals: newRivals,
											});
										} else {
											SendErrorToast(HumaniseError(res.description));
										}
									}}
								>
									{settings.rivals.length >= MAX_RIVALS
										? "At max rivals!"
										: "Add as rival"}
								</Button>
							)}
						</>
					)}
					<FollowUserButton userToFollow={reqUser} />
				</div>
			)}
		</>
	);
}

export function UGPTBottomNav({
	baseUrl,
	isRequestedUser,
	game,
	playtype,
}: {
	baseUrl: string;
	isRequestedUser: boolean;
	game: Game;
	playtype: Playtype;
}) {
	const navItems = [
		<Navbar.Item key="overview" to={`${baseUrl}/`}>
			Overview & Activity
		</Navbar.Item>,
		<Navbar.Item key="scores" to={`${baseUrl}/scores`}>
			Scores
		</Navbar.Item>,
		<Navbar.Item key="folders" to={`${baseUrl}/folders`}>
			Folders
		</Navbar.Item>,
		<Navbar.Item key="sessions" to={`${baseUrl}/sessions`}>
			Sessions
		</Navbar.Item>,
	];

	const utilsName = GetGPTUtilsName(game, playtype, isRequestedUser);

	if (utilsName) {
		navItems.push(
			<Navbar.Item key="utils" to={`${baseUrl}/utils`}>
				{utilsName}
			</Navbar.Item>
		);
	}

	if (isRequestedUser) {
		navItems.push(
			<Navbar.Item key="rivals" to={`${baseUrl}/rivals`}>
				Rivals
			</Navbar.Item>,
			<Navbar.Item key="targets" to={`${baseUrl}/targets`}>
				Goals & Quests
			</Navbar.Item>
		);
	}

	navItems.push(
		<Navbar.Item key="leaderboard" to={`${baseUrl}/leaderboard`}>
			Leaderboard
		</Navbar.Item>
	);

	if (isRequestedUser) {
		navItems.push(
			<Navbar.Item key="settings" to={`${baseUrl}/settings`}>
				Settings
			</Navbar.Item>
		);
	}

	return (
		<div className="mx-n9 align-items-center mb-0">
			<Navbar>{navItems}</Navbar>
		</div>
	);
}
