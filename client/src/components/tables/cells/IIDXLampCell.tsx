import { IsScore } from "util/asserts";
import { ChangeOpacity } from "util/color-opacity";
import { IsNotNullish } from "util/misc";
import { GetEnumColour } from "lib/game-implementations";
import React from "react";
import { ChartDocument, PBScoreDocument, ScoreDocument } from "tachi-common";

export default function IIDXLampCell({
	sc,
	chart,
}: {
	sc: ScoreDocument<"iidx:SP" | "iidx:DP"> | PBScoreDocument<"iidx:SP" | "iidx:DP">;
	chart: ChartDocument<"iidx:SP" | "iidx:DP">;
}) {
	let gaugeText = null;

	if (
		sc.scoreData.optional.gsmEXHard &&
		sc.scoreData.optional.gsmHard &&
		sc.scoreData.optional.gsmNormal &&
		sc.scoreData.optional.gsmEasy
	) {
		gaugeText = `EC: ${
			sc.scoreData.optional.gsmEasy[sc.scoreData.optional.gsmEasy.length - 1]
		}%, NC: ${sc.scoreData.optional.gsmNormal[sc.scoreData.optional.gsmNormal.length - 1]}%`;
	} else if (IsScore(sc)) {
		if (sc.scoreMeta.gauge === "EASY") {
			gaugeText = `EC: ${sc.scoreData.optional.gauge}%`;
		} else if (sc.scoreMeta.gauge === "NORMAL") {
			gaugeText = `NC: ${sc.scoreData.optional.gauge}%`;
		}
	}

	let bpText;

	if (IsNotNullish(sc.scoreData.optional.bp)) {
		bpText = `[BP: ${sc.scoreData.optional.bp}]`;
	}

	let cbrkCount;
	let cbrkText;

	if (sc.scoreData.optional.comboBreak) {
		cbrkCount = sc.scoreData.optional.comboBreak;
	} else if (
		IsNotNullish(sc.scoreData.judgements.pgreat) &&
		IsNotNullish(sc.scoreData.judgements.great) &&
		IsNotNullish(sc.scoreData.judgements.good)
	) {
		cbrkCount =
			chart.data.notecount -
			sc.scoreData.judgements.pgreat! -
			sc.scoreData.judgements.great! -
			sc.scoreData.judgements.good!;
	}

	if (IsNotNullish(cbrkCount) && cbrkCount !== 0) {
		cbrkText = `[CB: ${cbrkCount}]`;
	}

	return (
		<td
			style={{
				backgroundColor: ChangeOpacity(GetEnumColour(sc, "lamp"), 0.2),
				whiteSpace: "nowrap",
			}}
		>
			<strong>{sc.scoreData.lamp}</strong>

			{bpText && (
				<>
					<br />
					<small>{bpText}</small>
				</>
			)}

			{cbrkText && (
				<>
					<br />
					<small>{cbrkText}</small>
				</>
			)}

			{sc.scoreData.lamp === "FAILED" && (
				<>
					<br />
					<small className="text-body-secondary">{gaugeText}</small>
				</>
			)}
		</td>
	);
}
