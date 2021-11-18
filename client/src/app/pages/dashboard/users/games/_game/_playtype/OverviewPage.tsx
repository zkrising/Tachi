import TimelineChart from "components/charts/TimelineChart";
import useSetSubheader from "components/layout/header/useSetSubheader";
import Card from "components/layout/page/Card";
import MiniTable from "components/tables/components/MiniTable";
import ScoreTable from "components/tables/scores/ScoreTable";
import UGPTStatShowcase from "components/user/UGPTStatShowcase";
import AsyncLoader from "components/util/AsyncLoader";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import SelectButton from "components/util/SelectButton";
import { DateTime } from "luxon";
import React, { useMemo, useState } from "react";
import { Badge } from "react-bootstrap";
import {
	FormatGame,
	GetGameConfig,
	GetGamePTConfig,
	PublicUserDocument,
	ScoreDocument,
	SessionDocument,
	UserGameStats,
} from "tachi-common";
import { SessionReturns, UGPTHistory } from "types/api-returns";
import { GamePT } from "types/react";
import { ScoreDataset } from "types/tables";
import { APIFetchV1 } from "util/api";
import { ONE_HOUR, ONE_MINUTE } from "util/constants/time";
import { CreateChartMap, CreateSongMap, GetPBs } from "util/data";
import { UppercaseFirst } from "util/misc";
import { NumericSOV } from "util/sorts";
import { FormatDate, FormatDuration, FormatTime, MillisToSince } from "util/time";

export default function OverviewPage({
	reqUser,
	game,
	playtype,
}: { reqUser: PublicUserDocument } & GamePT) {
	const gameConfig = GetGameConfig(game);
	useSetSubheader(
		["Users", reqUser.username, "Games", gameConfig.name, playtype],
		[reqUser, game, playtype],
		`${reqUser.username}'s ${FormatGame(game, playtype)} Overview`
	);

	return (
		<React.Fragment key={`${game}:${playtype}`}>
			<UGPTStatShowcase reqUser={reqUser} game={game} playtype={playtype} />
			<RankingInfo reqUser={reqUser} game={game} playtype={playtype} />
			<LastSession reqUser={reqUser} game={game} playtype={playtype} />
		</React.Fragment>
	);
}

function LastSession({ reqUser, game, playtype }: { reqUser: PublicUserDocument } & GamePT) {
	return (
		<AsyncLoader
			promiseFn={async () => {
				const res = await APIFetchV1<SessionDocument>(
					`/users/${reqUser.id}/games/${game}/${playtype}/sessions/last`
				);

				if (res.statusCode === 404) {
					return null;
				}

				if (!res.success) {
					throw new Error(res.description);
				}

				const sessionDataRes = await APIFetchV1<SessionReturns>(
					`/sessions/${res.body!.sessionID}`
				);

				if (!sessionDataRes.success) {
					throw new Error(res.description);
				}

				return { session: res.body, sessionData: sessionDataRes.body };
			}}
		>
			{data =>
				data && (
					<Card className="mt-4" header="Most Recent Session">
						<div className="row d-flex justify-content-center">
							{
								<>
									<div className="col-12 text-center">
										<h4 className="display-4">{data.session.name}</h4>
										<span className="text-muted">{data.session.desc}</span>
										<Divider className="mt-4 mb-8" />
									</div>

									<div className="col-12 col-lg-3 text-center">
										<MiniTable
											className="mt-4"
											headers={["Information"]}
											colSpan={2}
										>
											<tr>
												<td>Started</td>
												<td>{FormatTime(data.session.timeStarted)}</td>
											</tr>
											<tr>
												{/* If session ended less than 2 hours ago, it can still be appended to. */}
												{/* Kinda - time is a bit nonlinear wrt. importing scores, as scores don't have to have */}
												{/* happened at the same time they were imported. */}
												{/* that doesn't matter though - this is just a UI thing */}
												<td>
													{Date.now() - data.session.timeEnded <
													ONE_HOUR * 2
														? "Last Score"
														: "Ended At"}
												</td>
												<td>
													{FormatTime(data.session.timeEnded)}
													{/* if the last score was less than 10 mins ago, this session is probably still being populated */}
													{Date.now() - data.session.timeEnded <
														ONE_MINUTE * 10 && (
														<>
															<br />
															<Badge
																variant="primary"
																className="mt-2"
															>
																Ongoing!
															</Badge>
														</>
													)}
												</td>
											</tr>
											<tr>
												<td>Duration</td>
												<td>
													{FormatDuration(
														data.session.timeEnded -
															data.session.timeStarted
													)}
												</td>
											</tr>
											<tr>
												<td>Scores</td>
												<td>{data.session.scoreInfo.length}</td>
											</tr>
											<tr>
												<td>PBs</td>
												<td>{GetPBs(data.session.scoreInfo).length}</td>
											</tr>
										</MiniTable>
									</div>
									<div className="col-12 col-lg-9">
										<RecentSessionScoreInfo
											{...data}
											game={game}
											playtype={playtype}
											reqUser={reqUser}
										/>
									</div>
								</>
							}
						</div>
					</Card>
				)
			}
		</AsyncLoader>
	);
}

