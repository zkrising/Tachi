import { IsScore } from "util/asserts";
import IIDXLampChart from "components/charts/IIDXLampChart";
import SelectNav from "components/util/SelectNav";
import React, { useEffect, useState } from "react";
import { Nav } from "react-bootstrap";
import { PBScoreDocument, ScoreDocument } from "tachi-common";

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

type LampTypes = "DAN_GAUGE" | "Normal" | "Easy" | "Hard" | "EXHard";

export function IIDXGraphsComponent({
	score,
}: {
	score: ScoreDocument<"iidx:SP" | "iidx:DP"> | PBScoreDocument<"iidx:SP" | "iidx:DP">;
}) {
	const [lamp, setLamp] = useState<LampTypes>(LampToKey(score));

	let gaugeStatus: "none" | "single" | "gsm" = "none";

	if (
		score.scoreData.optional.gsmEXHard &&
		score.scoreData.optional.gsmHard &&
		score.scoreData.optional.gsmNormal &&
		score.scoreData.optional.gsmEasy
	) {
		gaugeStatus = "gsm";
	} else if (score.scoreData.optional.gaugeHistory) {
		gaugeStatus = "single";
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
					{score.scoreData.lamp === "NO PLAY" && (
						<SelectNav
							id="DAN_GAUGE"
							value={lamp}
							setValue={setLamp}
							disabled={shouldDisable("DAN_GAUGE")}
						>
							Dan Gauge
						</SelectNav>
					)}
					<SelectNav
						id="Easy"
						value={lamp}
						setValue={setLamp}
						disabled={shouldDisable("Easy")}
					>
						Easy
					</SelectNav>
					<SelectNav
						id="Normal"
						value={lamp}
						setValue={setLamp}
						disabled={shouldDisable("Normal")}
					>
						Normal
					</SelectNav>
					<SelectNav
						id="Hard"
						value={lamp}
						setValue={setLamp}
						disabled={shouldDisable("Hard")}
					>
						Hard
					</SelectNav>
					<SelectNav
						id="EXHard"
						value={lamp}
						setValue={setLamp}
						disabled={shouldDisable("EXHard")}
					>
						Ex Hard
					</SelectNav>
				</Nav>
			</div>
			<div className="col-12">
				{gaugeStatus === "gsm" && lamp !== "DAN_GAUGE" ? (
					<GraphComponent type={lamp} values={score.scoreData.optional[`gsm${lamp}`]!} />
				) : gaugeStatus === "single" ? (
					<GraphComponent type={lamp} values={score.scoreData.optional.gaugeHistory!} />
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

	if (lamp === "NO PLAY") {
		return "DAN_GAUGE";
	}

	if (IsScore(score) && score.scoreMeta.gauge) {
		switch (score.scoreMeta.gauge) {
			case "EASY":
				return "Easy";
			case "NORMAL":
				return "Normal";
			case "HARD":
				return "Hard";
			case "ASSISTED EASY":
				return "Easy";
			case "EX-HARD":
				return "EXHard";
		}
	}

	if (lamp === "CLEAR") {
		return "Normal";
	} else if (lamp === "EASY CLEAR") {
		return "Easy";
	} else if (lamp === "HARD CLEAR") {
		return "Hard";
	} else if (lamp === "EX HARD CLEAR") {
		return "EXHard";
	} else if (lamp === "FULL COMBO") {
		// @hack - attempt to guess what gauge they used?
		// this could be hard or easy, we actually legitimately do not know in this scenario
		if ((score.scoreData.optional.gaugeHistory?.[0] ?? 0) > 22) {
			return "EXHard";
		}
		return "Normal";
	}

	return "Normal";
}
