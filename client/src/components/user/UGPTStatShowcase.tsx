import Card from "components/layout/page/Card";
import CardHeader from "components/layout/page/CardHeader";
import CardNavButton from "components/layout/page/CardNavButton";
import AsyncLoader from "components/util/AsyncLoader";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import ReferToUser from "components/util/ReferToUser";
import { UserContext } from "context/UserContext";
import { UserGameStatsContext } from "context/UserGameStatsContext";
import { nanoid } from "nanoid";
import React, { useContext, useState } from "react";
import { Alert, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
	PublicUserDocument,
	Game,
	GetGamePTConfig,
	SongDocument,
	ChartDocument,
	FormatChart,
	FolderDocument,
	ShowcaseStatDetails,
} from "tachi-common";
import { UGPTPreferenceStatsReturn } from "types/api-returns";
import { GamePT } from "types/react";
import { Playtype } from "types/tachi";
import { APIFetchV1 } from "util/api";
import { CreateChartLink } from "util/data";
import { ToPercent, UppercaseFirst } from "util/misc";
import UGPTStatContainer from "./UGPTStatContainer";
import UGPTStatCreator from "./UGPTStatCreator";

export default function UGPTStatShowcase({
	reqUser,
	game,
	playtype,
}: { reqUser: PublicUserDocument } & GamePT) {
	const { ugs } = useContext(UserGameStatsContext);
	const { user } = useContext(UserContext);

	const [projectingStats, setProjectingStats] = useState(false);

	const hasUserPlayedGame =
		ugs && !!ugs.filter(e => e.game === game && e.playtype === playtype).length;

	const userIsReqUser = user && user.id === reqUser.id;

	const shouldFetchThisUserData = hasUserPlayedGame && !userIsReqUser;

	const [customShow, setCustomShow] = useState(false);
	const [customStat, setCustomStat] = useState<ShowcaseStatDetails | null>(null);

	return (
		<>
			<Card
				className="card-dark"
				header={
					<CardHeader
						rightContent={
							userIsReqUser ? (
								<CardNavButton
									type="edit"
									to={`/dashboard/users/${
										user!.username
									}/games/${game}/${playtype}/settings?showcase=yea`}
									hoverText="Modify your statistics showcase."
								/>
							) : null
						}
					>
						<h3>
							{projectingStats
								? `${user!.username}'s Stat Showcase (Projected onto ${
										reqUser.username
								  })`
								: `${reqUser.username}'s Stat Showcase`}
						</h3>
					</CardHeader>
				}
				footer={
					<div className="d-flex w-100 justify-content-center">
						<div className="btn-group">
							{hasUserPlayedGame &&
								!userIsReqUser &&
								(projectingStats ? (
									<OverlayTrigger
										placement="top"
										overlay={
											<Tooltip id="quick-panel-tooltip">
												Return to {reqUser.username}'s selected stats.
											</Tooltip>
										}
									>
										<div
											className="btn btn-success"
											onClick={() => setProjectingStats(false)}
										>
											<i
												className="fas fa-sync"
												style={{ paddingRight: 0 }}
											/>
										</div>
									</OverlayTrigger>
								) : (
									<OverlayTrigger
										placement="top"
										overlay={
											<Tooltip id={nanoid()}>
												Change the displayed stats to the same ones you use!
											</Tooltip>
										}
									>
										<div
											className="btn btn-outline-secondary"
											onClick={() => setProjectingStats(true)}
										>
											<i
												className="fas fa-sync"
												style={{ paddingRight: 0 }}
											/>
										</div>
									</OverlayTrigger>
								))}
							<OverlayTrigger
								placement="top"
								overlay={
									<Tooltip id="quick-panel-tooltip">
										Evaluate a custom statistic.
									</Tooltip>
								}
							>
								<div
									className="btn btn-outline-secondary"
									onClick={() => setCustomShow(true)}
								>
									<i
										className="fas fa-file-signature"
										style={{ paddingRight: 0 }}
									/>
								</div>
							</OverlayTrigger>
						</div>
					</div>
				}
			>
				<AsyncLoader
					promiseFn={async () => {
						const res = await APIFetchV1<UGPTPreferenceStatsReturn[]>(
							`/users/${reqUser.id}/games/${game}/${playtype}/showcase${
								projectingStats ? `?projectUser=${user!.id}` : ""
							}`
						);

						if (!res.success) {
							throw new Error(res.description);
						}

						if (shouldFetchThisUserData) {
							const res2 = await APIFetchV1<UGPTPreferenceStatsReturn[]>(
								`/users/${user!.id}/games/${game}/${playtype}/showcase${
									!projectingStats ? `?projectUser=${reqUser.id}` : ""
								}`
							);

							if (!res2.success) {
								throw new Error(res2.description);
							}

							return { reqUserData: res.body, thisUserData: res2.body };
						}

						return { reqUserData: res.body };
					}}
				>
					{data => (
						<div className="container">
							{customStat ? (
								<div className="row justify-content-center">
									<div className="col-12 col-lg-4 lg-offset-8">
										<Alert variant="info" className="text-center">
											CUSTOM STAT{" "}
											<span className="float-right">
												<Icon
													type="times"
													onClick={() => setCustomStat(null)}
												/>
											</span>
										</Alert>
										<UGPTStatContainer
											shouldFetchCompareID={
												(shouldFetchThisUserData && user!.id) || undefined
											}
											stat={customStat}
											reqUser={reqUser}
											game={game}
											playtype={playtype}
										/>
									</div>

									<Divider className="mt-4" />
								</div>
							) : (
								<></>
							)}
							{data.reqUserData.length === 0 ? (
								<div className="row">
									<div className="col-12 text-center">
										<ReferToUser reqUser={projectingStats ? user! : reqUser} />{" "}
										no stats configured.
									</div>
									{userIsReqUser && (
										<div className="col-12 mt-2 text-center">
											Why not{" "}
											<Link
												to={`/dashboard/users/${
													user!.username
												}/games/${game}/${playtype}/settings`}
											>
												Set Some?
											</Link>
										</div>
									)}
								</div>
							) : (
								<div className="row justify-content-center">
									{data.reqUserData.map((e, i) => (
										<div
											key={i}
											className="col-12 col-md-4 d-flex align-items-stretch mt-8"
										>
											<StatDisplay
												reqUser={reqUser}
												statData={e}
												compareData={
													data.thisUserData
														? data.thisUserData[i]
														: undefined
												}
												game={game}
												playtype={playtype}
											/>
										</div>
									))}
								</div>
							)}
						</div>
					)}
				</AsyncLoader>
			</Card>
			<UGPTStatCreator
				show={customShow}
				setShow={setCustomShow}
				game={game}
				playtype={playtype}
				onCreate={stat => setCustomStat(stat)}
				reqUser={reqUser}
			/>
		</>
	);
}