function RecentSessionScoreInfo({
	session,
	sessionData,
	game,
	playtype,
	reqUser,
}: {
	session: SessionDocument;
	sessionData: SessionReturns;
	reqUser: PublicUserDocument;
} & GamePT) {
	const highlightedScores = sessionData.scores.filter(e => e.highlight);

	const [mode, setMode] = useState<"highlight" | "best" | "recent">(
		highlightedScores.length > 0 ? "highlight" : "best"
	);

	const gptConfig = GetGamePTConfig(game, playtype);

	const songMap = CreateSongMap(sessionData.songs);
	const chartMap = CreateChartMap(sessionData.charts);

	const dataset = useMemo(() => {
		let scoreSet = sessionData.scores;
		if (mode === "highlight") {
			scoreSet = highlightedScores;
		} else if (mode === "best") {
			scoreSet.sort((a, b) =>
				NumericSOV<ScoreDocument>(
					d => d.calculatedData[gptConfig.defaultScoreRatingAlg] ?? 0
				)(b, a)
			);
		} else if (mode === "recent") {
			// sneaky hack to sort in reverse
			scoreSet.sort((a, b) => NumericSOV<ScoreDocument>(d => d.timeAchieved ?? 0)(b, a));
		}

		const scoreDataset: ScoreDataset = [];

		for (const score of scoreSet) {
			const chart = chartMap.get(score.chartID)!;

			scoreDataset.push({
				...score,
				__related: {
					chart,
					song: songMap.get(chart.songID)!,
					index: 0,
					user: reqUser,
				},
			});
		}

		return scoreDataset;
	}, [mode]);

	return (
		<div className="row">
			<div className="col-12 d-flex justify-content-center">
				<div className="btn-group">
					<SelectButton id="highlight" value={mode} setValue={setMode}>
						<Icon type="star" />
						Highlights
					</SelectButton>
					<SelectButton id="best" value={mode} setValue={setMode}>
						<Icon type="sort-amount-up" />
						Best
					</SelectButton>
					<SelectButton id="recent" value={mode} setValue={setMode}>
						<Icon type="history" />
						Recent
					</SelectButton>
				</div>
			</div>
			<div className="col-12 mt-4">
				<ScoreTable
					dataset={dataset as any}
					pageLen={5}
					game={game}
					playtype={playtype as any}
				/>
			</div>
		</div>
	);
}

function RankingInfo({ reqUser, game, playtype }: { reqUser: PublicUserDocument } & GamePT) {
	return (
		<AsyncLoader
			promiseFn={async () => {
				const res = await APIFetchV1<UGPTHistory>(
					`/users/${reqUser.id}/games/${game}/${playtype}/history`
				);

				if (!res.success) {
					throw new Error(res.description);
				}

				return res.body;
			}}
		>
			{data => <UserHistory {...{ data, game, playtype, reqUser }} />}
		</AsyncLoader>
	);
}

