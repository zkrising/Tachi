import { ResponsiveBar } from "@nivo/bar";
import { BarChartTooltip } from "components/charts/ChartTooltip";
import Card from "components/layout/page/Card";
import MiniTable from "components/tables/components/MiniTable";
import DebounceSearch from "components/util/DebounceSearch";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import LinkButton from "components/util/LinkButton";
import Loading from "components/util/Loading";
import Muted from "components/util/Muted";
import useApiQuery from "components/util/query/useApiQuery";
import SelectButton from "components/util/SelectButton";
import useUGPTBase from "components/util/useUGPTBase";
import React, { useState, useMemo } from "react";
import { FolderDocument, GetGamePTConfig, integer, PublicUserDocument } from "tachi-common";
import { UGPTFolderSearch, FolderStatsInfo } from "types/api-returns";
import { GamePT } from "types/react";
import { ChangeOpacity } from "util/color-opacity";
import { TACHI_CHART_THEME } from "util/constants/chart-theme";
import { Reverse, StepFromToMax, PercentFrom } from "util/misc";

type Props = { reqUser: PublicUserDocument } & GamePT;

export default function FoldersSearch({ reqUser, game, playtype }: Props) {
	const [search, setSearch] = useState("");

	const params = useMemo(() => new URLSearchParams({ search }), [search]);

	const { data, isLoading, error } = useApiQuery<UGPTFolderSearch>(
		`/users/${reqUser.id}/games/${game}/${playtype}/folders?${params.toString()}`
	);

	let body = <></>;

	if (error) {
		body = <>{error.description}</>;
	} else if (isLoading || !data) {
		body = <Loading />;
	} else {
		const statMap = new Map();

		for (const stat of data.stats) {
			statMap.set(stat.folderID, stat);
		}

		body = (
			<>
				{data.folders.length === 0 && (
					<div className="col-12 text-center">Found nothin'.</div>
				)}
				{data.folders.map(e => (
					<FolderInfoComponent
						key={e.folderID}
						folder={e}
						folderStats={statMap.get(e.folderID)!}
						game={game}
						playtype={playtype}
						reqUser={reqUser}
					/>
				))}
			</>
		);
	}

	return (
		<>
			<div className="col-12">
				<DebounceSearch
					className="form-control-lg"
					setSearch={setSearch}
					placeholder="Search all Folders..."
				/>
			</div>
			<div className="col-12 mt-8">
				<div className="row">{search !== "" && body}</div>
			</div>
		</>
	);
}

function FolderInfoComponent({
	reqUser,
	game,
	playtype,
	folderStats,
	folder,
}: Props & { folder: FolderDocument; folderStats: FolderStatsInfo }) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const [elements, setElements] = useState<"grade" | "lamp">(gptConfig.scoreBucket);

	const base = useUGPTBase({ reqUser, game, playtype });

	const dataset = useMemo(() => {
		if (elements === "grade") {
			return (
				<DistributionTable
					colours={gptConfig.gradeColours}
					keys={Reverse(gptConfig.grades)}
					values={folderStats.grades}
					max={folderStats.chartCount}
				/>
			);
		}

		return (
			<DistributionTable
				colours={gptConfig.lampColours}
				keys={Reverse(gptConfig.lamps)}
				values={folderStats.lamps}
				max={folderStats.chartCount}
			/>
		);
	}, [elements]);

	return (
		<div className="col-12 col-lg-6 mb-4">
			<Card
				header={folder.title}
				footer={
					<div className="w-100 d-flex justify-content-center">
						<LinkButton
							to={`${base}/folders/${folder.folderID}`}
							className="btn-outline-info"
						>
							View
						</LinkButton>
					</div>
				}
			>
				<div className="row text-center">
					<div className="col-12">
						<div className="btn-group">
							<SelectButton value={elements} setValue={setElements} id="grade">
								<Icon type="sort-alpha-up" />
								Grades
							</SelectButton>
							<SelectButton value={elements} setValue={setElements} id="lamp">
								<Icon type="lightbulb" />
								Lamps
							</SelectButton>
						</div>
						<Divider />
						{dataset}
					</div>
				</div>
			</Card>
		</div>
	);
}

function DistributionTable<T extends string>({
	keys,
	values,
	colours,
	max,
}: {
	keys: T[];
	values: Record<T, integer>;
	colours: Record<T, string>;
	max: integer;
}) {
	const cumulativeValues: Record<T, integer> = {} as Record<T, integer>;

	let total = 0;
	for (const k of keys) {
		total += values[k] ?? 0;
		cumulativeValues[k] = total;
	}

	return (
		<MiniTable headers={["Value", "Count (Total)", "Thermometer"]}>
			{keys.map((k, i) => (
				<tr key={k}>
					<td style={{ backgroundColor: ChangeOpacity(colours[k], 0.15) }}>{k}</td>
					<td>
						{values[k] ?? 0} <Muted>({cumulativeValues[k]})</Muted>
					</td>
					{i === 0 && (
						<FolderThermometer
							keys={keys}
							values={values}
							max={max}
							colours={colours}
						/>
					)}
				</tr>
			))}
		</MiniTable>
	);
}

function FolderThermometer<T extends string>({
	keys,
	values,
	max,
	colours,
}: {
	keys: T[];
	values: Record<T, integer>;
	colours: Record<T, string>;
	max: integer;
}) {
	return (
		<td rowSpan={keys.length} style={{ width: 200, height: 40 * keys.length }}>
			<ResponsiveBar
				keys={Reverse(keys)}
				data={[Object.assign({ id: "" }, values)]}
				theme={Object.assign({}, TACHI_CHART_THEME, { background: "#1c1c1c" })}
				// @ts-expect-error temp
				colors={k => ChangeOpacity(colours[k.id], 0.5)}
				// @ts-expect-error Keys are appended with "." for some reason.
				borderColor={k => colours[k.data.id]}
				labelTextColor="black"
				labelSkipHeight={12}
				maxValue={max}
				padding={0.33}
				borderWidth={1}
				valueScale={{ type: "linear" }}
				axisRight={{
					tickSize: 5,
					tickPadding: 5,
					tickValues: StepFromToMax(max),
				}}
				margin={{ right: 50, bottom: 10, top: 20 }}
				tooltip={d => (
					<BarChartTooltip
						point={d}
						renderFn={d => (
							<div className="w-100 text-center">
								{d.label}
								{d.value} ({PercentFrom(d.value, max)})
							</div>
						)}
					/>
				)}
				motionConfig="stiff"
			/>
		</td>
	);
}
