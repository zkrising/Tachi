import Icon from "components/util/Icon";
import Loading from "components/util/Loading";
import SelectButton from "components/util/SelectButton";
import React, { useMemo, useState } from "react";
import { useQuery } from "react-query";
import { ChartDocument, PublicUserDocument } from "tachi-common";
import { UGPTChartPBComposition } from "types/api-returns";
import { GamePT, SetState } from "types/react";
import { APIFetchV1 } from "util/api";
import { IsScore } from "util/asserts";
import CommentContainer from "./components/CommentContainer";
import DropdownStructure from "./components/DropdownStructure";
import { IIDXGraphsComponent, ModsTable, ScoreInfo } from "./components/IIDXScoreDropdownParts";
import JudgementTable from "./components/JudgementTable";
import PBNote from "./components/PBNote";
import ScoreEditButtons from "./components/ScoreEditButtons";

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
			{view === "history" ? (
				<></>
			) : (
				<DocumentDisplay pbData={data} view={view} scoreState={scoreState} />
			)}
		</DropdownStructure>
	);
}

function DocumentDisplay({
	pbData,
	view,
	scoreState,
}: {
	pbData: UGPTChartPBComposition<"iidx:SP">;
	view: "pb" | "scorePB" | "lampPB" | "bpPB";
	scoreState: {
		highlight: boolean;
		setHighlight: SetState<boolean>;
	};
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

	const [comment, setComment] = useState(IsScore(currentDoc) ? currentDoc.comment : null);

	return (
		<>
			<div className="col-9">
				<div className="row">
					<IIDXGraphsComponent score={currentDoc} />
					{IsScore(currentDoc) ? (
						<>
							<ScoreInfo score={currentDoc} />
							<CommentContainer comment={comment} />
							<ScoreEditButtons
								score={currentDoc}
								scoreState={{ ...scoreState, comment, setComment }}
							/>
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
