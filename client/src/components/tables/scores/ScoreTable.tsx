import React from "react";
import { integer } from "tachi-common";
import { GamePT } from "types/react";
import { ScoreDataset } from "types/tables";
import BMSScoreTable from "./BMSScoreTable";
import GenericScoreTable from "./GenericScoreTable";
import IIDXScoreTable from "./IIDXScoreTable";
import MusecaScoreTable from "./MusecaScoreTable";
import SDVXLikeScoreTable from "./SDVXLikeScoreTable";

export default function ScoreTable({
	dataset,
	indexCol = true,
	userCol = false,
	playtype,
	pageLen = 10,
	game,
}: {
	dataset: ScoreDataset;
	indexCol?: boolean;
	userCol?: boolean;
	pageLen?: integer;
} & GamePT) {
	// We're just going to ignore all these errors
	// and assume we just won't make a mistake.
	// ever.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const props = { dataset, indexCol, playtype, pageLen, userCol, game } as any;
	if (game === "iidx") {
		return <IIDXScoreTable {...props} />;
	} else if (game === "bms") {
		return <BMSScoreTable {...props} />;
	} else if (game === "sdvx" || game === "usc") {
		return <SDVXLikeScoreTable {...props} />;
	} else if (game === "maimai") {
		return <GenericScoreTable {...props} game={game} playtype={playtype} showScore={false} />;
	} else if (game === "museca") {
		return <MusecaScoreTable {...props} />;
	}

	return <GenericScoreTable {...props} game={game} playtype={playtype} />;
}
