import IIDXLampChart from "components/charts/IIDXLampChart";
import DeltaCell from "components/tables/cells/DeltaCell";
import IIDXLampCell from "components/tables/cells/IIDXLampCell";
import ScoreCell from "components/tables/cells/ScoreCell";
import TimestampCell from "components/tables/cells/TimestampCell";
import MiniTable from "components/tables/components/MiniTable";
import ExternalLink from "components/util/ExternalLink";
import Icon from "components/util/Icon";
import Loading from "components/util/Loading";
import SelectButton from "components/util/SelectButton";
import React, { useMemo, useState } from "react";
import { useQuery } from "react-query";
import { ChartDocument, PBScoreDocument, PublicUserDocument } from "tachi-common";
import { UGPTChartPBComposition } from "types/api-returns";
import { GamePT } from "types/react";
import { APIFetchV1 } from "util/api";
import { IsScore } from "util/asserts";
import DropdownStructure from "./components/DropdownStructure";
import { IIDXGraphsComponent, ModsTable, ScoreInfo } from "./components/IIDXScoreDropdownParts";
import JudgementTable from "./components/JudgementTable";
import PBNote from "./components/PBNote";

export default function IIDXPBDropdown({
	game,
	playtype,
	reqUser,
	chart,
}: {
	reqUser: PublicUserDocument;
	chart: ChartDocument<"iidx:SP">;
} & GamePT) {
	const [view, setView] = useState<"pb" | "scorePB" | "lampPB" | "bpPB" | "history">("pb");

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
		<DropdownStructure
			buttons={
				<>
					<SelectButton setValue={setView} value={view} id="pb">
						<Icon type="trophy" />
						PB Info
					</SelectButton>
					<SelectButton setValue={setView} value={view} id="scorePB">
						<Icon type="star-half-alt" />
						Best Score
					</SelectButton>
					<SelectButton setValue={setView} value={view} id="lampPB">
						<Icon type="lightbulb" />
						Best Lamp
					</SelectButton>
					<SelectButton setValue={setView} value={view} id="history" disabled>
						<Icon type="history" />
						Play History
					</SelectButton>
				</>
			}
		>
			{view === "history" ? <></> : <DocumentDisplay pbData={data} view={view} />}
		</DropdownStructure>
	);
}

function DocumentDisplay({
	pbData,
	view,
}: {
	pbData: UGPTChartPBComposition<"iidx:SP">;
	view: "pb" | "scorePB" | "lampPB" | "bpPB";
}) {
	const idMap = {
		scorePB: pbData.pb.composedFrom.scorePB,
		lampPB: pbData.pb.composedFrom.lampPB,
		...Object.fromEntries((pbData.pb.composedFrom.other ?? []).map(e => [e.name, e.scoreID])),
	};

	const currentDoc = useMemo(() => {
		if (view === "pb") {
			return pbData.pb;
		}

		// @ts-expect-error awful
		return pbData.scores.filter(e => e.scoreID === idMap[view])[0];
	}, [view]);

	// @ts-expect-error temp
	currentDoc.comment = "THIS IS AN EXAMPLE COMMENT.";

	return (
		<>
			<div className="col-9">
				<div className="row">
					<IIDXGraphsComponent score={currentDoc} />
					{IsScore(currentDoc) ? (
						<>
							<ScoreInfo score={currentDoc} />
							{currentDoc.comment && (
								<div className="col-12">
									<em>&quot;{currentDoc.comment}&quot;</em>
								</div>
							)}
						</>
					) : (
						<div className="col-12">
							<PBNote />
						</div>
					)}
				</div>
			</div>
			<div className="col-3 align-self-center">
				<JudgementTable
					game="iidx"
					playtype="SP"
					judgements={currentDoc.scoreData.judgements}
				/>
				{IsScore(currentDoc) && <ModsTable score={currentDoc} />}
			</div>
		</>
	);
}
