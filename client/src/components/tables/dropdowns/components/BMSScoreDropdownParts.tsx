import { IsScore } from "util/asserts";
import IIDXLampChart from "components/charts/IIDXLampChart";
import SelectNav from "components/util/SelectNav";
import React, { useEffect, useState } from "react";
import { Nav } from "react-bootstrap";
import { ChartDocument, PBScoreDocument, ScoreDocument } from "tachi-common";

type LampTypes = "NORMAL" | "EASY" | "HARD" | "EX_HARD";

export function BMSGraphsComponent({
	score,
}: {
	score: ScoreDocument<"bms:7K" | "bms:14K"> | PBScoreDocument<"bms:7K" | "bms:14K">;
	chart: ChartDocument<"bms:7K" | "bms:14K">;
}) {
	const gaugeHistory = score.scoreData.hitMeta.gaugeHistory;

	const [lamp, setLamp] = useState<LampTypes>(LampToKey(score));

	const shouldDisable = (r: LampTypes) => {
		if (gaugeHistory) {
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
						Groove
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
						id="HARD"
						value={lamp}
						setValue={setLamp}
						disabled={shouldDisable("EX_HARD")}
					>
						Hard
					</SelectNav>
				</Nav>
			</div>
			<div className="col-12">
				{gaugeHistory ? (
					<GraphComponent type={lamp} values={gaugeHistory} />
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
	score: ScoreDocument<"bms:7K" | "bms:14K"> | PBScoreDocument<"bms:7K" | "bms:14K">
): LampTypes {
	const lamp = score.scoreData.lamp;

	if (IsScore(score) && score.scoreMeta.gauge) {
		switch (score.scoreMeta.gauge) {
			case "EASY":
			case "NORMAL":
			case "HARD":
				return score.scoreMeta.gauge;
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
