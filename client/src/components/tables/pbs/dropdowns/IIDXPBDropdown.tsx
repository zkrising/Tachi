import IIDXLampChart from "components/charts/IIDXLampChart";
import MiniTable from "components/tables/components/MiniTable";
import Icon from "components/util/Icon";
import SelectButton from "components/util/SelectButton";
import { nanoid } from "nanoid";
import React, { useMemo, useState } from "react";
import { Nav, Tab, Tabs } from "react-bootstrap";
import { GetGamePTConfig, Lamps, PBScoreDocument } from "tachi-common";
import { GamePT } from "types/react";
import JudgementTable from "./components/JudgementTable";

export default function IIDXPBDropdown({
	pb,
	game,
	playtype,
}: { pb: PBScoreDocument<"iidx:SP" | "iidx:DP"> } & GamePT) {
	const [view, setView] = useState<"pb" | "scorePB" | "lampPB" | "bpPB" | "history">("pb");

	const currentDoc = useMemo(() => {
		if (view === "pb") {
			return pb;
		}

		return pb;
	}, [view]);

	let gaugeStatus: "none" | "single" | "gsm" = "none";

	if (currentDoc.scoreData.hitMeta.gsm) {
		gaugeStatus = "gsm";
	} else if (currentDoc.scoreData.hitMeta.gaugeHistory) {
		gaugeStatus = "single";
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
						<SelectButton setValue={setView} value={view} id="history">
							<Icon type="history" />
							Play History
						</SelectButton>
					</div>
				</div>

				<div className="col-9 col-xl-10">
					<div className="row mb-0">
						<div className="col-9">
							{gaugeStatus === "none" ? (
								<div className="d-flex h-100 align-items-center justify-content-center">
									<span className="text-muted">No gauge data :(</span>
								</div>
							) : (
								<div className="d-flex justify-content-center">
									<Tab.Container
										defaultActiveKey={LampToKey(pb.scoreData.lamp)}
										id={nanoid()}
									>
										<div className="col-12">
											<Nav>
												{gaugeStatus === "gsm" ? (
													<>
														<Nav.Link
															eventKey="easy"
															title="Easy"
														></Nav.Link>
														<Nav.Link
															eventKey="normal"
															title="Normal"
														></Nav.Link>
														<Nav.Link
															eventKey="hard"
															title="Hard"
														></Nav.Link>
														<Nav.Link eventKey="exhard" title="Ex Hard">
															<GraphComponent
																type="exhard"
																values={
																	currentDoc.scoreData.hitMeta
																		.gsm!.EX_HARD
																}
															/>
														</Nav.Link>
													</>
												) : (
													<Nav.Item>
														<Nav.Link
															eventKey={LampToKey(pb.scoreData.lamp)}
														>
															{LampToName(pb.scoreData.lamp)}
														</Nav.Link>
													</Nav.Item>
												)}
											</Nav>
											<GraphComponent
												type="exhard"
												values={currentDoc.scoreData.hitMeta.gaugeHistory!}
											/>
										</div>
									</Tab.Container>
								</div>
							)}
						</div>
						<div className="col-3">
							<JudgementTable
								game={"iidx"}
								playtype="SP"
								judgements={currentDoc.scoreData.judgements}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function GraphComponent({ type, values }: { type: LampTypes; values: (number | null)[] }) {
	console.log(values);

	return (
		<IIDXLampChart
			data={[
				{
					id: type,
					data: values.map((e, i) => ({ x: i, y: e ?? 0 })),
				},
			]}
		/>
	);
}

type LampTypes = "normal" | "easy" | "hard" | "exhard";

function LampToKey(lamp: Lamps["iidx:SP"]): LampTypes {
	if (lamp === "CLEAR") {
		return "normal";
	} else if (lamp === "EASY CLEAR") {
		return "easy";
	} else if (lamp === "HARD CLEAR") {
		return "hard";
	} else if (lamp === "EX HARD CLEAR") {
		return "exhard";
	}

	return "normal";
}

function LampToName(lamp: Lamps["iidx:SP"]) {
	if (lamp === "CLEAR") {
		return "Normal";
	} else if (lamp === "EASY CLEAR") {
		return "Easy";
	} else if (lamp === "HARD CLEAR") {
		return "Hard";
	} else if (lamp === "EX HARD CLEAR") {
		return "Ex Hard";
	}

	return "Normal";
}
