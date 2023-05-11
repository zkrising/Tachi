import { APIFetchV1 } from "util/api";
import { MillisToSince } from "util/time";
import { HumaniseError } from "util/humanise-error";
import { SendErrorToast, SendSuccessToast } from "util/toaster";
import Navbar from "components/nav/Navbar";
import React, { useContext } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import {
	Game,
	Playtype,
	UserDocument,
	integer,
	FormatGameLess,
	UserGameStats,
	//Classes,
} from "tachi-common";
import { UGPTStatsReturn } from "types/api-returns";
import useLUGPTSettings from "components/util/useLUGPTSettings";
import { UserSettingsContext } from "context/UserSettingsContext";
import FollowUserButton from "components/util/FollowUserButton";
//import ProfileBadges from "./ProfileBadges";
import { GetGPTUtilsName } from "components/gpt-utils/GPTUtils";
import ApiError from "components/util/ApiError";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import QuickTooltip from "components/layout/misc/QuickTooltip";
import ProfilePicture from "./ProfilePicture";
import { TidyRankingData } from "./UGPTRankingData";
import { UGPTClassBadge, UGPTPrimaryRating, UGPTOtherRatings } from "./UGPTStatsOverview";

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
	const ugs: UserGameStats = stats.gameStats;

	//const gptConfig = GetGamePTConfig(ugs.game, ugs.playtype);
	//const ratings = Object.entries(ugs.ratings) as [ProfileRatingAlgorithms[GPTString], number][];

	const { data: MAX_RIVALS, error } = useApiQuery<integer>("/config/max-rivals");

	if (error) {
		return <ApiError error={error} />;
	}

	if (!MAX_RIVALS) {
		return <Loading />;
	}

	return (
		<>
			<Row
				id={`${reqUser.username}-${game}${playtype === "Single" ? "" : `${playtype}`}-info`}
				className="pt-6 justify-content-between"
			>
				<Col lg={"auto"} className="d-flex" id="user-info">
					<ProfilePicture user={reqUser} />
					<div className="d-flex ms-4 flex-column flex-lg-column-reverse flex-lg-grow-1">
						<h3 className="enable-rfs overflow-hidden mb-lg-0">
							{reqUser.username}'s{" "}
							<span className="text-nowrap">
								{FormatGameLess(game)}

								{playtype === "Single" ? "" : <sup> {playtype}</sup>}
							</span>{" "}
							Profile
						</h3>
						<h3 className="fw-light">
							<TidyRankingData
								rankingData={stats.rankingData}
								game={game}
								playtype={playtype}
								userID={reqUser.id}
							/>
						</h3>
						<div className="fw-light mb-lg-2 flex-grow-1 flex-lg-grow-0">
							{stats.totalScores} {stats.totalScores === 1 ? "Score" : "Scores"}
						</div>
						<div className="flex-lg-grow-1">
							<QuickTooltip // Last Played / First Played
								placement="auto"
								tooltipContent={`First Played
							${
								stats.firstScore === null || stats.firstScore.timeAchieved === null
									? "Unknown."
									: MillisToSince(stats.firstScore.timeAchieved)
							}`}
							>
								{stats.mostRecentScore === null ||
								stats.mostRecentScore.timeAchieved === null ? (
									<></>
								) : (
									<small className="text-muted">
										Last Played{" "}
										{MillisToSince(stats.mostRecentScore.timeAchieved)}
									</small>
								)}
							</QuickTooltip>
						</div>
					</div>
				</Col>
				<Col lg={"auto"} className="d-lg-flex" id="rating-info">
					<Row
						lg={2}
						className="justify-content-between w-100 ms-0 mt-2 flex-lg-nowrap justify-content-lg-end"
					>
						<Col
							xs={5}
							lg="auto"
							className="me-2 mb-lg-2 me-lg-5 p-0 text-lg-end align-self-lg-end"
						>
							<UGPTClassBadge className="m-1" ugs={ugs} />
						</Col>
						<Col
							xs="auto"
							className="d-flex flex-column align-items-end ms-auto me-0 p-0 justify-content-lg-end"
						>
							<UGPTOtherRatings
								className="fs-3 fs-lg-2 text-nowrap enable-rfs"
								ugs={ugs}
							/>
							<UGPTPrimaryRating
								className="display-3 text-nowrap fw-normal enable-rfs"
								ugs={ugs}
							/>
						</Col>
					</Row>
				</Col>
			</Row>
			{/*
			
			<UGPTRatingsTable ugs={stats.gameStats} />

			<div className="d-flex align-items-center" style={{ flexDirection: "column" }}>
					<ProfileBadges user={reqUser} />
				</div>
			
			*/}
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
					{<FollowUserButton userToFollow={reqUser} />}
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
		<Navbar.Item key="overview" to={`${baseUrl}`}>
			Overview
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
			<Navbar.Item key="targets" to={`${baseUrl}/utils`}>
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

	return <Navbar>{navItems}</Navbar>;
}
