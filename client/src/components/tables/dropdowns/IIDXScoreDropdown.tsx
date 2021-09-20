import Loading from "components/util/Loading";
import React from "react";
import { UGPTChartPBComposition } from "types/api-returns";
import { GamePT, SetState } from "types/react";
import { PublicUserDocument, ChartDocument, ScoreDocument } from "tachi-common";
import { IIDXGraphsComponent } from "./components/IIDXScoreDropdownParts";
import GenericScoreDropdown from "./GenericScoreDropdown";
import useApiQuery from "components/util/query/useApiQuery";
import GenericScoreContentDropdown from "./components/GenericScoreContentDropdown";

export default function IIDXScoreDropdown({
	thisScore,
	game,
	playtype,
	user,
	chart,
	scoreState,
}: {
	thisScore: ScoreDocument<"iidx:SP" | "iidx:DP">;
	user: PublicUserDocument;
	chart: ChartDocument<"iidx:SP" | "iidx:DP">;
	scoreState: {
		highlight: boolean;
		comment: string | null;
		setHighlight: SetState<boolean>;
		setComment: SetState<string | null>;
	};
} & GamePT) {
	const { isLoading, error, data } = useApiQuery<UGPTChartPBComposition<"iidx:SP" | "iidx:DP">>(
		`/users/${user.id}/games/${game}/${playtype}/pbs/${chart.chartID}?getComposition=true`
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
		<GenericScoreDropdown<"iidx:SP" | "iidx:DP">
			{...{ game, playtype, chart, reqUser: user, scoreState, thisScore, user }}
			DocComponent={props =>
				GenericScoreContentDropdown({
					...props,
					renderScoreInfo: false,
					// let the record show that i tried fixing this
					// for a while, but gave up.
					GraphComponent: IIDXGraphsComponent as any,
				})
			}
		/>
	);
}