function StatDelta({
	v1,
	v2,
	mode,
	property,
	game,
	playtype,
}: {
	v1: number;
	v2?: number;
	mode: "folder" | "chart";
	property: UGPTPreferenceStatsReturn["stat"]["property"];
	game: Game;
	playtype: Playtype;
}) {
	if (!v2) {
		// @warn: This means things like BPI goals can go negative and spit nonsense
		// eslint-disable-next-line no-param-reassign
		v2 = 0;
	}

	let d: string | number = v2 - v1;
	const formattedV2 = FormatValue(game, playtype, mode, property, v2);
	if (property === "percent") {
		d = `${d.toFixed(2)}%`;
	}

	let colour;
	if (v2 === v1) {
		colour = "warning";
	} else if (v2 > v1) {
		colour = "success";
	} else {
		colour = "danger";
	}

	return (
		<div className={`mt-2 text-${colour}`}>
			<span>
				You: {formattedV2} ({v2 > v1 ? `+${d}` : v2 === v1 ? `±${d}` : d})
			</span>
		</div>
	);
}

export function FormatValue(
	game: Game,
	playtype: Playtype,
	mode: "folder" | "chart",
	prop: "grade" | "lamp" | "score" | "percent" | "playcount",
	value: number
) {
	if (mode === "folder") {
		return value;
	}

	const gptConfig = GetGamePTConfig(game, playtype);

	if (prop === "percent") {
		return `${value.toFixed(2)}%`;
	} else if (prop === "grade") {
		return gptConfig.grades[value];
	} else if (prop === "lamp") {
		return gptConfig.lamps[value];
	}

	return value;
}

