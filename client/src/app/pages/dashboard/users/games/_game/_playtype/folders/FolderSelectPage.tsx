import { APIFetchV1 } from "util/api";
import { Reverse, UppercaseFirst } from "util/misc";
import DistributionTable from "components/game/folder/FolderDistributionTable";
import Card from "components/layout/page/Card";
import DebounceSearch from "components/util/DebounceSearch";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import LinkButton from "components/util/LinkButton";
import Loading from "components/util/Loading";
import SelectButton from "components/util/SelectButton";
import useApiQuery from "components/util/query/useApiQuery";
import { useBucket } from "components/util/useBucket";
import useUGPTBase from "components/util/useUGPTBase";
import { UserContext } from "context/UserContext";
import { GPT_CLIENT_IMPLEMENTATIONS } from "lib/game-implementations";
import React, { useContext, useMemo, useState } from "react";
import {
	FolderDocument,
	GetGPTString,
	GetGamePTConfig,
	GetScoreMetricConf,
	GetScoreMetrics,
} from "tachi-common";
import { ConfEnumScoreMetric } from "tachi-common/types/metrics";
import { FolderStatsInfo, UGPTFolderSearch } from "types/api-returns";
import { UGPT } from "types/react";

export default function FoldersSearch({ reqUser, game, playtype }: UGPT) {
	const [search, setSearch] = useState("");

	const params = useMemo(() => new URLSearchParams({ search }), [search]);

	const { data, error } = useApiQuery<UGPTFolderSearch>(
		`/users/${reqUser.id}/games/${game}/${playtype}/folders?${params.toString()}`
	);

	let body = <></>;

	if (error) {
		body = <>{error.description}</>;
	} else if (!data) {
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
				{data.folders.map((e) => (
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
				<DebounceSearch setSearch={setSearch} placeholder="Search all Folders..." />
			</div>
			<div className="col-12 mt-8">
				<div className="row">{search !== "" && body}</div>
			</div>
		</>
	);
}

export function FolderInfoComponent({
	reqUser,
	game,
	playtype,
	folderStats,
	folder,
}: UGPT & { folder: FolderDocument; folderStats: FolderStatsInfo }) {
	const gptConfig = GetGamePTConfig(game, playtype);
	const gptImpl = GPT_CLIENT_IMPLEMENTATIONS[GetGPTString(game, playtype)];

	const preferredDefaultEnum = useBucket(game, playtype);

	const [metric, setMetric] = useState<string>(preferredDefaultEnum);

	const base = useUGPTBase({ reqUser, game, playtype });

	const dataset = useMemo(() => {
		const conf = GetScoreMetricConf(gptConfig, metric) as ConfEnumScoreMetric<string>;

		return (
			<DistributionTable
				// @ts-expect-error hack yeah sorry
				colours={gptImpl.enumColours[metric]}
				keys={Reverse(conf.values)}
				values={folderStats.stats[metric]}
				max={folderStats.chartCount}
			/>
		);
	}, [metric]);

	const { user } = useContext(UserContext);

	return (
		<div className="col-12 col-lg-6 mb-4">
			<Card
				header={folder.title}
				footer={
					<div className="w-100 d-flex justify-content-center">
						<LinkButton
							onClick={() => {
								if (user?.id === reqUser.id) {
									APIFetchV1(
										`/users/${reqUser.id}/games/${game}/${playtype}/folders/${folder.folderID}/viewed`,
										{ method: "POST" }
									);
								}
							}}
							to={`${base}/folders/${folder.folderID}`}
							variant="outline-info"
						>
							View
						</LinkButton>
					</div>
				}
			>
				<div className="row text-center">
					<div className="col-12">
						<div className="btn-group">
							{GetScoreMetrics(gptConfig, "ENUM").map((e) => (
								<SelectButton value={metric} setValue={setMetric} id={e}>
									{/* @ts-expect-error this access is legal zzz */}
									<Icon type={gptImpl.enumIcons[e]} /> {UppercaseFirst(e)}s
								</SelectButton>
							))}
						</div>
						<Divider />
						{dataset}
					</div>
				</div>
			</Card>
		</div>
	);
}
