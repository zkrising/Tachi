import { GetGrade } from "./_common";
import { p } from "prudence";
import { JUBEAT_GBOUNDARIES } from "tachi-common";
import type { GPTServerImplementation } from "game-implementations/types";

export const JUBEAT_IMPL: GPTServerImplementation<"jubeat:Single"> = {
	validators: {
		musicRate: (rate, chart) => {
			switch (chart.difficulty) {
				case "BSC":
				case "ADV":
				case "EXT":
					return p.isBetween(0, 100)(rate);

				case "HARD BSC":
				case "HARD ADV":
				case "HARD EXT":
					return p.isBetween(0, 120)(rate);
			}
		},
	},
	derivers: {
		grade: ({ score }) => GetGrade(JUBEAT_GBOUNDARIES, score),
	},
};
