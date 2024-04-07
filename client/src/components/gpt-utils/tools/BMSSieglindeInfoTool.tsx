import { CreateSongMap } from "util/data";
import { NumericSOV, StrSOV } from "util/sorts";
import BMSOrPMSDifficultyCell from "components/tables/cells/BMSOrPMSDifficultyCell";
import TitleCell from "components/tables/cells/TitleCell";
import TachiTable from "components/tables/components/TachiTable";
import ChartHeader from "components/tables/headers/ChartHeader";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import { TachiConfig } from "lib/config";
import React from "react";
import { Col, Row } from "react-bootstrap";
import { BMS_TABLES, ChartDocument, SongDocument } from "tachi-common";
import { UGPT } from "types/react";
import { GPTUtility } from "types/ugpt";
import { FormatSieglindeBMS } from "tachi-common/config/game-support/bms";

type DatasetElement = ChartDocument<"bms:7K" | "bms:14K"> & { __related: { song: SongDocument } };

function Component({ game, playtype, reqUser }: UGPT) {
	const { data, error } = useApiQuery<{
		songs: Array<SongDocument<"bms">>;
		charts: Array<ChartDocument<"bms:7K" | "bms:14K">>;
	}>(`/games/${game}/${playtype}/sieglinde-charts`);

	if (error) {
		return <ApiError error={error} />;
	}

	if (!data) {
		return <Loading />;
	}

	const dataset: Array<DatasetElement> = [];

	const songMap = CreateSongMap(data.songs);

	for (const chart of data.charts) {
		const song = songMap.get(chart.songID);

		if (!song) {
			console.warn(`Couldn't find a parent song for ${chart.songID}? Skipping.`);
			continue;
		}

		dataset.push({
			...chart,
			__related: {
				song,
			},
		});
	}

	return (
		<Row>
			<Col xs={12}>
				<span style={{ fontSize: "1.5rem" }}>
					Sieglinde is a rating algorithm based on LR2IR clear rates. It exists to provide
					unified EASY CLEAR and HARD CLEAR ratings for commonly played tables. <br />
					It's not perfect, and you might disagree with some (or a lot) of the ratings. By
					doing so, you're disagreeing with LR2IR clear rates, so make of that what you
					will.
					<br />
					<br />
					Use filters like <code>insane:yes</code> to limit results to only the insane
					table.
				</span>
				<Divider />
				<TachiTable
					dataset={dataset}
					entryName="Charts"
					headers={[
						ChartHeader("bms", (k) => k as ChartDocument),
						["Song", "Song", StrSOV((x) => x.__related.song.title)],
						[
							"EASY CLEAR Sieglinde",
							"EC sgl.",
							NumericSOV((x) => x.data.sglEC ?? -Infinity),
						],
						[
							"HARD CLEAR Sieglinde",
							"EC sgl.",
							NumericSOV((x) => x.data.sglHC ?? -Infinity),
						],
					]}
					rowFunction={(d) => (
						<tr>
							<BMSOrPMSDifficultyCell chart={d} game="bms" />
							<TitleCell song={d.__related.song} game="bms" chart={d} />
							<td>{FormatSieglindeBMS(d.data.sglEC ?? 0)}</td>
							<td>{FormatSieglindeBMS(d.data.sglHC ?? 0)}</td>
						</tr>
					)}
					defaultSortMode="EASY CLEAR Sieglinde"
					defaultReverseSort
					searchFunctions={Object.fromEntries(
						BMS_TABLES.map((e) => [
							e.asciiPrefix,
							(d: DatasetElement) =>
								!!d.data.tableFolders.find((k) => k.table === e.prefix),
						])
					)}
				/>
			</Col>
		</Row>
	);
}

export const BMSSieglindeInfoTool: GPTUtility = {
	name: `${TachiConfig.NAME} Sieglinde Info`,
	urlPath: "sieglinde",
	description: `View the current state of the sieglinde rating algorithm.`,
	component: Component,
	personalUseOnly: true,
};
