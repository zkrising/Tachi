import { ChangeOpacity } from "util/color-opacity";
import MiniTable from "components/tables/components/MiniTable";
import React from "react";
import { COLOUR_SET, GetGamePTConfig, PBScoreDocument, ScoreDocument } from "tachi-common";
import { GamePT } from "types/react";

export default function JudgementTable({ score }: { score: ScoreDocument | PBScoreDocument }) {
	const gptConfig = GetGamePTConfig(score.game, score.playtype);

	return (
		<MiniTable className="text-center table-sm" headers={["Judgements"]} colSpan={2}>
			{gptConfig.judgements.map(j => (
				<tr key={j}>
					<td>{j.toUpperCase()}</td>
					<td>{score.scoreData.judgements[j] ?? "No Data."}</td>
				</tr>
			))}
			<tr>
				<td style={{ backgroundColor: ChangeOpacity(COLOUR_SET.red, 0.2) }}>
					Slow: {score.scoreData.hitMeta.slow ?? "Unknown"}
				</td>
				<td style={{ backgroundColor: ChangeOpacity(COLOUR_SET.paleBlue, 0.2) }}>
					Fast: {score.scoreData.hitMeta.fast ?? "Unknown"}
				</td>
			</tr>
		</MiniTable>
	);
}
