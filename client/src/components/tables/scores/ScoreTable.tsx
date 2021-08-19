import React from "react";
import { GamePT } from "types/react";
import { ScoreDataset } from "types/tables";
import { PublicUserDocument, integer } from "tachi-common";
import IIDXScoreTable from "./IIDXScoreTable";
import BMSScoreTable from "./BMSScoreTable";
import SDVXScoreTable from "./SDVXScoreTable";

export default function ScoreTable({
	dataset,
	indexCol = true,
	reqUser,
	playtype,
	pageLen = 10,
	game,
}: {
	dataset: ScoreDataset;
	indexCol?: boolean;
	reqUser: PublicUserDocument;
	pageLen?: integer;
} & GamePT) {
	// We're just going to ignore all these errors
	// and assume we just won't make a mistake.
	// ever.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const props = { dataset, indexCol, reqUser, playtype, pageLen } as any;
	if (game === "iidx") {
		return <IIDXScoreTable {...props} />;
	} else if (game === "bms") {
		return <BMSScoreTable {...props} />;
	} else if (game === "sdvx") {
		return <SDVXScoreTable {...props} />;
	}

	return <></>;
}
