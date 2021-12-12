import QuickTooltip from "components/layout/misc/QuickTooltip";
import Divider from "components/util/Divider";
import React, { useEffect, useMemo, useState } from "react";
import { Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { ChartDocument, FormatChart, Game, GamePTConfig, GetGamePTConfig } from "tachi-common";
import { GamePT } from "types/react";
import { FolderDataset } from "types/tables";
import { ChangeOpacity } from "util/color-opacity";
import { CreateChartLink } from "util/data";
import { NumericSOV } from "util/sorts";

type Props = {
	folderDataset: FolderDataset;
	view: "grade" | "lamp";
} & GamePT;

export default function FolderMinimap(props: Props) {
	return (
		<>
			<div className="d-none d-lg-block">
				<FolderMinimapMain {...props} />
			</div>
			<div className="d-block d-lg-none">
				Sadly, Switchboard view doesn't work very well on mobile at the moment.
			</div>
		</>
	);
}

function FolderMinimapMain({ game, playtype, folderDataset, view }: Props) {
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
}: {
	data: FolderDataset[0];
	view: "grade" | "lamp";
	gptConfig: GamePTConfig;
	game: Game;
}) {
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
					className="scoreinfo-grid-minimap-element"
					style={{
						backgroundColor: colour ? ChangeOpacity(colour, 0.3) : undefined,
					}}
				/>
			</Link>
		</QuickTooltip>
	);
}
