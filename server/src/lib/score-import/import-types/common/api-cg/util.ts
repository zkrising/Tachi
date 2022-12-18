import type { CGSupportedGames } from "./types";
import type { Game } from "tachi-common";

export function CGGameToTachiGame(cgGame: CGSupportedGames): Game {
	switch (cgGame) {
		case "jb":
			return "jubeat";
		case "msc":
			return "museca";
		case "popn":
		case "sdvx":
			return cgGame;
	}
}
