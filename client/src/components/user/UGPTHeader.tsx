import { APIFetchV1 } from "util/api";
import { MillisToSince } from "util/time";
import { HumaniseError } from "util/humanise-error";
import { SendErrorToast, SendSuccessToast } from "util/toaster";
import Navbar from "components/nav/Navbar";
import React, { useContext, useState } from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import {
	Game,
	Playtype,
	UserDocument,
	integer,
	FormatGameLess,
	UserGameStats,
	UGPTSettingsDocument,
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
import useBreakpoint from "components/util/useBreakpoint";
import ProfilePicture from "./ProfilePicture";
import { TidyRankingData } from "./UGPTRankingData";
import { UGPTClassBadge, UGPTPrimaryRating, UGPTOtherRatings } from "./UGPTStatsOverview";
import Skeleton from "./UserSkeleton";

export function UGPTHeaderBody({
	reqUser,
	game,
	playtype,
	stats,
}: {
	reqUser: UserDocument;
	game: Game;
	playtype: Playtype;
	stats?: UGPTStatsReturn;
}) {
	const { settings, setSettings } = useLUGPTSettings();
	const { settings: userSettings } = useContext(UserSettingsContext);
	const ugs: UserGameStats | undefined = stats ? stats.gameStats : undefined;

	//const gptConfig = GetGamePTConfig(ugs.game, ugs.playtype);
	//const ratings = Object.entries(ugs.ratings) as [ProfileRatingAlgorithms[GPTString], number][];

	const { data: MAX_RIVALS, error } = useApiQuery<integer>("/config/max-rivals");

	const { isLg } = useBreakpoint();

	if (error) {
		return <ApiError error={error} />;
	}

	return (
		<>
			<Row
				id={`${reqUser.username}-${game}${playtype === "Single" ? "" : `${playtype}`}-info`}
				className="pt-2 pt-lg-4 justify-content-between"
			>
				<Col lg={"auto"} className="d-flex p-0 px-lg-2">
					<ProfilePicture user={reqUser} isSupporter={reqUser.isSupporter} />
					<div className="d-flex ms-4 flex-column flex-lg-column-reverse flex-lg-grow-1">
						<div className="d-flex align-items-start align-items-md-center">
							<h3 className="enable-rfs overflow-hidden flex-grow-1 flex-md-grow-0 mb-0">
								{reqUser.username}'s{" "}
								<span className="text-nowrap">
									{FormatGameLess(game)}

									{playtype === "Single" ? "" : <sup> {playtype}</sup>}
								</span>{" "}
								Profile
							</h3>
						</div>
						{stats ? (
							<>
								<h3 className="fw-light mb-0">
									<TidyRankingData
										rankingData={stats.rankingData}
										game={game}
										playtype={playtype}
										userID={reqUser.id}
									/>
								</h3>
								<small className="fw-light mb-lg-1 flex-grow-1 flex-lg-grow-0">
									{stats.totalScores}{" "}
									{stats.totalScores === 1 ? "Score" : "Scores"}
								</small>
								<div className="flex-lg-grow-1 fw-light">
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
											<small className="text-body-secondary">
												Last Played{" "}
												{MillisToSince(stats.mostRecentScore.timeAchieved)}
											</small>
										)}
									</QuickTooltip>
								</div>
							</>
						) : (
							<Skeleton.Info />
						)}
					</div>
				</Col>
				<Col lg={"auto"} className="d-lg-flex p-0 px-lg-2 mt-n2" id="rating-info">
					<Row
						lg={2}
						className="justify-content-between w-100 ms-0 mt-2 mt-lg-0 flex-lg-nowrap justify-content-lg-end"
					>
						{ugs ? (
							<>
								<Col
									xs={5}
									lg="auto"
									className="d-flex me-2 me-lg-4 mb-lg-1 p-0 text-lg-end align-self-lg-end justify-content-start justify-content-lg-end align-items-start align-items-lg-end"
								>
									<UGPTClassBadge className="me-2 mt-2 mb-lg-0" ugs={ugs} />
								</Col>
								<Col
									xs="auto"
									className="d-flex flex-column justify-content-end align-items-end ms-auto p-0 mt-lg-0 mb-lg-n2"
								>
									<>
										<UGPTOtherRatings
											className="fs-3 fs-lg-2 text-nowrap enable-rfs"
											ugs={ugs}
										/>
										<UGPTPrimaryRating
											className="display-3 text-nowrap fw-normal enable-rfs"
											ugs={ugs}
										/>
									</>
								</Col>
							</>
						) : (
							<Skeleton.Rating />
						)}
					</Row>
				</Col>
				{/* allow logged in users to follow and rival other players */}
				{userSettings && reqUser.id !== userSettings.userID && (
					<Col
						className={`d-flex justify-content-end ${
							isLg ? "position-absolute" : ""
						} p-0 pe-lg-8`}
					>
						{settings && MAX_RIVALS && (
							<>
								{/* has the logged in user played this game? */}
								{/* otherwise, they can't rival. */}

								<RivalButton
									className="me-2"
									settings={settings}
									reqUser={reqUser}
									game={game}
									playtype={playtype}
									setSettings={setSettings}
									maxRivals={MAX_RIVALS}
									breakpoint={isLg}
									add={!settings.rivals.includes(reqUser.id)}
								/>
							</>
						)}
						<FollowUserButton
							userToFollow={reqUser}
							tooltipPlacement={isLg ? "top" : "bottom"}
						/>
					</Col>
				)}
			</Row>
		</>
	);
}

