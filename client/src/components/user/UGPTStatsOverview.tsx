import {
	FormatGPTProfileRating,
	FormatGPTProfileRatingName,
	FormatGPTScoreRatingName,
	UppercaseFirst,
} from "util/misc";
import { StrSOV } from "util/sorts";
import ClassBadge from "components/game/ClassBadge";
import QuickTooltip from "components/layout/misc/QuickTooltip";
import MiniTable from "components/tables/components/MiniTable";
import Divider from "components/util/Divider";
import React from "react";
import {
	GetGamePTConfig,
	GPTString,
	ProfileRatingAlgorithms,
	UserGameStats,
	Classes,
} from "tachi-common";

export default function UGPTRatingsTable({ ugs }: { ugs: UserGameStats }) {
	const gptConfig = GetGamePTConfig(ugs.game, ugs.playtype);

	const ratings = Object.entries(ugs.ratings) as [ProfileRatingAlgorithms[GPTString], number][];

	return (
		<MiniTable className="table-sm text-center" headers={["Player Stats"]} colSpan={2}>
			<>
				{(Object.keys(gptConfig.classes) as Classes[GPTString][])
					.sort(StrSOV((x) => x[0]))
					.filter((k) => ugs.classes[k] !== undefined)
					.map((k) => (
						<tr key={k}>
							<td>{UppercaseFirst(k)}</td>
							<td>
								<ClassBadge
									showSetOnHover={false}
									key={`${k}:${ugs.classes[k]}`}
									game={ugs.game}
									playtype={ugs.playtype}
									classSet={k}
									classValue={ugs.classes[k]!}
								/>
							</td>
						</tr>
					))}
				{ratings.map(([k, v]) => (
					<tr key={k}>
						<td>
							<QuickTooltip
								tooltipContent={
									<div>
										{gptConfig.profileRatingAlgs[k].description}
										{k in gptConfig.scoreRatingAlgs && (
											<>
												<Divider />(
												{FormatGPTScoreRatingName(
													ugs.game,
													ugs.playtype,
													k
												)}
												: {gptConfig.scoreRatingAlgs[k].description})
											</>
										)}
									</div>
								}
								wide
							>
								<div
									style={{
										textDecoration: "underline",
										textDecorationStyle: "dotted",
									}}
								>
									{FormatGPTProfileRatingName(ugs.game, ugs.playtype, k)}
								</div>
							</QuickTooltip>
						</td>
						<td>{FormatGPTProfileRating(ugs.game, ugs.playtype, k as any, v)}</td>
					</tr>
				))}
			</>
		</MiniTable>
	);
}
