import { DEFAULT_BAR_PROPS } from "util/charts";
import { CreateChartMap, CreateUserMap } from "util/data";
import { FormatGPTScoreRatingName } from "util/misc";
import { NumericSOV } from "util/sorts";
import { ResponsiveBar } from "@nivo/bar";
import PBTable from "components/tables/pbs/PBTable";
import ApiError from "components/util/ApiError";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import useScoreRatingAlg from "components/util/useScoreRatingAlg";
import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import { COLOUR_SET, CreateSongMap, GetGamePTConfig, integer } from "tachi-common";
import { ScoreLeaderboardReturns } from "types/api-returns";
import { GamePT } from "types/react";
import { PBDataset } from "types/tables";
import Divider from "components/util/Divider";

const USER_COLOURS = [
	COLOUR_SET.blue,
	COLOUR_SET.red,
	COLOUR_SET.green,
	COLOUR_SET.pink,
	COLOUR_SET.purple,
	COLOUR_SET.orange,
];

export default function ScoreLeaderboard({
	game,
	playtype,
	url,
	refreshDeps = [],
}: GamePT & { url: string; refreshDeps?: Array<string> }) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const defaultAlg = useScoreRatingAlg(game, playtype);

	const [alg, setAlg] = useState(defaultAlg);

	const SelectComponent =
		Object.keys(gptConfig.scoreRatingAlgs).length > 1 ? (
			<Form.Select value={alg} onChange={(e) => setAlg(e.target.value as any)}>
				{Object.keys(gptConfig.scoreRatingAlgs).map((e) => (
					<option key={e} value={e}>
						{FormatGPTScoreRatingName(game, playtype, e)}
					</option>
				))}
			</Form.Select>
		) : null;

	const { data, error } = useApiQuery<ScoreLeaderboardReturns>(
		`${url}?alg=${alg}`,
		{},
		refreshDeps
	);

	if (error) {
		return (
			<>
				{SelectComponent}
				<ApiError error={error} />
			</>
		);
	}

	if (!data) {
		return (
			<>
				{SelectComponent}
				<Loading />
			</>
		);
	}

	const songMap = CreateSongMap(data.songs);
	const chartMap = CreateChartMap(data.charts);
	const userMap = CreateUserMap(data.users);

	const pbDataset: PBDataset = [];

	for (const [index, pb] of data.pbs.entries()) {
		pbDataset.push({
			...pb,
			__related: {
				chart: chartMap.get(pb.chartID)!,
				song: songMap.get(pb.songID)!,
				index,
				user: userMap.get(pb.userID)!,
			},
		});
	}

	return (
		<>
			{SelectComponent}
			<Divider />
			<DistributionChart dataset={pbDataset} />
			<Divider />
			<PBTable
				dataset={pbDataset}
				game={game}
				playtype={playtype}
				showUser
				showChart
				indexCol
				alg={alg}
				defaultRankingViewMode="both-if-self"
			/>
		</>
	);
}

function DistributionChart({ dataset }: { dataset: PBDataset }) {
	// username -> scores in the top N
	const dist: Record<string, integer> = {};

	for (const pb of dataset) {
		const key = pb.__related.user?.username;

		if (key === undefined) {
			// shouldn't be possible, but lets not have the ui crash
			// because of something so menial
			continue;
		}

		if (key in dist) {
			dist[key]++;
		} else {
			dist[key] = 1;
		}
	}

	const aggregatedData = Object.entries(dist)
		.map(([username, count]) => ({ username, count }))
		.sort(NumericSOV((x) => x.count));

	const usernames = [...new Set(aggregatedData.map((e) => e.username))];

	return (
		<div style={{ height: 200, width: "100%" }}>
			<ResponsiveBar
				data={aggregatedData}
				indexBy="username"
				keys={["count"]}
				layout="vertical"
				colors={(x) =>
					USER_COLOURS[(usernames.indexOf(x.data.username) ?? 0) % USER_COLOURS.length]
				}
				margin={{ left: 80, bottom: 40, top: 20, right: 20 }}
				isInteractive={false}
				{...DEFAULT_BAR_PROPS}
			/>
		</div>
	);
}
