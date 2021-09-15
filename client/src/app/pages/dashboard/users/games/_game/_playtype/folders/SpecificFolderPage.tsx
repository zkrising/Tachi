import { ResponsiveBar } from "@nivo/bar";
import { BarChartTooltip } from "components/charts/ChartTooltip";
import Card from "components/layout/page/Card";
import FolderTable from "components/tables/folders/FolderTable";
import ApiError from "components/util/ApiError";
import Divider from "components/util/Divider";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Game, GetGamePTConfig, PublicUserDocument } from "tachi-common";
import { UGPTFolderReturns } from "types/api-returns";
import { FolderDataset } from "types/tables";
import { Playtype } from "types/tachi";
import { DEFAULT_BAR_PROPS } from "util/charts";
import { ChangeOpacity } from "util/color-opacity";
import { CreateChartIDMap, CreateSongMap } from "util/data";
import { ComposeExpFn, ComposeInverseExpFn } from "util/misc";
import { NumericSOV, StrSOV } from "util/sorts";

interface Props {
	reqUser: PublicUserDocument;
	game: Game;
	playtype: Playtype;
}

export default function SpecificFolderPage({ reqUser, game, playtype }: Props) {
	const { folderID } = useParams<{ folderID: string }>();

	const { data, isLoading, error } = useApiQuery<UGPTFolderReturns>(
		`/users/${reqUser.id}/games/${game}/${playtype}/folders/${folderID}`
	);

	const folderDataset = useMemo(() => {
		if (!data) {
			return null;
		}

		const songMap = CreateSongMap(data.songs);
		const pbMap = CreateChartIDMap(data.pbs);

		const folderDataset: FolderDataset = [];

		for (const chart of data.charts) {
			folderDataset.push({
				...chart,
				__related: {
					pb: pbMap.get(chart.chartID) ?? null,
					song: songMap.get(chart.songID)!,
				},
			});
		}

		folderDataset.sort(StrSOV(x => x.__related.song.title));

		return folderDataset;
	}, [data]);

	if (isLoading || !data || !folderDataset) {
		return <Loading />;
	}

	if (error) {
		return <ApiError error={error} />;
	}

	return (
		<div className="row">
			<div className="col-12">
				<Divider className="mb-4" />
			</div>
			<div className="col-12">
				<FolderInfoHeader {...{ folderDataset, data, game, playtype, reqUser }} />
			</div>
			<div className="col-12">
				<Divider className="my-4" />
			</div>
			<div className="col-12">
				<FolderTable
					dataset={folderDataset}
					game={game}
					playtype={playtype}
					reqUser={reqUser}
					indexCol={false}
				/>
			</div>
		</div>
	);
}

function FolderInfoHeader({
	game,
	playtype,
	reqUser,
	folderDataset,
	data,
}: Props & { folderDataset: FolderDataset; data: UGPTFolderReturns }) {
	const dataset = [];

	const expScale = 1;

	const expFn = ComposeExpFn(expScale);
	const invExpFn = ComposeInverseExpFn(expScale);

	for (const data of folderDataset) {
		const value = data.__related.pb ? expFn(data.__related.pb.scoreData.percent) : 0;
		dataset.push({
			chartID: data.chartID,
			expValue: expFn(value),
			value,
			grade: data.__related.pb?.scoreData.grade,
		});
	}

	dataset.sort(NumericSOV(x => x.expValue));

	const dataMap = CreateChartIDMap(folderDataset);

	const gptConfig = GetGamePTConfig(game, playtype);

	return (
		<Card header={`${reqUser.username}'s ${data.folder.title} Breakdown`}>
			<div style={{ height: 400 }}>
				<ResponsiveBar
					indexBy="chartID"
					tooltip={d => (
						<BarChartTooltip
							point={d}
							renderFn={d => {
								const data = dataMap.get(d.indexValue as string)!;

								return (
									<div className="w-100 text-center">
										{data.__related.song.title}
										<br />
										{data.__related.pb?.scoreData.percent.toFixed(2)}%
									</div>
								);
							}}
						/>
					)}
					key={"value"}
					// @ts-expect-error temp

					colors={k => ChangeOpacity(gptConfig.gradeColours[k.data.grade], 0.5)}
					// @ts-expect-error temp

					borderColor={k => gptConfig.gradeColours[k.data.grade]}
					borderWidth={1}
					padding={0.2}
					// @ts-expect-error temp
					data={dataset}
					minValue={0}
					maxValue={expFn(100)}
					margin={{ left: 50, top: 20, bottom: 20 }}
					axisLeft={{
						tickValues: gptConfig.gradeBoundaries.map(e => (e === 0 ? 0 : expFn(e))),
						format: x => {
							let nearest;

							const lgv = invExpFn(x);

							for (const [i, gradeBnd] of gptConfig.gradeBoundaries.entries()) {
								if (Math.abs(gradeBnd - lgv) < 0.00005) {
									nearest = i;
									break;
								}
							}

							if (nearest === undefined) {
								return null;
							}

							return gptConfig.grades[nearest];
						},
					}}
					axisBottom={null}
					{...DEFAULT_BAR_PROPS}
				/>
			</div>
		</Card>
	);
}
