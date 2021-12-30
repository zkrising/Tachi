import PlaytypeSelect from "app/pages/dashboard/games/_game/PlaytypeSelect";
import GPTChartPage from "app/pages/dashboard/games/_game/_playtype/GPTChartPage";
import GPTDevInfo from "app/pages/dashboard/games/_game/_playtype/GPTDevInfo";
import GPTLeaderboardsPage from "app/pages/dashboard/games/_game/_playtype/GPTLeaderboardsPage";
import GPTMainPage from "app/pages/dashboard/games/_game/_playtype/GPTMainPage";
import GPTSongsPage from "app/pages/dashboard/games/_game/_playtype/GPTSongsPage";
import { ErrorPage } from "app/pages/ErrorPage";
import ChartInfoFormat from "components/game/charts/ChartInfoFormat";
import { GPTBottomNav } from "components/game/GPTHeader";
import SongInfoFormat from "components/game/songs/SongInfoFormat";
import Card from "components/layout/page/Card";
import DebugContent from "components/util/DebugContent";
import Divider from "components/util/Divider";
import LinkButton from "components/util/LinkButton";
import Loading from "components/util/Loading";
import Muted from "components/util/Muted";
import useApiQuery from "components/util/query/useApiQuery";
import SelectButton from "components/util/SelectButton";
import { BackgroundContext } from "context/BackgroundContext";
import { UGPTSettingsContext, UGPTSettingsContextProvider } from "context/UGPTSettingsContext";
import { UserContext } from "context/UserContext";
import { UserSettingsContext } from "context/UserSettingsContext";
import React, { useContext, useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { Redirect, Route, Switch, useParams } from "react-router-dom";
import {
	ChartDocument,
	FormatDifficulty,
	Game,
	GetGameConfig,
	GetGamePTConfig,
	SongDocument,
	UGPTSettings,
} from "tachi-common";
import { SongsReturn } from "types/api-returns";
import { GamePT, SetState } from "types/react";
import { APIFetchV1, ToCDNURL } from "util/api";
import { IsSupportedGame, IsSupportedPlaytype } from "util/asserts";
import { ChangeOpacity } from "util/color-opacity";
import { CreateChartLink } from "util/data";
import { NumericSOV } from "util/sorts";

export default function GameRoutes() {
	const { game } = useParams<{ game: string }>();
	const { setBackground } = useContext(BackgroundContext);

	if (!IsSupportedGame(game)) {
		return <ErrorPage statusCode={404} customMessage={`The game ${game} is not supported.`} />;
	}

	setBackground(ToCDNURL(`/game-banners/${game}`));

	const gameConfig = GetGameConfig(game);

	return (
		<Switch>
			<Route exact path="/dashboard/games/:game">
				{gameConfig.validPlaytypes.length === 1 ? (
					<Redirect to={`/dashboard/games/${game}/${gameConfig.validPlaytypes[0]}`} />
				) : (
					<PlaytypeSelect
						subheaderCrumbs={["Games", gameConfig.name]}
						subheaderTitle={`${gameConfig.name} Playtype Select`}
						base={`/dashboard/games/${game}`}
						game={game}
					/>
				)}
			</Route>

			<Route path="/dashboard/games/:game/:playtype">
				<UGPTSettingsContextProvider>
					<GamePlaytypeRoutes game={game} />
				</UGPTSettingsContextProvider>
			</Route>

			<Route path="*">
				<ErrorPage statusCode={404} />
			</Route>
		</Switch>
	);
}

function GamePlaytypeRoutes({ game }: { game: Game }) {
	const { playtype } = useParams<{ playtype: string }>();

	if (!IsSupportedPlaytype(game, playtype)) {
		return (
			<ErrorPage
				statusCode={400}
				customMessage={`The playtype ${playtype} is not supported.`}
			/>
		);
	}

	const { user } = useContext(UserContext);
	const { setSettings } = useContext(UGPTSettingsContext);

	useEffect(() => {
		(async () => {
			if (user) {
				const settingsRes = await APIFetchV1<UGPTSettings>(
					`/users/${user.id}/games/${game}/${playtype}/settings`
				);

				if (!settingsRes.success) {
					setSettings(null);
					return;
				}

				setSettings(settingsRes.body);
			}
		})();

		return () => {
			setSettings(null);
		};
	}, [user, game, playtype]);

	return (
		<>
			<div className="card">
				<GPTBottomNav baseUrl={`/dashboard/games/${game}/${playtype}`} />
			</div>
			<Divider />
			<Switch>
				<Route exact path="/dashboard/games/:game/:playtype">
					<GPTMainPage game={game} playtype={playtype} />
				</Route>

				<Route exact path="/dashboard/games/:game/:playtype/songs">
					<GPTSongsPage game={game} playtype={playtype} />
				</Route>

				<Route path="/dashboard/games/:game/:playtype/songs/:songID">
					<SongChartRoutes game={game} playtype={playtype} />
				</Route>

				<Route exact path="/dashboard/games/:game/:playtype/leaderboards">
					<GPTLeaderboardsPage game={game} playtype={playtype} />
				</Route>
				<Route exact path="/dashboard/games/:game/:playtype/dev-info">
					<GPTDevInfo game={game} playtype={playtype} />
				</Route>

				<Route path="*">
					<ErrorPage statusCode={404} />
				</Route>
			</Switch>
		</>
	);
}

function SongChartRoutes({ game, playtype }: GamePT) {
	const { songID } = useParams<{ songID: string }>();

	const { data, isLoading, error } = useApiQuery<SongsReturn>(
		`/games/${game}/${playtype}/songs/${songID}`
	);

	const { settings } = useContext(UserSettingsContext);

	const gptConfig = GetGamePTConfig(game, playtype);

	const [activeChart, setActiveChart] = useState<ChartDocument | null>(null);

	useEffect(() => {
		setActiveChart(null);
	}, [game, playtype]);

	if (error) {
		return <ErrorPage statusCode={error.statusCode} customMessage={error.description} />;
	}

	if (!data || isLoading) {
		return <Loading />;
	}

	if (data.charts.every(c => c.playtype !== playtype)) {
		return (
			<Redirect
				to={`/dashboard/games/${game}/${data.charts[0].playtype}/songs/${data.song.id}`}
			/>
		);
	}

	return (
		<>
			<SongInfoHeader
				game={game}
				playtype={playtype}
				{...data}
				activeChart={activeChart}
				setActiveChart={setActiveChart}
			/>
			<Divider />
			<Switch>
				<Route exact path="/dashboard/games/:game/:playtype/songs/:songID">
					{/* Select the hardest chart for this. */}
					<Redirect
						to={`/dashboard/games/${game}/${playtype}/songs/${data.song.id}/${
							data.charts.slice(0).sort(NumericSOV(x => x.levelNum, true))[0]
								.difficulty
						}`}
					/>
				</Route>

				<Route exact path="/dashboard/games/:game/:playtype/songs/:songID/:difficulty">
					<GPTChartPage
						game={game}
						playtype={playtype}
						song={data.song}
						chart={activeChart}
						setActiveChart={setActiveChart}
						allCharts={data.charts}
					/>
				</Route>

				<Route path="*">
					<ErrorPage statusCode={404} />
				</Route>
			</Switch>
			{settings?.preferences.developerMode && (
				<>
					<Divider />
					<Card header="Dev Info">
						<DebugContent data={data} />
					</Card>
				</>
			)}
		</>
	);
}

function SongInfoHeader({
	game,
	playtype,
	song,
	charts,
	activeChart,
	setActiveChart,
}: { activeChart: ChartDocument | null; setActiveChart: SetState<ChartDocument | null> } & GamePT &
	SongsReturn) {
	const gptConfig = GetGamePTConfig(game, playtype);

	// accidentally O(n^2) but this is a short list so who cares
	const sortedCharts = charts
		.slice(0)
		.sort(NumericSOV(x => gptConfig.difficulties.indexOf(x.difficulty)));

	return (
		<Card header="Song Info">
			<Row
				className="align-items-center"
				style={{
					justifyContent: "space-evenly",
				}}
			>
				{"displayVersion" in song.data && (
					<Col xs={12} lg={3} className="text-center">
						<img
							src={ToCDNURL(`/game-icons/${game}/${song.data.displayVersion}`)}
							// onError={() => seetImgShow(false)}
							className="w-100"
						/>
					</Col>
				)}
				<Col xs={12} lg={4} className="text-center">
					<SongInfoFormat {...{ game, song, chart: activeChart }} />
				</Col>
				{game !== "bms" && (
					<Col xs={12} lg={3} className="text-center">
						<h5>Charts</h5>
						<hr />
						<div className="btn-group-vertical d-flex justify-content-center">
							{game === "iidx" ? (
								<IIDXDifficultyList
									{...{
										activeChart,
										charts: sortedCharts,
										game,
										playtype,
										setActiveChart,
										song,
									}}
								/>
							) : (
								<DifficultyList
									{...{
										activeChart,
										charts: sortedCharts,
										game,
										playtype,
										setActiveChart,
										song,
									}}
								/>
							)}
						</div>
					</Col>
				)}
				{activeChart && (
					<Col xs={12}>
						<Divider />
						<ChartInfoFormat playtype={playtype} chart={activeChart} game={game} />
					</Col>
				)}
			</Row>
		</Card>
	);
}

type Props = { song: SongDocument } & {
	activeChart: ChartDocument | null;
	setActiveChart: SetState<ChartDocument | null>;
} & GamePT;

function DifficultyButton({
	chart,
	game,
	playtype,
	setActiveChart,
	activeChart,
}: Props & { chart: ChartDocument }) {
	const gptConfig = GetGamePTConfig(game, playtype);

	return (
		<LinkButton
			onClick={() => setActiveChart(chart)}
			className="btn-secondary"
			key={chart.chartID}
			to={CreateChartLink(chart, game)}
			style={{
				backgroundColor: gptConfig.difficultyColours[chart.difficulty]
					? ChangeOpacity(
							gptConfig.difficultyColours[chart.difficulty]!,
							activeChart?.chartID === chart.chartID ? 0.4 : 0.2
					  )
					: undefined,
			}}
		>
			{activeChart?.chartID === chart.chartID ? (
				<strong>
					{FormatDifficulty(chart, game)}
					{chart.isPrimary ? (
						""
					) : (
						<>
							{" "}
							<Muted>{chart.versions.join("/")}</Muted>
						</>
					)}
				</strong>
			) : (
				<>
					{FormatDifficulty(chart, game)}
					{chart.isPrimary ? (
						""
					) : (
						<>
							{" "}
							<Muted>{chart.versions.join("/")}</Muted>
						</>
					)}
				</>
			)}
		</LinkButton>
	);
}

function DifficultyList({
	charts,
	song,
	activeChart,
	setActiveChart,
	game,
	playtype,
}: {
	charts: ChartDocument[];
} & Props) {
	return (
		<>
			{charts.map(e => (
				<DifficultyButton
					activeChart={activeChart}
					setActiveChart={setActiveChart}
					game={game}
					playtype={playtype}
					song={song}
					chart={e}
					key={e.chartID}
				/>
			))}
		</>
	);
}

/**
 * We need some special handling for IIDX Special Difficulties.
 * Thanks.
 */
function IIDXDifficultyList({
	charts,
	song,
	activeChart,
	setActiveChart,
	game,
	playtype,
}: {
	charts: ChartDocument[];
} & Props) {
	const { settings } = useContext(UGPTSettingsContext);

	const [set, setSet] = useState<null | "All Scratch" | "Kichiku" | "Kiraku">(null);

	if (
		!(activeChart as ChartDocument<"iidx:SP" | "iidx:DP">)?.data["2dxtraSet"] &&
		!settings?.preferences.gameSpecific.display2DXTra
	) {
		return (
			<DifficultyList
				{...{
					charts: charts.filter(
						// @ts-expect-error hack
						(e: ChartDocument<"iidx:SP" | "iidx:DP">) => e.data["2dxtraSet"] === null
					),
					song,
					activeChart,
					setActiveChart,
					game,
					playtype,
				}}
			/>
		);
	}

	return (
		<>
			<div className="btn-group">
				<SelectButton value={set} setValue={setSet} id={null}>
					Normal
				</SelectButton>
				<SelectButton value={set} setValue={setSet} id="All Scratch">
					All Scr.
				</SelectButton>
				<SelectButton value={set} setValue={setSet} id="Kichiku">
					Kichiku
				</SelectButton>
				<SelectButton value={set} setValue={setSet} id="Kiraku">
					Kiraku
				</SelectButton>
			</div>
			<DifficultyList
				{...{
					charts: charts.filter(
						// @ts-expect-error hack
						(e: ChartDocument<"iidx:SP" | "iidx:DP">) =>
							set ? e.difficulty.startsWith(set) : e.data["2dxtraSet"] === null
					),
					song,
					activeChart,
					setActiveChart,
					game,
					playtype,
				}}
			/>
		</>
	);
}
