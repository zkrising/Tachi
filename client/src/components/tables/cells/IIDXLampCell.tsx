import React from "react";
import { GetGamePTConfig, PBScoreDocument, ScoreDocument } from "tachi-common";
import { IsScore } from "util/asserts";
import { ChangeOpacity } from "util/color-opacity";

export default function IIDXLampCell({
	sc,
}: {
	sc: ScoreDocument<"iidx:SP" | "iidx:DP"> | PBScoreDocument<"iidx:SP" | "iidx:DP">;
}) {
	// doesn't matter, both have same colours
	const gptConfig = GetGamePTConfig("iidx", "SP");

	let gaugeText = null;

	if (sc.scoreData.hitMeta.gsm) {
		gaugeText = `EC: ${
			sc.scoreData.hitMeta.gsm.EASY[sc.scoreData.hitMeta.gsm.EASY.length - 1]
		}%, NC: ${sc.scoreData.hitMeta.gsm.NORMAL[sc.scoreData.hitMeta.gsm.NORMAL.length - 1]}%`;
	} else if (IsScore(sc)) {
		if (sc.scoreMeta.gauge === "EASY") {
			gaugeText = `EC: ${sc.scoreData.hitMeta.gauge}%`;
		} else if (sc.scoreMeta.gauge === "NORMAL") {
			gaugeText = `NC: ${sc.scoreData.hitMeta.gauge}%`;
		}
	}

	return (
		<td
			style={{
				backgroundColor: ChangeOpacity(gptConfig.lampColours[sc.scoreData.lamp], 0.2),
			}}
		>
			<strong>{sc.scoreData.lamp}</strong>
			<br />
			<small>
				[BP: {sc.scoreData.hitMeta.bp ?? "No Data"}
				{sc.scoreData.hitMeta.comboBreak
					? `, CBRK: ${sc.scoreData.hitMeta.comboBreak}`
					: ""}
				]
			</small>
			{sc.scoreData.lamp === "FAILED" && (
				<>
					<br />
					<small className="text-muted">{gaugeText}</small>
				</>
			)}
		</td>
	);
}
