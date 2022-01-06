import DistributionTable from "components/game/folder/FolderDistributionTable";
import Card from "components/layout/page/Card";
import DebounceSearch from "components/util/DebounceSearch";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import LinkButton from "components/util/LinkButton";
import Loading from "components/util/Loading";
import useApiQuery from "components/util/query/useApiQuery";
import SelectButton from "components/util/SelectButton";
import { useBucket } from "components/util/useBucket";
import useUGPTBase from "components/util/useUGPTBase";
import { UserContext } from "context/UserContext";
import React, { useContext, useMemo, useState } from "react";
import { FolderDocument, GetGamePTConfig, PublicUserDocument } from "tachi-common";
import { FolderStatsInfo, UGPTFolderSearch } from "types/api-returns";
import { GamePT } from "types/react";
import { APIFetchV1 } from "util/api";
import { Reverse } from "util/misc";

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

export function FolderInfoComponent({
	reqUser,
	game,
	playtype,
	folderStats,
	folder,
}: Props & { folder: FolderDocument; folderStats: FolderStatsInfo }) {
	const gptConfig = GetGamePTConfig(game, playtype);

	const scoreBucket = useBucket(game, playtype);

	const [elements, setElements] = useState<"grade" | "lamp">(scoreBucket);

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
