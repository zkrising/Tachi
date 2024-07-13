import React from "react";
import { PBScoreDocument, ScoreDocument } from "tachi-common";

export default function MaimaiDXRatingCell({ score }: { score: ScoreDocument | PBScoreDocument }) {
	let color: undefined | string = undefined;

	const rating = score.calculatedData.rate;

	if (rating === null || rating === undefined) {
		color = undefined;
	} else if (rating >= 300) {
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
	} else if (rating >= 290) {
		color = "lightgoldenrodyellow";
	} else if (rating >= 280) {
		color = "var(--bs-warning)";
	} else if (rating >= 260) {
		color = "gray";
	} else if (rating >= 240) {
		color = "brown";
	} else if (rating >= 200) {
		color = "purple";
	} else if (rating >= 140) {
		color = "red";
	} else if (rating >= 80) {
		color = "yellow";
	} else if (rating >= 40) {
		color = "green";
	} else if (rating >= 20) {
		color = "blue";
	} else if (rating >= 0) {
		color = undefined;
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
