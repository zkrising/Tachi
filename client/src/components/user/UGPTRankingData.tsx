import React from "react";

export default function RankingData({ ranking, outOf }: { ranking: number; outOf: number }) {
	return (
		<div className="row text-center">
			<div className="col-12">
				<h4>Ranking</h4>
			</div>
			<div className="col-12">
				<strong className="display-4">#{ranking}</strong>
				<span className="text-muted">/{outOf}</span>
			</div>
		</div>
	);
}
