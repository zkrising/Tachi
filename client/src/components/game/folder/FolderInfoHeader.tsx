import Card from "components/layout/page/Card";
import Divider from "components/util/Divider";
import Icon from "components/util/Icon";
import SelectButton from "components/util/SelectButton";
import { useBucket } from "components/util/useBucket";
import React, { useState } from "react";
import { PublicUserDocument } from "tachi-common";
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
	reqUser: PublicUserDocument;
	folderDataset: FolderDataset;
	folderTitle: string;
} & GamePT) {
	const scoreBucket = useBucket(game, playtype);
	const [view, setView] = useState<"grade" | "lamp">(scoreBucket);
	const [breakdownInfo, setBreakdownInfo] = useState<"graph" | "switchboard">("switchboard");

	return (
		<Card header={`${reqUser.username}'s ${folderTitle} Breakdown`}>
			<div className="col-12 d-flex justify-content-center">
				<div className="btn-group">
					<SelectButton value={view} setValue={setView} id="grade">
						<Icon type="chart-area" />
						Score Info
					</SelectButton>
					<SelectButton value={view} setValue={setView} id="lamp">
						<Icon type="lightbulb" />
						Lamp Info
					</SelectButton>
				</div>
			</div>
			<div className="col-12 mt-4 d-flex justify-content-center">
				<select
					className="form-control"
					value={breakdownInfo}
					onChange={e => setBreakdownInfo(e.target.value as any)}
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
					view={view}
				/>
			) : (
				<FolderMinimap
					game={game}
					playtype={playtype}
					folderDataset={folderDataset}
					view={view}
				/>
			)}
		</Card>
	);
}
