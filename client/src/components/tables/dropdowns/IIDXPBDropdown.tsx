import DebugContent from "components/util/DebugContent";
import Icon from "components/util/Icon";
import Loading from "components/util/Loading";
import SelectButton from "components/util/SelectButton";
import React, { useMemo, useState, useEffect } from "react";
import { useQuery } from "react-query";
import { ChartDocument, PBScoreDocument, PublicUserDocument, ScoreDocument } from "tachi-common";
import { UGPTChartPBComposition } from "types/api-returns";
import { GamePT, SetState } from "types/react";
import { APIFetchV1 } from "util/api";
import { IsScore } from "util/asserts";
import CommentContainer from "./components/CommentContainer";
import DropdownScoreButtons from "./components/DropdownScoreButtons";
import DropdownStructure from "./components/DropdownStructure";
import { IIDXGraphsComponent, ModsTable, ScoreInfo } from "./components/IIDXScoreDropdownParts";
import JudgementTable from "./components/JudgementTable";
import PBNote from "./components/PBNote";
import ScoreEditButtons from "./components/ScoreEditButtons";
import GenericPBDropdown, { ScoreState } from "./GenericPBDropdown";

export default function IIDXPBDropdown({
	game,
	playtype,
	reqUser,
	chart,
	scoreState,
}: {
	reqUser: PublicUserDocument;
	chart: ChartDocument<"iidx:SP" | "iidx:DP">;
	scoreState: {
		highlight: boolean;
		setHighlight: SetState<boolean>;
	};
} & GamePT) {
	const [view, setView] = useState<"pb" | "scorePB" | "lampPB" | "bpPB" | "history" | "debug">(
		"pb"
	);

	const { isLoading, error, data } = useQuery(
		`/users/${reqUser.id}/games/${game}/${playtype}/pbs/${chart.chartID}?getComposition=true`,
		async () => {
			const res = await APIFetchV1<UGPTChartPBComposition<"iidx:SP">>(
				`/users/${reqUser.id}/games/${game}/${playtype}/pbs/${chart.chartID}?getComposition=true`
			);

			if (!res.success) {
				throw new Error(res.description);
			}

			return res.body;
		}
	);

	if (error) {
		return <>An error has occured. Nice.</>;
	}

	if (isLoading || !data) {
		return (
			<div style={{ height: "200px" }} className="d-flex align-items-center">
				<Loading />
			</div>
		);
	}

	return (
		<GenericPBDropdown
			{...{ game, playtype, chart, reqUser, scoreState }}
			DocComponent={DocumentDisplay}
		/>
	);
}

function DocumentDisplay({
	score,
	scoreState,
}: {
	score: PBScoreDocument<"iidx:SP" | "iidx:DP"> | ScoreDocument<"iidx:SP" | "iidx:DP">;
	scoreState: ScoreState;
}) {
	return (
		<>
			<div className="col-9">
				<div className="row">
					<IIDXGraphsComponent score={score} />
					<DropdownScoreButtons {...{ score, scoreState }} />
				</div>
			</div>
			<div className="col-3 align-self-center">
				<JudgementTable score={score} />
			</div>
		</>
	);
}
