import type { MytGame } from "./types";
import type { Game } from "tachi-common";

export function GameToMytGame(game: Game): MytGame | undefined {
	switch (game) {
		case "chunithm":
			return "chunithm";
		case "maimaidx":
			return "maimai";
		case "ongeki":
			return "ongeki";
		case "wacca":
			return "wacca";
		default:
			return undefined;
	}
}
