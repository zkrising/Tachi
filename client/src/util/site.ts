import { TachiConfig } from "lib/config";
import { GetGameConfig } from "tachi-common";

export function GetSortedGPTs() {
	const arr = [];
	for (const game of TachiConfig.games) {
		const gameConfig = GetGameConfig(game);
		for (const playtype of gameConfig.playtypes) {
			arr.push({ game, playtype });
		}
	}

	return arr;
}
