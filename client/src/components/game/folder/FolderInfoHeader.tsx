import { UppercaseFirst } from "util/misc";
import Card from "components/layout/page/Card";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import SelectButton from "components/util/SelectButton";
import { useBucket } from "components/util/useBucket";
import React, { useMemo, useState } from "react";
import { GPTString, GetGamePTConfig, GetScoreEnumConfs, UserDocument } from "tachi-common";
import { GamePT } from "types/react";
import { FolderDataset } from "types/tables";
import { GPT_CLIENT_IMPLEMENTATIONS } from "lib/game-implementations";
import FolderMinimap from "./FolderMinimap";
import FolderScoreDistributionChart from "./FolderScoreDistributionChart";
import FolderScoreAverages from "./FolderScoreAverages";

export default function FolderInfoHeader({
	game,
	playtype,
	reqUser,
	folderDataset,
	folderTitle,
}: {
	reqUser: UserDocument;
	folderDataset: FolderDataset;
	folderTitle: string;
} & GamePT) {
	const preferredDefaultEnum = useBucket(game, playtype);

	const [currentGraph, setCurrentGraph] = useState<string>(`${preferredDefaultEnum}-stats`);

	const enumGraphs = ["minimap", "stats"];

	const gptConfig = GetGamePTConfig(game, playtype);
	const gptImpl = GPT_CLIENT_IMPLEMENTATIONS[`${game}:${playtype}` as GPTString];

	const enumConf = GetScoreEnumConfs(gptConfig);

	const [metric, type] = useMemo(() => currentGraph.split("-"), [currentGraph]);

	return (
		<Card header={`${reqUser.username}'s ${folderTitle} Breakdown`}>
			<div className="col-12 d-flex justify-content-center">
				<div className="btn-group">
					{enumGraphs.flatMap((g) =>
						Object.keys(enumConf).flatMap((en) => (
							<SelectButton
								className={g === "minimap" ? "d-none d-lg-block" : ""}
								value={currentGraph}
								setValue={setCurrentGraph}
								id={`${en}-${g}`}
							>
								{/* @ts-expect-error zzz */}
								<Icon type={gptImpl.enumIcons[en]} />
								{UppercaseFirst(en)} {UppercaseFirst(g)}
							</SelectButton>
						))
					)}
					<SelectButton value={currentGraph} setValue={setCurrentGraph} id="score">
						<Icon type="sort" />
						Score Averages
					</SelectButton>
				</div>
			</div>
			<div className="col-12">
				<Divider />
			</div>

			{type === "stats" ? (
				<FolderScoreDistributionChart
					game={game}
					folderDataset={folderDataset}
					playtype={playtype}
					view={metric}
				/>
			) : type === "minimap" ? (
				<FolderMinimap
					reqUser={reqUser}
					game={game}
					playtype={playtype}
					folderDataset={folderDataset}
					enumMetric={metric}
				/>
			) : (
				<FolderScoreAverages
					reqUser={reqUser}
					game={game}
					playtype={playtype}
					folderDataset={folderDataset}
				/>
			)}
		</Card>
	);
}
