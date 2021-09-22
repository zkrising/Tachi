import React from "react";
import {
	ChartDocument,
	integer,
	PBScoreDocument,
	PublicUserDocument,
	ScoreDocument,
} from "tachi-common";
import { UGPTChartPBComposition } from "types/api-returns";
import { GamePT, SetState } from "types/react";
import DropdownScoreButtons from "./components/DropdownScoreButtons";
import { IIDXGraphsComponent } from "./components/IIDXScoreDropdownParts";
import JudgementTable from "./components/JudgementTable";
import GenericPBDropdown, { ScoreState } from "./GenericPBDropdown";

export default function IIDXPBDropdown({
	game,
	playtype,
	chart,
	scoreState,
	userID,
}: {
	userID: integer;
	chart: ChartDocument<"iidx:SP" | "iidx:DP">;
	scoreState: {
		highlight: boolean;
		setHighlight: SetState<boolean>;
	};
} & GamePT) {
	return (
		<GenericPBDropdown
			{...{ game, playtype, chart, userID, scoreState }}
			DocComponent={DocumentDisplay}
		/>
	);
}

function DocumentDisplay({
	score,
	scoreState,
	pbData,
}: {
	score: PBScoreDocument<"iidx:SP" | "iidx:DP"> | ScoreDocument<"iidx:SP" | "iidx:DP">;
	scoreState: ScoreState;
	pbData: UGPTChartPBComposition<"iidx:SP" | "iidx:DP">;
}) {
	return (
		<>
			<div className="col-9">
				<div className="row">
					<IIDXGraphsComponent score={score} />
					<DropdownScoreButtons {...{ score, scoreState, pbData }} />
				</div>
			</div>
			<div className="col-3 align-self-center">
				<JudgementTable score={score} />
			</div>
		</>
	);
}
