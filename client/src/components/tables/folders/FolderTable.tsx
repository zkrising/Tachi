import React from "react";
import { IDStrings, PublicUserDocument, ScoreCalculatedDataLookup } from "tachi-common";
import { GamePT } from "types/react";
import { FolderDataset } from "types/tables";
import BMSFolderTable from "./BMSFolderTable";
import GenericFolderTable from "./GenericFolderTable";
import IIDXFolderTable from "./IIDXFolderTable";
import MusecaFolderTable from "./MusecaFolderTable";
import SDVXFolderTable from "./SDVXFolderTable";

export default function FolderTable({
	dataset,
	indexCol = true,
	reqUser,
	playtype,
	showPlaycount,
	game,
	alg,
}: {
	dataset: FolderDataset;
	indexCol?: boolean;
	showPlaycount?: boolean;
	reqUser: PublicUserDocument;
	alg?: ScoreCalculatedDataLookup[IDStrings];
} & GamePT) {
	// We're just going to ignore all these errors
	// and assume we just won't make a mistake.
	// ever.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const props = { dataset, indexCol, reqUser, playtype, showPlaycount, alg, game } as any;

	if (game === "iidx") {
		return <IIDXFolderTable {...props} />;
	} else if (game === "bms") {
		return <BMSFolderTable {...props} />;
	} else if (game === "sdvx" || game === "usc") {
		return <SDVXFolderTable {...props} />;
	} else if (game === "maimai") {
		return <GenericFolderTable {...props} game={game} playtype={playtype} showScore={false} />;
	} else if (game === "museca") {
		return <MusecaFolderTable {...props} />;
	}

	return <GenericFolderTable {...props} />;
}
