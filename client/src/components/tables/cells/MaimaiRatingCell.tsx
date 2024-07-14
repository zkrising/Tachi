import React from "react";
import { PBScoreDocument, ScoreDocument } from "tachi-common";

export default function MaimaiRatingCell({ score }: { score: ScoreDocument | PBScoreDocument }) {
	let color: undefined | string = undefined;

	const rating = score.calculatedData.rate;

	if (rating === null || rating === undefined) {
		color = undefined;
	} else if (rating >= 15.0) {
		color =
			"linear-gradient(-45deg, #f0788a, #f48fb1, #9174c2, #79bcf2, #70a173, #f7ff99, #faca7d, #ff9d80, #f0788a)";
		return (
			<td>
				<div
					style={{
						background: color,
						backgroundClip: "text",
						outline: "white",
						WebkitTextFillColor: "transparent",
					}}
				>
					<strong>{score.calculatedData.rate?.toFixed(2) ?? "N/A"}</strong>
				</div>
			</td>
		);
	} else if (rating >= 14.5) {
		color = "var(--bs-warning)";
	} else if (rating >= 14.0) {
		color = "gray";
	} else if (rating >= 13.0) {
		color = "brown";
	} else if (rating >= 12.0) {
		color = "purple";
	} else if (rating >= 10.0) {
		color = "red";
	} else if (rating >= 7.0) {
		color = "yellow";
	} else if (rating >= 4.0) {
		color = "green";
	} else if (rating >= 2.0) {
		color = "cyan";
	} else if (rating >= 0.0) {
		// undefining so the rating text isn't permanently white on light mode
		color = undefined;
	}

	return (
		<td
			style={{
				color,
				outline: "white",
			}}
		>
			<strong>{score.calculatedData.rate?.toFixed(2) ?? "N/A"}</strong>
		</td>
	);
}
