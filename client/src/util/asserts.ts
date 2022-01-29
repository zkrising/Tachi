import { TachiConfig } from "lib/config";
import {
	Game,
	GetGameConfig,
	IDStrings,
	PBScoreDocument,
	Playtypes,
	ScoreDocument,
} from "tachi-common";

export function IsSupportedGame(str: string): str is Game {
	return TachiConfig.games.includes((str as unknown) as Game);
}

export function IsSupportedPlaytype<G extends Game = Game>(
	game: G,
	str: string
): str is Playtypes[G] {
	const gameConfig = GetGameConfig(game);

	return gameConfig.validPlaytypes.includes((str as unknown) as Playtypes[G]);
}

export function IsScore<I extends IDStrings>(
	pbOrScore: PBScoreDocument<I> | ScoreDocument<I>
): pbOrScore is ScoreDocument<I> {
	// @ts-expect-error thats the test...
	return !!pbOrScore.scoreMeta;
}
