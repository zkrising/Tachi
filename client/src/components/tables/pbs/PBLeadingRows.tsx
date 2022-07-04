import React from "react";
import { SetState } from "types/react";
import { PBDataset } from "types/tables";
import DifficultyCell from "../cells/DifficultyCell";
import IndicatorsCell from "../cells/IndicatorsCell";
import TitleCell from "../cells/TitleCell";
import UserCell from "../cells/UserCell";

export default function PBLeadingRows({
	showUser,
	showChart,
	pb,
	scoreState,
	overrideDiffCell,
}: {
	showUser: boolean;
	showChart: boolean;
	pb: PBDataset[0];
	scoreState: { highlight: boolean; setHighlight: SetState<boolean> };
	overrideDiffCell?: JSX.Element;
}) {
	const game = pb.game;

	const diffCell = overrideDiffCell || <DifficultyCell chart={pb.__related.chart} game={game} />;

	return (
		<>
			{showUser && showChart && (
				<>
					<UserCell game={game} playtype={pb.playtype} user={pb.__related.user!} />
					{diffCell}
					<IndicatorsCell highlight={scoreState.highlight} />
					<TitleCell song={pb.__related.song} chart={pb.__related.chart} game={game} />
				</>
			)}
			{showUser && !showChart && (
				<>
					<IndicatorsCell highlight={scoreState.highlight} />
					<UserCell game={game} playtype={pb.playtype} user={pb.__related.user!} />
				</>
			)}
			{!showUser && showChart && (
				<>
					{diffCell}
					<IndicatorsCell highlight={scoreState.highlight} />
					<TitleCell song={pb.__related.song} chart={pb.__related.chart} game={game} />
				</>
			)}
		</>
	);
}
