import { useProfileRatingAlg } from "components/util/useScoreRatingAlg";
import React from "react";
import { Link } from "react-router-dom";
import { IDStrings, integer, UGSRatingsLookup } from "tachi-common";
import { GamePT } from "types/react";
import { UppercaseFirst } from "util/misc";

export default function RankingData({
	rankingData,
	game,
	playtype,
}: {
	rankingData: Record<UGSRatingsLookup[IDStrings], { ranking: number; outOf: integer }>;
} & GamePT) {
	const alg = useProfileRatingAlg(game, playtype);

	const extendData = [];

	for (const k in rankingData) {
		const key = k as UGSRatingsLookup[IDStrings];

		if (key !== alg) {
			extendData.push(
				<div key={key} className="col-12">
					<small className="text-muted">
						{UppercaseFirst(key)}: #{rankingData[key].ranking}/{rankingData[key].outOf}
					</small>
				</div>
			);
		}
	}

	return (
		<div className="row text-center">
			<div className="col-12">
				<h4>Ranking{extendData.length ? ` (${UppercaseFirst(alg)})` : ""}</h4>
			</div>
			<div className="col-12">
				<Link
					to={`/dashboard/games/${game}/${playtype}/leaderboards`}
					className="gentle-link"
				>
					<strong className="display-4">#{rankingData[alg].ranking}</strong>
				</Link>
				<span className="text-muted">/{rankingData[alg].outOf}</span>
			</div>
			{extendData}
		</div>
	);
}

export function LazyRankingData({ ranking, outOf }: { ranking: integer; outOf: integer }) {
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
