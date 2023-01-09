import { GetGrade } from "./_common";
import { MAIMAIDX_GBOUNDARIES } from "tachi-common";
import type { GPTServerImplementation } from "game-implementations/types";

export const MAIMAIDX_IMPL: GPTServerImplementation<"maimaidx:Single"> = {
	validators: {},
	derivers: {
		grade: ({ percent }) => GetGrade(MAIMAIDX_GBOUNDARIES, percent),
	},
};
