import { GetGrade } from "./_common";
import { GITADORA_GBOUNDARIES } from "tachi-common";
import type { GPTServerImplementation } from "game-implementations/types";

export const GITADORA_GITA_IMPL: GPTServerImplementation<"gitadora:Gita"> = {
	validators: {},
	derivers: {
		grade: ({ percent }) => GetGrade(GITADORA_GBOUNDARIES, percent),
	},
};

export const GITADORA_DORA_IMPL: GPTServerImplementation<"gitadora:Dora"> = {
	validators: {},
	derivers: {
		grade: ({ percent }) => GetGrade(GITADORA_GBOUNDARIES, percent),
	},
};
