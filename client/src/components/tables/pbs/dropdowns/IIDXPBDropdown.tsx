import IIDXLampChart from "components/charts/IIDXLampChart";
import DeltaCell from "components/tables/cells/DeltaCell";
import IIDXLampCell from "components/tables/cells/IIDXLampCell";
import ScoreCell from "components/tables/cells/ScoreCell";
import TimestampCell from "components/tables/cells/TimestampCell";
import MiniTable from "components/tables/components/MiniTable";
import AsyncLoader from "components/util/AsyncLoader";
import ExternalLink from "components/util/ExternalLink";
import Icon from "components/util/Icon";
import Loading from "components/util/Loading";
import SelectButton from "components/util/SelectButton";
import SelectNav from "components/util/SelectNav";
import React, { useMemo, useState } from "react";
import { Nav } from "react-bootstrap";
import { useQuery } from "react-query";
import {
	ChartDocument,
	Lamps,
	PBScoreDocument,
	PublicUserDocument,
	ScoreDocument,
} from "tachi-common";
import { UGPTChartPBComposition } from "types/api-returns";
import { GamePT } from "types/react";
import { APIFetchV1 } from "util/api";
import JudgementTable from "./components/JudgementTable";
type LampTypes = "NORMAL" | "EASY" | "HARD" | "EX_HARD";

export default function IIDXPBDropdown({
	pb,
	game,
	playtype,
	reqUser,
	chart,
}: {
	pb: PBScoreDocument<"iidx:SP" | "iidx:DP">;
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
		<div className="p-2">
			<div className="row h-100 mb-0 align-items-center">
				<div className="col-3 col-xl-2">
					<div className="btn-group-vertical">
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
					</div>
				</div>

				<div className="col-9 col-xl-10">
					<div className="row mb-0">
						{view === "history" ? <></> : <DocumentDisplay pbData={data} view={view} />}
					</div>
				</div>
			</div>
		</div>
	);
}

function DocumentDisplay({
	pbData,
	view,
}: {
	pbData: UGPTChartPBComposition<"iidx:SP">;
	view: "pb" | "scorePB" | "lampPB" | "bpPB" | "history";
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

	const [lamp, setLamp] = useState(LampToKey(currentDoc.scoreData.lamp));

	let gaugeStatus: "none" | "single" | "gsm" = "none";

	if (currentDoc.scoreData.hitMeta.gsm) {
		gaugeStatus = "gsm";
	} else if (currentDoc.scoreData.hitMeta.gaugeHistory) {
		gaugeStatus = "single";
	}

	const shouldDisable = (r: LampTypes) => {
		if (gaugeStatus === "gsm") {
			return false;
		} else if (gaugeStatus === "single") {
			return r !== LampToKey(currentDoc.scoreData.lamp);
		}

		return true;
	};

	return (
		<>
			<div className="col-9">
				<div className="row">
					<div className="col-12 d-flex justify-content-center">
						<Nav variant="pills">
							<SelectNav
								id="EASY"
								value={lamp}
								setValue={setLamp}
								disabled={shouldDisable("EASY")}
							>
								Easy
							</SelectNav>
							<SelectNav
								id="NORMAL"
								value={lamp}
								setValue={setLamp}
								disabled={shouldDisable("NORMAL")}
							>
								Normal
							</SelectNav>
							<SelectNav
								id="HARD"
								value={lamp}
								setValue={setLamp}
								disabled={shouldDisable("HARD")}
							>
								Hard
							</SelectNav>
							<SelectNav
								id="EX_HARD"
								value={lamp}
								setValue={setLamp}
								disabled={shouldDisable("EX_HARD")}
							>
								Ex Hard
							</SelectNav>
						</Nav>
					</div>
					<div className="col-12">
						{gaugeStatus === "gsm" ? (
							<GraphComponent
								type={lamp}
								values={currentDoc.scoreData.hitMeta.gsm![lamp]}
							/>
						) : gaugeStatus === "single" ? (
							<GraphComponent
								type={lamp}
								values={currentDoc.scoreData.hitMeta.gaugeHistory!}
							/>
						) : (
							<div
								className="d-flex align-items-center justify-content-center"
								style={{ height: "200px" }}
							>
								<span className="text-muted">No gauge data :(</span>
							</div>
						)}
					</div>
					{view !== "pb" ? (
						<>
							<div className="col-12">
								<table className="table">
									<thead>
										<tr>
											<td colSpan={100}>Score Info</td>
										</tr>
									</thead>
									<tbody>
										<tr>
											<ScoreCell
												score={currentDoc}
												game="iidx"
												playtype="SP"
											/>
											<DeltaCell
												game="iidx"
												playtype="SP"
												score={currentDoc.scoreData.score}
												percent={currentDoc.scoreData.percent}
												grade={currentDoc.scoreData.grade}
											/>
											<IIDXLampCell sc={currentDoc} />
											<TimestampCell time={currentDoc.timeAchieved} />
										</tr>
									</tbody>
								</table>
							</div>
							{pbData.pb.composedFrom.lampPB === pbData.pb.composedFrom.scorePB && (
								<div className="col-12">
									<small>
										Looks like your best lamp and your best score was the same
										score!
									</small>
								</div>
							)}
						</>
					) : (
						<div className="col-12">
							<small>
								Your PB is the combination of your best score and your best lamp.
								Read more{" "}
								<ExternalLink href="https://tachi.readthedocs.io/en/latest/user/pbs-scores/">
									{" "}
									here.
								</ExternalLink>
							</small>
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
				{/* @ts-expect-error temp */}
				<ModsTable view={view} doc={currentDoc} />
			</div>
		</>
	);
}

function ModsTable({
	view,
	doc,
}: {
	view: "pb" | "lampPB" | "scorePB" | "bpPB";
	doc: PBScoreDocument<"iidx:SP"> | ScoreDocument<"iidx:SP">;
}) {
	if (view === "pb") {
		return null;
	}

	const sc = doc as ScoreDocument<"iidx:SP">;

	if (!sc.scoreMeta.assist && !sc.scoreMeta.random) {
		return null;
	}

	return (
		<MiniTable className="text-center table-sm" headers={["Mods"]} colSpan={2}>
			{sc.scoreMeta.random && (
				<tr>
					<td>Note</td>
					<td>{sc.scoreMeta.random}</td>
				</tr>
			)}
			{sc.scoreMeta.assist && (
				<tr>
					<td>Assist</td>
					<td>{sc.scoreMeta.assist}</td>
				</tr>
			)}
		</MiniTable>
	);
}

function GraphComponent({ type, values }: { type: LampTypes; values: (number | null)[] }) {
	return (
		<IIDXLampChart
			height="200px"
			mobileHeight="175px"
			type={type}
			data={[
				{
					id: type,
					data: values.map((e, i) => ({ x: i, y: e ?? 0 })),
				},
			]}
		/>
	);
}

function LampToKey(lamp: Lamps["iidx:SP"]): LampTypes {
	if (lamp === "CLEAR") {
		return "NORMAL";
	} else if (lamp === "EASY CLEAR") {
		return "EASY";
	} else if (lamp === "HARD CLEAR") {
		return "HARD";
	} else if (lamp === "EX HARD CLEAR") {
		return "EX_HARD";
	}

	return "NORMAL";
}
