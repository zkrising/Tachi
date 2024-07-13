import React from "react";
import { PBScoreDocument, ScoreDocument } from "tachi-common";

export default function WACCARatingCell({ score }: { score: ScoreDocument | PBScoreDocument }) {
	let color: undefined | string = undefined;

	const rating = score.calculatedData.rate;

	if (rating === null || rating === undefined) {
		color = undefined;
	} else if (rating >= 50) {
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
					<strong>{score.calculatedData.rate ?? "N/A"}</strong>
				</div>
			</td>
		);
	} else if (rating >= 44) {
		color = "var(--bs-warning)";
	} else if (rating >= 38) {
		color = "silver";
	} else if (rating >= 32) {
		color = "var(--bs-info)";
	} else if (rating >= 26) {
		color = "purple";
	} else if (rating >= 20) {
		color = "red";
	} else if (rating >= 12) {
		color = "orange";
	} else if (rating >= 6) {
		color = "darkblue";
	} else if (rating >= 0) {
		color = "var(--bs-secondary)";
	}

	return (
		<td
			style={{
				color,
				outline: "white",
			}}
		>
			<strong>{score.calculatedData.rate ?? "N/A"}</strong>
		</td>
	);
}