export function RivalButton({
	reqUser,
	game,
	playtype,
	settings,
	setSettings,
	maxRivals,
	add = false,
	breakpoint,
	className,
}: {
	reqUser: UserDocument;
	game: Game;
	playtype: Playtype;
	settings: UGPTSettingsDocument;
	setSettings: (newSettings: UGPTSettingsDocument) => void;
	maxRivals: number;
	add?: boolean;
	breakpoint: boolean;
	className?: string;
}) {
	const [isAwait, setIsAwait] = useState(false);

	let handleRival: () => void;
	if (add) {
		handleRival = async function () {
			setIsAwait(true);
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
				setIsAwait(false);
				SendSuccessToast(`Added ${reqUser.username} to your rivals!`);
				setSettings({
					...settings,
					rivals: newRivals,
				});
			} else {
				setIsAwait(false);
				SendErrorToast(HumaniseError(res.description));
			}
		};
	} else {
		handleRival = async function () {
			setIsAwait(true);
			const newRivals = settings.rivals.filter((e) => e !== reqUser.id);

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
				setIsAwait(false);
				SendSuccessToast(`Removed ${reqUser.username} from your rivals.`);
				setSettings({
					...settings,
					rivals: newRivals,
				});
			} else {
				setIsAwait(false);
				SendErrorToast(HumaniseError(res.description));
			}
		};
	}

	function handleMaxRivals() {
		SendErrorToast("Rivals list full!");
	}

	const maxRivalsReached = settings.rivals.length >= maxRivals;
	const waiting = isAwait ? "waiting" : "";
	const buttonStyle = add
		? maxRivalsReached
			? "disabled"
			: "bg-hover-success"
		: "bg-hover-danger";
	const buttonText = add ? "Add to Rivals" : "Remove Rival";

	return (
		<QuickTooltip
			tooltipContent="Rivals list full!"
			show={maxRivalsReached ? undefined : false}
			placement={breakpoint ? "top" : "bottom"}
			className="d-none d-md-block"
		>
			<Button
				size="sm"
				variant="secondary"
				className={`${buttonStyle} ${className} fw-light user-select-none border-0 ${waiting}`}
				onClick={maxRivalsReached ? handleMaxRivals : handleRival}
			>
				{buttonText}
			</Button>
		</QuickTooltip>
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
	const utilsName = GetGPTUtilsName(game, playtype, isRequestedUser);

	const utilsItem = utilsName ? (
		<Navbar.Item to={`${baseUrl}/utils`}>{utilsName}</Navbar.Item>
	) : (
		<></>
	);

	const userItems = isRequestedUser ? (
		<>
			<Navbar.Item key="rivals" to={`${baseUrl}/rivals`}>
				Rivals
			</Navbar.Item>
			<Navbar.Item key="targets" to={`${baseUrl}/targets`}>
				Goals & Quests
			</Navbar.Item>
		</>
	) : (
		<></>
	);

	const leaderboard = (
		<Navbar.Item key="leaderboard" to={`${baseUrl}/leaderboard`}>
			Leaderboard
		</Navbar.Item>
	);

	const settings = isRequestedUser ? (
		<Navbar.Item key="settings" to={`${baseUrl}/settings`}>
			Settings
		</Navbar.Item>
	) : (
		<></>
	);

	return (
		<Navbar>
			<Navbar.Item key="overview" to={`${baseUrl}`}>
				Overview
			</Navbar.Item>
			<Navbar.Item key="scores" to={`${baseUrl}/scores`}>
				Scores
			</Navbar.Item>
			<Navbar.Item key="folders" to={`${baseUrl}/folders`}>
				Folders
			</Navbar.Item>
			<Navbar.Item key="sessions" to={`${baseUrl}/sessions`}>
				Sessions
			</Navbar.Item>
			{utilsItem}
			{userItems}
			{leaderboard}
			{settings}
		</Navbar>
	);
}
