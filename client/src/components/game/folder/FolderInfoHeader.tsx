import { UppercaseFirst } from "util/misc";
import Card from "components/layout/page/Card";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import SelectButton from "components/util/SelectButton";
import { useBucket } from "components/util/useBucket";
import React, { useState } from "react";
import { GetGamePTConfig, GetScoreEnumConfs, UserDocument } from "tachi-common";
import { GamePT } from "types/react";
import { FolderDataset } from "types/tables";
import FolderMinimap from "./FolderMinimap";
import FolderScoreDistributionChart from "./FolderScoreDistributionChart";

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
	const [enumMetric, setEnumMetric] = useState<string>(preferredDefaultEnum);
	const [breakdownInfo, setBreakdownInfo] = useState<"graph" | "switchboard">("switchboard");

	const gptConfig = GetGamePTConfig(game, playtype);

	const enumConf = GetScoreEnumConfs(gptConfig);

	return (
		<Card header={`${reqUser.username}'s ${folderTitle} Breakdown`}>
			<div className="col-12 d-flex justify-content-center">
				<div className="btn-group">
					{Object.keys(enumConf).map((k) => (
						<SelectButton value={enumMetric} setValue={setEnumMetric} id={k}>
							<Icon type="chart-area" />
							{UppercaseFirst(k)} Info
						</SelectButton>
					))}
				</div>
			</div>
			<div className="col-12 mt-4 d-flex justify-content-center">
				<select
					className="form-control"
					value={breakdownInfo}
					onChange={(e) => setBreakdownInfo(e.target.value as any)}
				>
					<option value="graph">Thermometer</option>
					<option value="switchboard">Switchboard</option>
				</select>
			</div>
			<div className="col-12">
				<Divider />
			</div>

			{breakdownInfo === "graph" ? (
				<FolderScoreDistributionChart
					game={game}
					folderDataset={folderDataset}
					playtype={playtype}
					view={enumMetric}
				/>
			) : (
				<FolderMinimap
					reqUser={reqUser}
					game={game}
					playtype={playtype}
					folderDataset={folderDataset}
					enumMetric={enumMetric}
				/>
			)}
		</Card>
	);
}
