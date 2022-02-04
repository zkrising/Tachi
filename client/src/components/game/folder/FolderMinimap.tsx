import QuickTooltip from "components/layout/misc/QuickTooltip";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import React, { useEffect, useMemo, useState } from "react";
import { Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
	ChartDocument,
	FormatChart,
	Game,
	GamePTConfig,
	GetGamePTConfig,
	IIDX_LAMPS,
	PublicUserDocument,
	SessionDocument,
} from "tachi-common";
import { GamePT } from "types/react";
import { FolderDataset } from "types/tables";
import { ChangeOpacity } from "util/color-opacity";
import { CreateChartLink } from "util/data";
import { NumericSOV } from "util/sorts";

type Props = {
	folderDataset: FolderDataset;
	reqUser: PublicUserDocument;
	view: "grade" | "lamp";
} & GamePT;

export default function FolderMinimap(props: Props) {
	const { data, isLoading, error } = useApiQuery<SessionDocument>(
		`/users/${props.reqUser.id}/games/${props.game}/${props.playtype}/sessions/last`
	);

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
				Sadly, Switchboard view doesn't work very well on mobile at the moment.
			</div>
		</>
	);
}

function FolderMinimapMain({
	game,
	playtype,
	folderDataset,
	view,
	recentSession,
}: Props & { recentSession: SessionDocument | null }) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const [sortAlg, setSortAlg] = useState(view === "grade" ? "score" : "lamp");

	useEffect(() => {
		if (view === "grade") {
			setSortAlg("score");
		} else {
			setSortAlg("lamp");
		}
	}, [view]);

	const getterFn = useMemo<(f: FolderDataset[0]) => number | undefined>(() => {
		if (sortAlg === "score") {
			return c => c.__related.pb?.scoreData.percent;
		} else if (sortAlg === "lamp") {
			return c => c.__related.pb?.scoreData.lampIndex;
		} else if (sortAlg.startsWith("tierlist:")) {
			const v = sortAlg.split("tierlist:")[1];

			return c => c.tierlistInfo[v as keyof ChartDocument["tierlistInfo"]]?.value;
		}

		return () => 0;
	}, [sortAlg]);

	const sortedDataset = useMemo(
		() => folderDataset.slice(0).sort(NumericSOV(a => getterFn(a) ?? -Infinity, true)),
		[getterFn, folderDataset, sortAlg]
	);

	const recentlyTouched = useMemo(() => {
		if (!recentSession) {
			return [];
		}

		return recentSession.scoreInfo
			.filter(e => e.isNewScore || e.gradeDelta > 0 || e.lampDelta > 0)
			.map(e => e.scoreID);
	}, [recentSession]);

	return (
		<div className="row">
			<div className="col-12 col-lg-10 offset-lg-1">
				<div className="scoreinfo-grid-minimap">
					{sortedDataset.map(d => (
						<MinimapElement
							key={d.chartID}
							data={d}
							gptConfig={gptConfig}
							view={view}
							game={game}
							wasRecent={
								(d.__related.pb &&
									recentlyTouched.some(
										scoreID =>
											d.__related.pb!.composedFrom.scorePB === scoreID ||
											d.__related.pb!.composedFrom.lampPB === scoreID
									)) ??
								false
							}
						/>
					))}
				</div>
				<Divider />
				<Form.Group>
					<Form.Label>Sorting charts on:</Form.Label>
					<Form.Control
						as="select"
						value={sortAlg}
						onChange={e => setSortAlg(e.target.value)}
					>
						{view === "grade" && <option value="score">Your Score</option>}
						{view === "lamp" && <option value="lamp">Your Lamp</option>}
						{gptConfig.tierlists.map(e => (
							<option key={`tierlist:${e}`} value={`tierlist:${e}`}>
								Tierlist: {e}
							</option>
						))}
					</Form.Control>
				</Form.Group>
			</div>
		</div>
	);
}

function MinimapElement({
	data,
	gptConfig,
	view,
	game,
	wasRecent,
}: {
	data: FolderDataset[0];
	view: "grade" | "lamp";
	gptConfig: GamePTConfig;
	game: Game;
	wasRecent: boolean;
}) {
	let icon = "level-up-alt";

	// if this user recently cleared mare nectaris
	// tell them to fuck off
	if (
		data.chartID === "924bf011fdd8334b609b02e382123f9f5440d16d" &&
		data.__related.pb &&
		data.__related.pb?.scoreData.lampIndex >= IIDX_LAMPS.EASY_CLEAR
	) {
		icon = "hand-middle-finger";
	}

	const colour = useMemo(() => {
		if (!data.__related.pb) {
			return null;
		}

		// @ts-expect-error unhinged dynamic access (i dont care)
		return gptConfig[`${view}Colours`][data.__related.pb.scoreData[view]];
	}, [data.__related.pb, gptConfig, view]);

	return (
		<QuickTooltip
			tooltipContent={
				<div>
					<span>{FormatChart(game, data.__related.song, data)}</span>
					<Divider />
					{wasRecent && (
						<>
							<b>You raised this recently!</b>
							<br />
						</>
					)}
					<span>{data.__related.pb?.scoreData.lamp ?? "Not Played"}</span>
					{data.__related.pb && (
						<>
							<br />
							{data.__related.pb.scoreData.grade}
							<br />
							<span>
								{data.__related.pb.scoreData.score} (
								{data.__related.pb.scoreData.percent.toFixed(2)}%)
							</span>
						</>
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
