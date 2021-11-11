import ClassBadge from "components/game/ClassBadge";
import MiniTable from "components/tables/components/MiniTable";
import React from "react";
import { GetGamePTConfig, IDStrings, ScoreCalculatedDataLookup, UserGameStats } from "tachi-common";
import { GameClassSets } from "tachi-common/js/game-classes";
import { FormatGPTRating, UppercaseFirst } from "util/misc";

export default function UGPTRatingsTable({ ugs }: { ugs: UserGameStats }) {
	const gptConfig = GetGamePTConfig(ugs.game, ugs.playtype);

	return (
		<MiniTable className="table-sm text-center" headers={["Player Stats"]} colSpan={2}>
			<>
				{(Object.keys(gptConfig.classHumanisedFormat) as GameClassSets[IDStrings][]).map(
					k => (
						<tr key={k}>
							<td>{UppercaseFirst(k)}</td>
							<td>
								{ugs.classes[k] ? (
									<ClassBadge
										showSetOnHover={false}
										key={`${k}:${ugs.classes[k]}`}
										game={ugs.game}
										playtype={ugs.playtype}
										classSet={k}
										classValue={ugs.classes[k]!}
									/>
								) : (
									"No Data"
								)}
							</td>
						</tr>
					)
				)}
				{Object.entries(ugs.ratings).map(([k, v]) => (
					<tr key={k}>
						<td>{UppercaseFirst(k)}</td>
						<td>
							{FormatGPTRating(
								ugs.game,
								ugs.playtype,
								k as ScoreCalculatedDataLookup[IDStrings],
								v
							)}
						</td>
					</tr>
				))}
			</>
		</MiniTable>
	);
}