export function FormatPropertyGTE(
	game: Game,
	playtype: Playtype,
	prop: "grade" | "lamp" | "score" | "percent" | "playcount",
	gte: number
) {
	const gptConfig = GetGamePTConfig(game, playtype);

	if (gte === null) {
		return "NO DATA";
	}

	if (prop === "grade") {
		return gptConfig.grades[gte];
	} else if (prop === "lamp") {
		return gptConfig.lamps[gte];
	} else if (prop === "score" || prop === "playcount") {
		return gte;
	}
	// else if (prop === "percent") {
	return gte.toFixed(2);
	// }
}

export function GetStatName(
	stat: ShowcaseStatDetails,
	game: Game,
	related: UGPTPreferenceStatsReturn["related"]
) {
	if (stat.mode === "folder") {
		return (related as { folders: FolderDocument[] }).folders.map(e => e.title).join(",");
	} else if (stat.mode === "chart") {
		const r = related as { song: SongDocument; chart: ChartDocument };
		return FormatChart(game, r.song, r.chart);
	}

	// @ts-expect-error yeah it's an error state lol
	throw new Error(`Unknown stat.mode ${stat.mode}`);
}

export function StatDisplay({
	statData,
	reqUser,
	compareData,
	game,
	playtype,
}: {
	statData: UGPTPreferenceStatsReturn;
	compareData?: UGPTPreferenceStatsReturn;
	reqUser: PublicUserDocument;
} & GamePT) {
	const { stat, result, related } = statData;
	const { user } = useContext(UserContext);

	if (stat.mode === "chart") {
		const { song, chart } = related as { song: SongDocument; chart: ChartDocument };

		return (
			<Card
				className="text-center stat-overview-card w-100"
				header={<h5 className="text-muted mb-0">Chart</h5>}
			>
				<>
					<Link className="gentle-link" to={CreateChartLink(chart, game)}>
						<h4>{FormatChart(game, song, chart)}</h4>
					</Link>
					<h4>
						{UppercaseFirst(stat.property)}:{" "}
						{FormatPropertyGTE(game, playtype, stat.property, result.value)}
					</h4>
					{user && user.id !== reqUser.id && (
						<StatDelta
							v1={statData.result.value}
							v2={compareData?.result.value}
							mode={stat.mode}
							property={stat.property}
							game={game}
							playtype={playtype}
						/>
					)}
				</>
			</Card>
		);
	} else if (stat.mode === "folder") {
		const { folders } = related as { folders: FolderDocument[] };

		let headerStr;
		if (folders.length === 1) {
			headerStr = folders[0].title;
		} else {
			headerStr = folders.map(e => e.title).join(", ");
		}

		return (
			<Card
				className="text-center stat-overview-card w-100"
				header={<h5 className="text-muted mb-0">Folder</h5>}
			>
				<>
					<Link
						className="gentle-link"
						to={`/dashboard/users/${reqUser.id}/games/${game}/${playtype}/folders/${folders[0].folderID}`}
					>
						<h4>{headerStr}</h4>
					</Link>
					<h5>
						{UppercaseFirst(stat.property)} &gt;={" "}
						{FormatPropertyGTE(game, playtype, stat.property, stat.gte)}
					</h5>
					<h4>
						{result.value}
						<small className="text-muted">
							{/* @ts-expect-error This property definitely exists.*/}
							{/* */}/{result.outOf} ({ToPercent(result.value, result.outOf)})
						</small>
					</h4>

					{user && user.id !== reqUser.id && (
						<StatDelta
							v1={statData.result.value}
							v2={compareData?.result.value}
							mode={stat.mode}
							property={stat.property}
							game={game}
							playtype={playtype}
						/>
					)}
				</>
			</Card>
		);
	}

	return <></>;
}
