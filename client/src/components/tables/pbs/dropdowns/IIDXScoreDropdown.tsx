import Icon from "components/util/Icon";
import Loading from "components/util/Loading";
import SelectButton from "components/util/SelectButton";
import React, { useState } from "react";
import { UGPTChartPBComposition } from "types/api-returns";
import { GamePT } from "types/react";
import { APIFetchV1 } from "util/api";
import DropdownStructure from "./components/DropdownStructure";
import { PublicUserDocument, ChartDocument, ScoreDocument } from "tachi-common";
import { useQuery } from "react-query";
import { IsScore } from "util/asserts";
import { IIDXGraphsComponent, ScoreInfo, ModsTable } from "./components/IIDXScoreDropdownParts";
import JudgementTable from "./components/JudgementTable";
import PBNote from "./components/PBNote";

export default function IIDXScoreDropdown({
	thisScore,
	game,
	playtype,
	reqUser,
	chart,
}: {
	thisScore: ScoreDocument<"iidx:SP" | "iidx:DP">;
	reqUser: PublicUserDocument;
	chart: ChartDocument<"iidx:SP">;
} & GamePT) {
	const [view, setView] = useState<"vsPB" | "moreInfo" | "history">("moreInfo");

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

	let content = null;

	thisScore.comment = "THIS IS AN EXAMPLE COMMENT.";

	if (view === "moreInfo") {
		content = (
			<>
				<div className="col-9">
					<div className="row">
						<IIDXGraphsComponent score={thisScore} />
						{thisScore.comment && (
							<div className="col-12">
								<em>&quot;{thisScore.comment}&quot;</em>
							</div>
						)}
					</div>
				</div>
				<div className="col-3 align-self-center">
					<JudgementTable
						game="iidx"
						playtype="SP"
						judgements={thisScore.scoreData.judgements}
					/>
					{IsScore(thisScore) && <ModsTable score={thisScore} />}
				</div>
			</>
		);
	}

	return (
		<DropdownStructure
			buttons={
				<>
					<SelectButton setValue={setView} value={view} id="moreInfo">
						<Icon type="chart-bar" />
						This Score
					</SelectButton>
					<SelectButton setValue={setView} value={view} id="vsPB">
						<Icon type="balance-scale-right" />
						Versus PB
					</SelectButton>
					<SelectButton setValue={setView} value={view} id="history" disabled>
						<Icon type="history" />
						Play History
					</SelectButton>
				</>
			}
		>
			{content}
		</DropdownStructure>
	);
}
