import type { MytGame } from "./types";
import type { Game } from "tachi-common";

export function GameToMytGame(game: Game): MytGame | undefined {
	switch (game) {
		case "wacca":
			return "wacca";
		case "chunithm":
			return "chunithm";
		case "maimaidx":
			return "maimai";
		default:
			return undefined;
	}
}
