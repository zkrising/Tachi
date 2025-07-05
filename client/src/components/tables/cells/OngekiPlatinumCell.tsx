import React from "react";
import { FmtStars, FmtStarsCompact, integer } from "tachi-common";

export function StarField({
	stars: stars,
	compact: compact,
}: {
	stars: integer;
	compact: boolean;
}) {
	if (stars < 6) {
		return <>{compact ? FmtStarsCompact(stars) : FmtStars(stars)}</>;
	}
	return (
		<span
			style={{
				background:
					"linear-gradient(30deg, #f0788a 5%, #f48fb1, #9174c2, #79bcf2, #70a173, #f7ff99, #faca7d, #ff9d80, #f0788a 85%)",
				color: "transparent",
				backgroundClip: "text",
			}}
		>
			★★★★★
		</span>
	);
}

export default function OngekiPlatinumCell({
	platinumScore: platinumScore,
	maxPlatScore: maxPlatScore,
	stars: stars,
}: {
	platinumScore: integer;
	maxPlatScore: integer;
	stars: number;
}) {
	const percentage = Math.round((platinumScore * 10000.0) / maxPlatScore) / 100.0;

	return (
		<td>
			<div className="d-flex flex-column">
				<strong>{percentage.toFixed(2)}%</strong>
				<StarField stars={stars} compact={false} />
				<small className="text-body-secondary">
					[{platinumScore}/{maxPlatScore}]
				</small>
			</div>
		</td>
	);
}
