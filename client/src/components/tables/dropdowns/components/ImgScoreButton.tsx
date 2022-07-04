import QuickTooltip from "components/layout/misc/QuickTooltip";
import ExternalLink from "components/util/ExternalLink";
import Icon from "components/util/Icon";
import React from "react";
import { Game, ScoreDocument } from "tachi-common";

const SUPPORTED_IMG_SCORES: Game[] = ["usc"];

export default function ImgScoreButton({ score }: { score: ScoreDocument }) {
	if (!SUPPORTED_IMG_SCORES.includes(score.game)) {
		return <></>;
	}

	return (
		<QuickTooltip tooltipContent="Get an image for this score!">
			<ExternalLink
				className="btn btn-outline-secondary"
				href={`${process.env.REACT_APP_IMGSCORE_URL}/scores/${score.scoreID}`}
			>
				<Icon noPad type="camera" />
			</ExternalLink>
		</QuickTooltip>
	);
}
