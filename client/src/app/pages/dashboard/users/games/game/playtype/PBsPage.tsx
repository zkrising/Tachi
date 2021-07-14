import IIDXPBTable from "components/tables/IIDXPBTable";
import Loading from "components/util/Loading";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { PBScoreDocument, ChartDocument, SongDocument } from "tachi-common";
import { PBDataset } from "types/tables";
import { APIFetchV1 } from "util/api";

export default function PBsPage() {
	const [dataset, setDataset] = useState<PBDataset<"iidx:SP">>([]);
	const { userID } = useParams<{ userID: string }>();

	const { isLoading, error } = useQuery("TEMP_PBS", async () => {
		const res = await APIFetchV1<{
			scores: PBScoreDocument<"iidx:SP">[];
			charts: ChartDocument<"iidx:SP">[];
			songs: SongDocument<"iidx">[];
		}>(`/users/${userID}/games/iidx/SP/pbs/best`);

		if (!res.success) {
			throw res;
		}

		const songMap = new Map();
		const chartMap = new Map();

		for (const song of res.body.songs) {
			songMap.set(song.id, song);
		}

		for (const chart of res.body.charts) {
			chartMap.set(chart.chartID, chart);
		}

		const data = res.body.scores.map(e => ({
			...e,
			__related: {
				song: songMap.get(e.songID),
				chart: chartMap.get(e.chartID),
			},
		}));

		setDataset(data);
	});

	if (isLoading || !dataset || !window) {
		return <Loading />;
	}

	if (error) {
		return <>An error has occured.</>;
	}

	return <IIDXPBTable dataset={dataset} />;
}
