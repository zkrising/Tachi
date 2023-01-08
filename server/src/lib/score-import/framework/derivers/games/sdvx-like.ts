import { GetGrade } from "../common-utils";
import { SDVXLIKE_GBOUNDARIES } from "tachi-common";
import type { GPTDerivers } from "../types";
import type { GPTStrings } from "tachi-common";

type SDVXLikes = GPTStrings["sdvx" | "usc"];

export const SDVXLIKE_DERIVERS: GPTDerivers<SDVXLikes> = {
	grade: ({ score }) => GetGrade(SDVXLIKE_GBOUNDARIES, score),
};
