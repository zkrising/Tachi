import React, { useState } from "react";
import {
	ChartDocument,
	Difficulties,
	PBScoreDocument,
	ScoreData,
	ScoreDocument,
	SongDocument,
} from "tachi-common";
import GekichuScoreChart from "components/charts/GekichuScoreChart";
import SelectNav from "components/util/SelectNav";
import { Nav } from "react-bootstrap";
import useApiQuery from "components/util/query/useApiQuery";

type ChartType = "Score" | "Life";

export function ChunithmGraphsComponent({
	score,
	chart,
}: {
	score: ScoreDocument<"chunithm:Single"> | PBScoreDocument<"chunithm:Single">;
	chart: ChartDocument<"chunithm:Single">;
}) {
	const [graph, setGraph] = useState<ChartType>("Score");
	const available = score.scoreData.optional.scoreGraph && score.scoreData.optional.lifeGraph;

	if (!available) {
		return Box("No charts available");
	}

	const { data, error } = useApiQuery<{
		song: SongDocument<"chunithm">;
	}>(`/games/chunithm/Single/songs/${score.songID}`);

	if (error !== null || data === undefined) {
		return Box("Error retrieving chart");
	}

	if (data.song.data.duration === null) {
		return Box("No charts available");
	}

	return (
		<>
			<div className="col-12 d-flex justify-content-center">
				<Nav variant="pills">
					<SelectNav id="Score" value={graph} setValue={setGraph} disabled={!available}>
						Score
					</SelectNav>
					<SelectNav id="Life" value={graph} setValue={setGraph} disabled={!available}>
						Life
					</SelectNav>
				</Nav>
			</div>
			<div className="col-12">
				<GraphComponent
					type={graph}
					song={data.song}
					scoreData={score.scoreData}
					difficulty={chart.difficulty}
				/>
			</div>
		</>
	);
}

function GraphComponent({
	scoreData,
	song,
	difficulty,
	type,
}: {
	scoreData: ScoreData<"chunithm:Single">;
	song: SongDocument<"chunithm">;
	difficulty: Difficulties["chunithm:Single"];
	type: ChartType;
}) {
	const values =
		type === "Score" ? scoreData.optional.scoreGraph! : scoreData.optional.lifeGraph!;
	return (
		<GekichuScoreChart
			height="360px"
			mobileHeight="175px"
			type={type}
			difficulty={difficulty}
			data={[
				{
					id: type,
					data: values.map((e, i) => ({ x: i, y: e })),
				},
			]}
			game="chunithm"
			duration={song.data.duration!}
		/>
	);
}

function Box(message: string) {
	return (
		<div className="col-12">
			<div
				className="d-flex align-items-center justify-content-center"
				style={{ height: "200px" }}
			>
				<span className="text-body-secondary">{message}</span>
			</div>
		</div>
	);
}
