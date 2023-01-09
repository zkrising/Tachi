import { GetGrade } from "./_common";
import { MUSECA_GBOUNDARIES } from "tachi-common";
import type { GPTServerImplementation } from "game-implementations/types";

export const MUSECA_IMPL: GPTServerImplementation<"museca:Single"> = {
	validators: {},
	derivers: {
		grade: ({ score }) => GetGrade(MUSECA_GBOUNDARIES, score),
	},
};
