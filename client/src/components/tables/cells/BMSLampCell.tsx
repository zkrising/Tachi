import Muted from "components/util/Muted";
import React from "react";
import { GetGamePTConfig, PBScoreDocument, ScoreDocument } from "tachi-common";
import { ChangeOpacity } from "util/color-opacity";
import { IsNotNullish } from "util/misc";

export default function BMSLampCell({
	score,
}: {
	score: ScoreDocument<"bms:7K" | "bms:14K"> | PBScoreDocument<"bms:7K" | "bms:14K">;
}) {
	const gptConfig = GetGamePTConfig(score.game, score.playtype);

	return (
		<td
			style={{
				backgroundColor: ChangeOpacity(gptConfig.lampColours[score.scoreData.lamp], 0.2),
			}}
		>
			<strong>{score.scoreData.lamp}</strong>
			{IsNotNullish(score.scoreData.hitMeta.bp) && (
				<>
					<br />
					<Muted>[bp: {score.scoreData.hitMeta.bp}]</Muted>
				</>
			)}
		</td>
	);
}
