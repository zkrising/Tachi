import { KtLogger } from "lib/logger/logger";
import { Game, IDStrings, integer, Playtype } from "tachi-common";
import { GameClasses } from "tachi-common/js/game-classes";

export type ScoreClasses = Partial<GameClasses<IDStrings>>;

export interface ClassHandler {
	(
		game: Game,
		playtype: Playtype,
		userID: integer,
		ratings: Record<string, number>,
		logger: KtLogger
	): Promise<ScoreClasses> | ScoreClasses | undefined;
}
