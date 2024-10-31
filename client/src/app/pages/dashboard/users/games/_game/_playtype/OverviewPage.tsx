import { FormatGPTProfileRating, UppercaseFirst } from "util/misc";
import { FormatDate, MillisToSince } from "util/time";
import TimelineChart from "components/charts/TimelineChart";
import useSetSubheader from "components/layout/header/useSetSubheader";
import Card from "components/layout/page/Card";
import Activity from "components/activity/Activity";
import UGPTStatShowcase from "components/user/UGPTStatShowcase";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import Loading from "components/util/Loading";
import Muted from "components/util/Muted";
import useApiQuery from "components/util/query/useApiQuery";
import Select from "components/util/Select";
import SelectButton from "components/util/SelectButton";
import { useProfileRatingAlg } from "components/util/useScoreRatingAlg";
import { DateTime } from "luxon";
import React, { useMemo, useState } from "react";
import {
	FormatGame,
	Game,
	GetGameConfig,
	GetGamePTConfig,
	Playtype,
	UserGameStats,
} from "tachi-common";
import { UGPTHistory } from "types/api-returns";
import { GamePT, SetState, UGPT } from "types/react";
import FormSelect from "react-bootstrap/FormSelect";
import ChartTooltip from "components/charts/ChartTooltip";

export default function OverviewPage({ reqUser, game, playtype }: UGPT) {
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
			<RecentActivity reqUser={reqUser} game={game} playtype={playtype} />
		</React.Fragment>
	);
}

function RecentActivity({ reqUser, game, playtype }: UGPT) {
	return (
		<div className="mt-4">
			<Activity
				url={`/users/${reqUser.id}/games/${game}/${playtype}/activity`}
				handleNoActivity={null}
			/>
		</div>
	);
}

type RankingDurations = "3mo" | "year";

function RankingInfo({ reqUser, game, playtype }: UGPT) {
	const [duration, setDuration] = useState<RankingDurations>("3mo");

	const { data, error } = useApiQuery<UGPTHistory>(
		`/users/${reqUser.id}/games/${game}/${playtype}/history?duration=${duration}`
	);

	return (
		<Card className="mt-4" header={`${reqUser.username}'s History`}>
			{error ? (
				<ApiError error={error} />
			) : data ? (
				<UserHistory
					duration={duration}
					setDuration={setDuration}
					data={data}
					game={game}
					playtype={playtype}
				/>
			) : (
				<Loading />
			)}
		</Card>
	);
}

