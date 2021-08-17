import React from "react";
import { GamePT } from "types/react";
import { PBDataset } from "types/tables";
import { PublicUserDocument } from "tachi-common";
import IIDXPBTable from "./IIDXPBTable";
import BMSPBTable from "./BMSPBTable";
import SDVXPBTable from "./SDVXPBTable";

export default function PBTable({
	dataset,
	indexCol = true,
	reqUser,
	playtype,
	game,
}: {
	dataset: PBDataset;
	indexCol?: boolean;
	reqUser: PublicUserDocument;
} & GamePT) {
	// We're just going to ignore all these errors
	// and assume we just won't make a mistake.
	// ever.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const props = { dataset, indexCol, reqUser, playtype } as any;
	if (game === "iidx") {
		return <IIDXPBTable {...props} />;
	} else if (game === "bms") {
		return <BMSPBTable {...props} />;
	} else if (game === "sdvx") {
		return <SDVXPBTable {...props} />;
	}

	return <></>;
}
