import IIDXPBTable from "components/tables/IIDXPBTable";
import Loading from "components/util/Loading";
import { BackgroundContext } from "context/BackgroundContext";
import { SubheaderContext } from "context/SubheaderContext";
import React, { useContext, useEffect, useState } from "react";
import { useQuery } from "react-query";
import {
	PBScoreDocument,
	ChartDocument,
	SongDocument,
	PublicUserDocument,
	Playtypes,
	Game,
	GetGameConfig,
} from "tachi-common";
import { GamePT } from "types/react";
import { PBDataset } from "types/tables";
import { APIFetchV1, ToAPIURL } from "util/api";
import { UpdateSubheader } from "util/subheader";

export default function PBsPage({
	reqUser,
	game,
	playtype,
}: {
	reqUser: PublicUserDocument;
} & GamePT) {
	const [dataset, setDataset] = useState<PBDataset<"iidx:SP">>([]);
	const { setTitle, setBreadcrumbs } = useContext(SubheaderContext);
	const { setBackground } = useContext(BackgroundContext);

	const gameConfig = GetGameConfig(game);

	useEffect(() => {
		UpdateSubheader(
			["Users", reqUser.username, "Games", gameConfig.name, playtype],
			setTitle,
			setBreadcrumbs,
			`${reqUser.username}'s ${gameConfig.name} ${playtype} Profile`
		);

		setBackground(ToAPIURL(`/users/${reqUser.username}/banner`));

		return () => {
			setBackground(null);
		};
	}, [reqUser]);

	const { isLoading, error } = useQuery(`${reqUser.id}_pbs`, async () => {
		const res = await APIFetchV1<{
			scores: PBScoreDocument<"iidx:SP">[];
			charts: ChartDocument<"iidx:SP">[];
			songs: SongDocument<"iidx">[];
		}>(`/users/${reqUser.username}/games/iidx/SP/pbs/best`);

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

		const data = res.body.scores.map((e, i) => ({
			...e,
			__related: {
				song: songMap.get(e.songID),
				chart: chartMap.get(e.chartID),
				index: i,
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
