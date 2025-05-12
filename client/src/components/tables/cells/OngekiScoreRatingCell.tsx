import { FormatMillions, FormatScoreRating } from "util/misc";
import { ChangeOpacity } from "util/color-opacity";
import React from "react";
import { PBScoreDocument, ScoreDocument } from "tachi-common";
import QuickTooltip from "components/layout/misc/QuickTooltip";
import { GPT_CLIENT_IMPLEMENTATIONS } from "lib/game-implementations";
import MiniTable from "../components/MiniTable";
import LampCell from "./LampCell";

export default function OngekiScoreRatingCell({
	score,
}: {
	score: ScoreDocument<"ongeki:Single"> | PBScoreDocument<"ongeki:Single">;
}) {
	const ratingValue = score.calculatedData.scoreRating ?? 0;
	const noteLamp = score.scoreData.noteLamp;
	const bellLamp = score.scoreData.bellLamp;
	const grade = score.scoreData.grade;

	const gradeColor = ChangeOpacity(
		GPT_CLIENT_IMPLEMENTATIONS["ongeki:Single"].enumColours.grade[score.scoreData.grade],
		0.2
	);

	const gradeRating = grade === "SSS+" ? 0.3 : grade === "SSS" ? 0.2 : grade === "SS" ? 0.1 : 0;
	const noteRating =
		noteLamp === "ALL BREAK+"
			? 0.35
			: noteLamp === "ALL BREAK"
			? 0.3
			: noteLamp === "FULL COMBO"
			? 0.1
			: 0;
	const bellRating = bellLamp === "FULL BELL" ? 0.05 : 0;
	const techRating = ratingValue - gradeRating - noteRating - bellRating;

	return (
		<>
			<QuickTooltip
				wide
				tooltipContent={
					<>
						<MiniTable headers={["Result", "Rating"]}>
							<tr>
								<td
									style={{
										backgroundColor: gradeColor,
									}}
								>
									{FormatMillions(score.scoreData.score)}
								</td>
								<td>{techRating.toFixed(3)}</td>
							</tr>
							<tr>
								<td
									style={{
										backgroundColor: gradeColor,
									}}
								>
									<strong>{score.scoreData.grade}</strong>
								</td>
								<td>{gradeRating.toFixed(3)}</td>
							</tr>
							<tr>
								<LampCell
									lamp={noteLamp}
									colour={
										GPT_CLIENT_IMPLEMENTATIONS["ongeki:Single"].enumColours
											.noteLamp[noteLamp]
									}
								/>
								<td>{noteRating.toFixed(3)}</td>
							</tr>
							<tr>
								<LampCell
									lamp={bellLamp}
									colour={
										GPT_CLIENT_IMPLEMENTATIONS["ongeki:Single"].enumColours
											.bellLamp[bellLamp]
									}
								/>
								<td>{bellRating.toFixed(3)}</td>
							</tr>
						</MiniTable>
					</>
				}
			>
				<td>
					<div className="underline-on-hover">
						{FormatScoreRating(score.game, score.playtype, "scoreRating", ratingValue)}
					</div>
				</td>
			</QuickTooltip>
		</>
	);
}
