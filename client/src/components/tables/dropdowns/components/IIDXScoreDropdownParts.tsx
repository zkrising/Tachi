import { IsScore } from "util/asserts";
import { IsNotNullish, IsNullish } from "util/misc";
import IIDXBPIChart from "components/charts/IIDXBPIChart";
import IIDXLampChart from "components/charts/IIDXLampChart";
import SelectNav from "components/util/SelectNav";
import React, { useEffect, useState } from "react";
import { Nav } from "react-bootstrap";
import { ChartDocument, PBScoreDocument, ScoreDocument } from "tachi-common";

// export function ModsTable({ score }: { score: ScoreDocument<"iidx:SP" | "iidx:DP"> }) {
// 	if (!score.scoreMeta.assist && !score.scoreMeta.random) {
// 		return null;
// 	}

// 	return (
// 		<MiniTable className="text-center table-sm" headers={["Mods"]} colSpan={2}>
// 			{score.scoreMeta.random && (
// 				<tr>
// 					<td>Note</td>
// 					<td>
// 						{Array.isArray(score.scoreMeta.random)
// 							? score.scoreMeta.random.join(" | ")
// 							: score.scoreMeta.random}
// 					</td>
// 				</tr>
// 			)}
// 			{score.scoreMeta.assist && (
// 				<tr>
// 					<td>Assist</td>
// 					<td>{score.scoreMeta.assist}</td>
// 				</tr>
// 			)}
// 		</MiniTable>
// 	);
// }

type LampTypes = "NORMAL" | "EASY" | "HARD" | "EX_HARD";

export function IIDXGraphsComponent({
	score,
	chart,
}: {
	score: ScoreDocument<"iidx:SP" | "iidx:DP"> | PBScoreDocument<"iidx:SP" | "iidx:DP">;
	chart: ChartDocument<"iidx:SP" | "iidx:DP">;
}) {
	const [lamp, setLamp] = useState<LampTypes | "BPI">(LampToKey(score));

	let gaugeStatus: "none" | "single" | "gsm" = "none";

	if (score.scoreData.hitMeta.gsm) {
		gaugeStatus = "gsm";
	} else if (score.scoreData.hitMeta.gaugeHistory) {
		gaugeStatus = "single";
	} else if (IsNotNullish(score.calculatedData.BPI) && lamp !== "BPI") {
		setLamp("BPI");
	}

	const shouldDisable = (r: LampTypes) => {
		if (gaugeStatus === "gsm") {
			return false;
		} else if (gaugeStatus === "single") {
			return r !== LampToKey(score);
		}

		return true;
	};

	useEffect(() => {
		setLamp(LampToKey(score));
	}, [score]);

	return (
		<>
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
					<SelectNav
						id="BPI"
						value={lamp}
						setValue={setLamp}
						disabled={IsNullish(score.calculatedData.BPI)}
					>
						BPI
					</SelectNav>
				</Nav>
			</div>
			<div className="col-12">
				{lamp === "BPI" ? (
					<IIDXBPIChart chart={chart} score={score} />
				) : gaugeStatus === "gsm" ? (
					<GraphComponent type={lamp} values={score.scoreData.hitMeta.gsm![lamp]} />
				) : gaugeStatus === "single" ? (
					<GraphComponent type={lamp} values={score.scoreData.hitMeta.gaugeHistory!} />
				) : (
					<div
						className="d-flex align-items-center justify-content-center"
						style={{ height: "200px" }}
					>
						<span className="text-muted">No gauge data :(</span>
					</div>
				)}
			</div>
		</>
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

function LampToKey(
	score: ScoreDocument<"iidx:SP" | "iidx:DP"> | PBScoreDocument<"iidx:SP" | "iidx:DP">
): LampTypes {
	const lamp = score.scoreData.lamp;

	if (IsScore(score) && score.scoreMeta.gauge) {
		switch (score.scoreMeta.gauge) {
			case "EASY":
			case "NORMAL":
			case "HARD":
				return score.scoreMeta.gauge;
			case "ASSISTED EASY":
				return "EASY";
			case "EX-HARD":
				return "EX_HARD";
		}
	}

	if (lamp === "CLEAR") {
		return "NORMAL";
	} else if (lamp === "EASY CLEAR") {
		return "EASY";
	} else if (lamp === "HARD CLEAR") {
		return "HARD";
	} else if (lamp === "EX HARD CLEAR") {
		return "EX_HARD";
	} else if (lamp === "FULL COMBO") {
		// @hack - attempt to guess what gauge they used?
		if ((score.scoreData.hitMeta.gaugeHistory?.[0] ?? 0) > 22) {
			return "EX_HARD";
		}
		return "NORMAL";
	} else if (lamp === "NO PLAY") {
		// dan gauge looks like this
		return "HARD";
	}

	return "NORMAL";
}
