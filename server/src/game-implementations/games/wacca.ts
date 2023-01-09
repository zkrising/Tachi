import { GetGrade } from "./_common";
import { WACCA_GBOUNDARIES } from "tachi-common";
import type { GPTServerImplementation } from "game-implementations/types";

export const WACCA_IMPL: GPTServerImplementation<"wacca:Single"> = {
	validators: {},
	derivers: {
		grade: ({ score }) => GetGrade(WACCA_GBOUNDARIES, score),
	},
};
