import { ChangeOpacity } from "util/color-opacity";
import { ONE_WEEK } from "util/constants/time";
import { CreateChartLink } from "util/data";
import { NumericSOV } from "util/sorts";
import QuickTooltip from "components/layout/misc/QuickTooltip";
import ScoreCoreCells from "components/tables/game-core-cells/ScoreCoreCells";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import { GPT_CLIENT_IMPLEMENTATIONS } from "lib/game-implementations";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
	FormatChart,
	Game,
	GamePTConfig,
	GetGPTString,
	GetGamePTConfig,
	GetScoreMetricConf,
	IIDX_LAMPS,
	SessionDocument,
	SessionScoreInfo,
	UserDocument,
} from "tachi-common";
import { GamePT } from "types/react";
import { FolderDataset } from "types/tables";

type Props = {
	folderDataset: FolderDataset;
	reqUser: UserDocument;
	enumMetric: string;
} & GamePT;

export default function FolderMinimap(props: Props) {
	const { data, isLoading, error } = useApiQuery<{
		session: SessionDocument;
		scoreInfo: Array<SessionScoreInfo>;
	}>(`/users/${props.reqUser.id}/games/${props.game}/${props.playtype}/sessions/last`);

	const session = useMemo(() => {
		if (error && error.statusCode === 404) {
			return null;
		} else if (data) {
			return data;
		}

		return null;
	}, [data, error]);

	if (error && error.statusCode !== 404) {
		return <ApiError error={error} />;
	}

	if (isLoading) {
		return <Loading />;
	}

	return (
		<>
			<div className="d-none d-lg-block">
				<FolderMinimapMain {...props} recentSession={session} />
			</div>
			<div className="d-block d-lg-none">
				Sadly, Switchboard view doesn't work on mobile at the moment.
			</div>
		</>
	);
}

function FolderMinimapMain({
	game,
	playtype,
	folderDataset,
	enumMetric,
	recentSession,
}: Props & {
	recentSession: { session: SessionDocument; scoreInfo: Array<SessionScoreInfo> } | null;
}) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const getterFn = useMemo<(f: FolderDataset[0]) => number | undefined>(() => {
		const conf = GetScoreMetricConf(gptConfig, enumMetric);

		if (!conf) {
			return () => 0; // wut
		}

		if (conf.type === "ENUM") {
			// @ts-expect-error insane dynamic access
			return (c) => c.__related.pb?.scoreData.enumIndexes[enumMetric];
		}

		// @ts-expect-error insane dynamic access
		return (c) => c.__related.pb?.scoreData[enumMetric];
	}, [enumMetric]);

	const sortedDataset = useMemo(
		() => folderDataset.slice(0).sort(NumericSOV((a) => getterFn(a) ?? -Infinity, true)),
		[getterFn, folderDataset, enumMetric]
	);

	// For the switchboard chart, display a raise icon on stuff the user has recently played.
	const recentlyTouched = useMemo(() => {
		if (!recentSession || Date.now() - recentSession.session.timeEnded > ONE_WEEK) {
			return [];
		}

		return recentSession.scoreInfo
			.filter((e) => {
				if (e.isNewScore) {
					return true;
				}

				for (const v of Object.values(e.deltas)) {
					if (v >= 0) {
						return true;
					}
				}

				return false;
			})
			.map((e) => e.scoreID);
	}, [recentSession]);

	return (
		<div className="row">
			<div className="col-12 col-lg-10 offset-lg-1">
				<div className="scoreinfo-grid-minimap">
					{sortedDataset.map((d) => (
						<MinimapElement
							key={d.chartID}
							data={d}
							gptConfig={gptConfig}
							enumMetric={enumMetric}
							game={game}
							wasRecent={
								(d.__related.pb &&
									recentlyTouched.some((scoreID) =>
										d.__related.pb!.composedFrom.find(
											(e) => e.scoreID === scoreID
										)
									)) ??
								false
							}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

function MinimapElement({
	data,
	gptConfig,
	enumMetric,
	game,
	wasRecent,
}: {
	data: FolderDataset[0];
	enumMetric: string;
	gptConfig: GamePTConfig;
	game: Game;
	wasRecent: boolean;
}) {
	const gptImpl = GPT_CLIENT_IMPLEMENTATIONS[GetGPTString(game, data.playtype)];

	let icon = "level-up-alt";

	// if this user recently cleared mare nectaris
	// give them a pleasant treat
	if (
		data.chartID === "924bf011fdd8334b609b02e382123f9f5440d16d" &&
		data.__related.pb &&
		// @ts-expect-error the above chartID guarantees mare nectaris
		data.__related.pb?.scoreData.enumIndexes.lamp >= IIDX_LAMPS.EASY_CLEAR
	) {
		icon = "hand-middle-finger";
	}

	const colour = useMemo(() => {
		if (!data.__related.pb) {
			return null;
		}

		// @ts-expect-error unhinged dynamic access (i dont care)
		return gptImpl.enumColours[enumMetric][data.__related.pb.scoreData[enumMetric]];
	}, [data.__related.pb, gptConfig, enumMetric]);

	return (
		<QuickTooltip
			tooltipContent={
				<div>
					<span>{FormatChart(game, data.__related.song, data)}</span>
					<Divider />
					{wasRecent && (
						<>
							<b>You raised this in your last session!</b>
							<br />
						</>
					)}
					{data.__related.pb ? (
						<ScoreCoreCells chart={data} game={game} score={data.__related.pb} />
					) : (
						<span>Not Played</span>
					)}
				</div>
			}
		>
			<Link to={CreateChartLink(data, game)}>
				<div
					className={`scoreinfo-grid-minimap-element ${
						wasRecent ? "scoreinfo-grid-minimap-element-recent" : ""
					}`}
					style={{
						backgroundColor: colour ? ChangeOpacity(colour, 0.4) : undefined,
					}}
				>
					{wasRecent && (
						<span className={`fas fa-${icon}`} style={{ lineHeight: "19.5px" }}></span>
					)}
				</div>
			</Link>
		</QuickTooltip>
	);
}
