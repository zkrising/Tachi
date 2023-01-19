import { GPT_SERVER_IMPLEMENTATIONS } from "game-implementations/game-implementations";
import { GetGPTString } from "tachi-common";
import type { Game, Playtype, ScoreDocument } from "tachi-common";

/**
 * Create calculated data for a session of this game and playtype.
 * @param scores - All of the scores in this session.
 */
export function CreateSessionCalcData(
	game: Game,
	playtype: Playtype,
	scores: Array<ScoreDocument>
) {
	const scoreCalculatedData = scores.map((e) => e.calculatedData);

	const gptString = GetGPTString(game, playtype);

	const sessionCalcData: Record<string, number | null> = {};

	for (const [key, fn] of Object.entries(GPT_SERVER_IMPLEMENTATIONS[gptString].sessionCalcs)) {
		sessionCalcData[key] = fn(scoreCalculatedData);
	}

	return sessionCalcData;
}
