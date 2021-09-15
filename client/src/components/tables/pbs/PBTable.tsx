import React from "react";
import { IDStrings, PublicUserDocument, ScoreCalculatedDataLookup } from "tachi-common";
import { GamePT } from "types/react";
import { PBDataset } from "types/tables";
import BMSPBTable from "./BMSPBTable";
import GenericPBTable from "./GenericPBTable";
import IIDXPBTable from "./IIDXPBTable";
import MusecaPBTable from "./MusecaPBTable";
import SDVXPBTable from "./SDVXPBTable";

export default function PBTable({
	dataset,
	indexCol = true,
	reqUser,
	playtype,
	showPlaycount,
	game,
	alg,
}: {
	dataset: PBDataset;
	indexCol?: boolean;
	showPlaycount?: boolean;
	reqUser: PublicUserDocument;
	alg?: ScoreCalculatedDataLookup[IDStrings];
} & GamePT) {
	// We're just going to ignore all these errors
	// and assume we just won't make a mistake.
	// ever.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const props = { dataset, indexCol, reqUser, playtype, showPlaycount, alg } as any;

	if (game === "iidx") {
		return <IIDXPBTable {...props} />;
	} else if (game === "bms") {
		return <BMSPBTable {...props} />;
	} else if (game === "sdvx" || game === "usc") {
		return <SDVXPBTable {...props} />;
	} else if (game === "maimai") {
		return <GenericPBTable {...props} game={game} playtype={playtype} showScore={false} />;
	} else if (game === "museca") {
		return <MusecaPBTable {...props} />;
	}

	return <GenericPBTable {...props} game={game} playtype={playtype} />;
}