function UserHistory({
	data,
	reqUser,
	game,
	playtype,
}: { data: UGPTHistory; reqUser: PublicUserDocument } & GamePT) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const [mode, setMode] = useState<"ranking" | "playcount" | "rating">("ranking");
	const [rating, setRating] = useState<keyof UserGameStats["ratings"]>(
		gptConfig.defaultProfileRatingAlg
	);

	const propName = useMemo(() => {
		if (mode === "rating" && rating) {
			return UppercaseFirst(rating);
		}

		return UppercaseFirst(mode);
	}, [mode, rating]);

	const currentPropValue = useMemo(() => {
		if (mode === "rating" && rating) {
			return data[0].ratings[rating] ? data[0].ratings[rating]!.toFixed(2) : "N/A";
		} else if (mode === "ranking") {
			return `#${data[0].ranking}`;
		}

		return data[0].playcount;
	}, [mode, rating]);

	return (
		<Card className="mt-4" header={`${reqUser.username}'s History`}>
			<div className="row d-flex justify-content-center align-items-center mb-4">
				{/* <div className="d-none d-md-block col-md-3 text-center">
					<div className="mb-4">Something</div>
					<div>
						<span className="display-4">Todo</span>
					</div>
				</div> */}
				<div className="col-12 col-md-6 offset-md-3 d-flex justify-content-center">
					<div className="btn-group">
						<SelectButton id="ranking" value={mode} setValue={setMode}>
							<Icon type="trophy" />
							Ranking
						</SelectButton>
						<SelectButton id="playcount" value={mode} setValue={setMode}>
							<Icon type="gamepad" />
							Playcount
						</SelectButton>
						<SelectButton id="rating" value={mode} setValue={setMode}>
							<Icon type="chart-line" />
							Ratings
						</SelectButton>
					</div>
				</div>
				<div className="col-12 d-block d-md-none mb-4"></div>
				<div className="col-12 col-md-3 text-center">
					<div className="mb-4">Current {propName}</div>
					<div>
						<span className="display-4">{currentPropValue}</span>
					</div>
				</div>
			</div>
			<Divider className="mt-6 mb-2" />
			{mode === "ranking" ? (
				<RankingTimeline data={data} />
			) : mode === "playcount" ? (
				<TimelineChart
					height="30rem"
					mobileHeight="20rem"
					data={[
						{
							id: "playcount",
							data: data.map(d => ({ x: d.timestamp, y: d.playcount })),
						},
					]}
					axisBottom={{
						format: x => DateTime.fromJSDate(x).toLocaleString(DateTime.DATE_FULL),
						tickValues: 3,
					}}
					axisLeft={{
						tickSize: 5,
						tickPadding: 5,
						tickRotation: 0,
						format: y => (Number.isInteger(y) ? y : ""),
					}}
					tooltipRenderFn={p => (
						<div>
							{p.data.yFormatted} Play{p.data.yFormatted !== "1" && "s"}
							<br />
							<small className="text-muted">
								{MillisToSince(+p.data.xFormatted)}
							</small>
						</div>
					)}
					curve={"stepBefore"}
					enableArea={true}
					areaBaselineValue={Math.min(...data.map(e => e.playcount))}
				/>
			) : (
				<>
					<div className="col-12 offset-md-4 col-md-4 mt-4">
						<select
							className="form-control"
							value={rating}
							onChange={e =>
								setRating(e.target.value as keyof UserGameStats["ratings"])
							}
						>
							{gptConfig.profileRatingAlgs.map(e => (
								<option key={e} value={e}>
									{UppercaseFirst(e)}
								</option>
							))}
						</select>
					</div>

					<RatingTimeline {...{ data, rating }} />
				</>
			)}
		</Card>
	);
}

function RatingTimeline({
	data,
	rating,
}: {
	data: UGPTHistory;
	rating: keyof UserGameStats["ratings"];
}) {
	const ratingDataset = [
		{ id: rating, data: data.map(e => ({ x: e.timestamp, y: e.ratings[rating] })) },
	];

	return (
		<TimelineChart
			height="30rem"
			mobileHeight="20rem"
			data={ratingDataset}
			axisBottom={{
				format: x => DateTime.fromJSDate(x).toLocaleString(DateTime.DATE_FULL),
				tickValues: 3, // temp
			}}
			axisLeft={{
				tickSize: 5,
				tickPadding: 5,
				tickRotation: 0,
				format: y => (y ? y.toFixed(2) : "N/A"),
			}}
			tooltipRenderFn={p => (
				<div>
					{p.data.y ? (p.data.y as number).toFixed(2) : "N/A"} {UppercaseFirst(rating)}
					<br />
					<small className="text-muted">{MillisToSince(+p.data.xFormatted)}</small>
				</div>
			)}
		/>
	);
}

function RankingTimeline({ data }: { data: UGPTHistory }) {
	return (
		<TimelineChart
			height="30rem"
			mobileHeight="20rem"
			data={[
				{
					id: "ranking",
					data: data.map(d => ({ x: d.timestamp, y: d.ranking })),
				},
			]}
			axisBottom={{
				format: x => DateTime.fromJSDate(x).toLocaleString(DateTime.DATE_FULL),
				tickValues: 3, // temp
			}}
			axisLeft={{
				tickSize: 5,
				tickPadding: 5,
				tickRotation: 0,
				format: y => (Number.isInteger(y) ? `#${y}` : ""),
			}}
			reverse={true}
			tooltipRenderFn={p => (
				<div>
					{MillisToSince(+p.data.xFormatted)}: #{p.data.yFormatted}
					<br />
					<small className="text-muted">({FormatDate(+p.data.xFormatted)})</small>
				</div>
			)}
		/>
	);
}
