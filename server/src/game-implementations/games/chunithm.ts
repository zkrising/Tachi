import { GetGrade } from "./_common";
import { CHUNITHM_GBOUNDARIES } from "tachi-common";
import type { GPTServerImplementation } from "game-implementations/types";

export const CHUNITHM_IMPL: GPTServerImplementation<"chunithm:Single"> = {
	validators: {},
	derivers: {
		grade: ({ score }) => GetGrade(CHUNITHM_GBOUNDARIES, score),
	},
};