function UserHistory({
	data,
	game,
	playtype,
	duration,
	setDuration,
}: {
	data: UGPTHistory;
	duration: RankingDurations;
	setDuration: SetState<RankingDurations>;
} & GamePT) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const [mode, setMode] = useState<"ranking" | "playcount" | "rating">("rating");

	const preferredRating = useProfileRatingAlg(game, playtype);

	const [rating, setRating] = useState<keyof UserGameStats["ratings"]>(preferredRating);

	const propName = useMemo(() => {
		if (mode === "rating" && rating) {
			return UppercaseFirst(rating);
		} else if (mode === "ranking") {
			return `${UppercaseFirst(rating)} Ranking`;
		}

		return UppercaseFirst(mode);
	}, [mode, rating]);

	const currentPropValue = useMemo(() => {
		if (mode === "rating" && rating) {
			const ratingValue = data[0].ratings[rating];

			if (!ratingValue) {
				return "N/A";
			}

			return FormatGPTProfileRating(game, playtype, rating, ratingValue);
		} else if (mode === "ranking") {
			return (
				<>
					#{data[0].rankings[rating]?.ranking ?? "ERR!"}
					<Muted>/{data[0].rankings[rating]?.outOf ?? "ERR!"}</Muted>
				</>
			);
		}

		return data[0].playcount;
	}, [mode, rating]);

	return (
		<>
			<div className="row d-flex justify-content-center mb-4">
				<div className="col-12 col-md-3 align-self-center text-center">
					<Select className="mb-4 mb-md-0" setValue={setDuration} value={duration}>
						<option value="week">Past Week</option>
						<option value="month">Past Month</option>
						<option value="3mo">Past 3 Months</option>
						<option value="year">Past Year</option>
					</Select>
				</div>
				<div className="col-12 col-md-6 align-self-center">
					<div className="btn-group d-flex justify-content-center w-100">
						<SelectButton id="ranking" value={mode} setValue={setMode}>
							<Icon type="trophy" /> Ranking
						</SelectButton>
						<SelectButton id="playcount" value={mode} setValue={setMode}>
							<Icon type="gamepad" /> Playcount
						</SelectButton>
						<SelectButton id="rating" value={mode} setValue={setMode}>
							<Icon type="chart-line" /> Ratings
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
				<>
					{Object.keys(gptConfig.profileRatingAlgs).length > 1 && (
						<div className="col-12 offset-md-4 col-md-4 mt-4">
							<FormSelect
								value={rating}
								onChange={(e) =>
									setRating(e.target.value as keyof UserGameStats["ratings"])
								}
							>
								{Object.keys(gptConfig.profileRatingAlgs).map((e) => (
									<option key={e} value={e}>
										{UppercaseFirst(e)}
									</option>
								))}
							</FormSelect>
						</div>
					)}
					<RankingTimeline data={data} rating={rating} />
				</>
			) : mode === "playcount" ? (
				<TimelineChart
					height="30rem"
					mobileHeight="20rem"
					data={[
						{
							id: "playcount",
							data: data.map((d) => ({ x: d.timestamp, y: d.playcount })),
						},
					]}
					axisBottom={{
						format: (x) => DateTime.fromJSDate(x).toLocaleString(DateTime.DATE_FULL),
						tickValues: 3,
					}}
					axisLeft={{
						tickSize: 5,
						tickPadding: 5,
						tickRotation: 0,
						format: (y) => (Number.isInteger(y) ? y : ""),
					}}
					tooltip={(p) => (
						<ChartTooltip>
							{p.point.data.yFormatted} Play{p.point.data.yFormatted !== "1" && "s"}
							<br />
							<small className="text-body-secondary">
								{MillisToSince(+p.point.data.xFormatted)}
							</small>
						</ChartTooltip>
					)}
					curve="linear"
					enableArea={true}
					areaBaselineValue={Math.min(...data.map((e) => e.playcount))}
				/>
			) : (
				<>
					{Object.keys(gptConfig.profileRatingAlgs).length > 1 && (
						<div className="col-12 offset-md-4 col-md-4 mt-4">
							<FormSelect
								value={rating}
								onChange={(e) =>
									setRating(e.target.value as keyof UserGameStats["ratings"])
								}
							>
								{Object.keys(gptConfig.profileRatingAlgs).map((e) => (
									<option key={e} value={e}>
										{UppercaseFirst(e)}
									</option>
								))}
							</FormSelect>
						</div>
					)}

					<RatingTimeline {...{ game, playtype, data, rating }} />
				</>
			)}
		</>
	);
}

function RatingTimeline({
	game,
	playtype,
	data,
	rating,
}: {
	game: Game;
	playtype: Playtype;
	data: UGPTHistory;
	rating: keyof UserGameStats["ratings"];
}) {
	const ratingDataset = [
		{ id: rating, data: data.map((e) => ({ x: e.timestamp, y: e.ratings[rating] })) },
	];

	return (
		<TimelineChart
			height="30rem"
			mobileHeight="20rem"
			data={ratingDataset}
			axisBottom={{
				format: (x) => DateTime.fromJSDate(x).toLocaleString(DateTime.DATE_FULL),
				tickValues: 3, // temp
			}}
			axisLeft={{
				tickSize: 5,
				tickPadding: 5,
				tickRotation: 0,
				format: (y) => (y ? FormatGPTProfileRating(game, playtype, rating, y) : "N/A"),
			}}
			tooltip={(p) => (
				<ChartTooltip>
					<div>
						{p.point.data.y
							? FormatGPTProfileRating(
									game,
									playtype,
									rating,
									p.point.data.y as number
							  )
							: "N/A"}{" "}
						{UppercaseFirst(rating)}
					</div>
					<small className="text-body-secondary">
						{MillisToSince(+p.point.data.xFormatted)}
					</small>
				</ChartTooltip>
			)}
		/>
	);
}

function RankingTimeline({
	data,
	rating,
}: {
	data: UGPTHistory;
	rating: keyof UserGameStats["ratings"];
}) {
	return (
		<TimelineChart
			height="30rem"
			mobileHeight="20rem"
			data={[
				{
					id: "ranking",
					data: data.map((d) => ({ x: d.timestamp, y: d.rankings[rating].ranking })),
				},
			]}
			axisBottom={{
				format: (x) => DateTime.fromJSDate(x).toLocaleString(DateTime.DATE_FULL),
				tickValues: 3, // temp
			}}
			axisLeft={{
				tickSize: 5,
				tickPadding: 5,
				tickRotation: 0,
				format: (y) => (Number.isInteger(y) ? `#${y}` : ""),
			}}
			reverse={true}
			tooltip={(p) => (
				<ChartTooltip>
					<div>
						{MillisToSince(+p.point.data.xFormatted)}: #{p.point.data.yFormatted}
					</div>
					<small className="text-body-secondary">
						({FormatDate(+p.point.data.xFormatted)})
					</small>
				</ChartTooltip>
			)}
		/>
	);
}
