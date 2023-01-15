import { ChangeOpacity } from "util/color-opacity";
import MiniTable from "components/tables/components/MiniTable";
import React from "react";
import { COLOUR_SET, GetGamePTConfig, PBScoreDocument, ScoreDocument } from "tachi-common";
import { GamePT } from "types/react";

export default function JudgementTable({ score }: { score: ScoreDocument | PBScoreDocument }) {
	const gptConfig = GetGamePTConfig(score.game, score.playtype);

	return (
		<MiniTable className="text-center table-sm" headers={["Judgements"]} colSpan={2}>
			{gptConfig.orderedJudgements.map((j) => (
				<tr key={j}>
					<td>{j.toUpperCase()}</td>
					{/* @ts-expect-error fine access */}
					<td>{score.scoreData.judgements[j] ?? "No Data."}</td>
				</tr>
			))}
			<tr>
				<td style={{ backgroundColor: ChangeOpacity(COLOUR_SET.red, 0.2) }}>
					{/* @ts-expect-error it might exist */}
					Slow: {score.scoreData.optional.slow ?? "Unknown"}
				</td>
				<td style={{ backgroundColor: ChangeOpacity(COLOUR_SET.paleBlue, 0.2) }}>
					{/* @ts-expect-error it might exist */}
					Fast: {score.scoreData.optional.fast ?? "Unknown"}
				</td>
			</tr>
		</MiniTable>
	);
}
