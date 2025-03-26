import React from "react";
import { FmtStars, integer } from "tachi-common";

export default function OngekiPlatinumCell({
	platinumScore: platinumScore,
	maxPlatScore: maxPlatScore,
	stars: stars,
}: {
	platinumScore: integer | null | undefined;
	maxPlatScore: integer;
	stars: number;
}) {
	if (platinumScore === null || platinumScore === undefined) {
		return (
			<td>
				Unknown
				<br />
				☆☆☆☆☆
			</td>
		);
	}

	const percentage = Math.round((platinumScore * 10000.0) / maxPlatScore) / 100.0;

	return (
		<td>
			<strong>{percentage.toFixed(2)}%</strong>
			<br />
			<>
				{stars < 6 ? (
					FmtStars(true)(stars)
				) : (
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
				)}
			</>
			<br />
			<small className="text-body-secondary">
				[{platinumScore}/{maxPlatScore}]
			</small>
		</td>
	);
}
