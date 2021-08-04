import MiniTable from "components/tables/components/MiniTable";
import React from "react";
import { GetGamePTConfig, ScoreDocument } from "tachi-common";
import { GamePT } from "types/react";

export default function JudgementTable({
	game,
	playtype,
	judgements,
}: { judgements: ScoreDocument["scoreData"]["judgements"] } & GamePT) {
	const gptConfig = GetGamePTConfig(game, playtype);

	return (
		<MiniTable className="text-center table-sm" headers={["Judgements"]} colSpan={2}>
			{gptConfig.judgements.map(j => (
				<tr key={j}>
					<td>{j.toUpperCase()}</td>
					<td>{judgements[j] ?? "No Data."}</td>
				</tr>
			))}
		</MiniTable>
	);
}
