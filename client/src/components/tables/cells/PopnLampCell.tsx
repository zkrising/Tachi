import { ToCDNURL } from "util/api";
import { ChangeOpacity } from "util/color-opacity";
import React from "react";
import { GetGamePTConfig, PBScoreDocument, ScoreDocument } from "tachi-common";

export default function PopnLampCell({
	score,
}: {
	score: ScoreDocument<"popn:9B"> | PBScoreDocument<"popn:9B">;
}) {
	const gptConfig = GetGamePTConfig(score.game, score.playtype);

	return (
		<td
			style={{
				backgroundColor: ChangeOpacity(gptConfig.lampColours[score.scoreData.lamp], 0.2),
			}}
		>
			<strong>{score.scoreData.lamp}</strong>
			<br />
			{score.scoreData.hitMeta.specificClearType && (
				<img
					style={{
						maxWidth: "32px",
					}}
					src={ToCDNURL(`/misc/popn/${score.scoreData.hitMeta.specificClearType}.png`)}
				/>
			)}
		</td>
	);
}
