import { TachiConfig } from "lib/config";
import { Game, GetGameConfig, Playtypes } from "tachi-common";

export function IsSupportedGame(str: string): str is Game {
	return TachiConfig.supportedGames.includes((str as unknown) as Game);
}

export function IsSupportedPlaytype<G extends Game = Game>(
	game: G,
	str: string
): str is Playtypes[G] {
	const gameConfig = GetGameConfig(game);

	return gameConfig.validPlaytypes.includes((str as unknown) as Playtypes[G]);
}
