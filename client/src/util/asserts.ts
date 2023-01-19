import { TachiConfig } from "lib/config";
import {
	Game,
	GetGameConfig,
	GPTString,
	PBScoreDocument,
	Playtypes,
	ScoreDocument,
} from "tachi-common";

export function IsSupportedGame(str: string): str is Game {
	return TachiConfig.games.includes(str as unknown as Game);
}

export function IsSupportedPlaytype<G extends Game = Game>(
	game: G,
	str: string
): str is Playtypes[G] {
	const gameConfig = GetGameConfig(game);

	return gameConfig.playtypes.includes(str as unknown as Playtypes[G]);
}

export function IsScore<GPT extends GPTString>(
	pbOrScore: PBScoreDocument<GPT> | ScoreDocument<GPT>
): pbOrScore is ScoreDocument<GPT> {
	// @ts-expect-error thats the test...
	return !!pbOrScore.scoreMeta;
}
