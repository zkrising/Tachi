import { KtLogger } from "lib/logger/logger";
import { Game, IDStrings, integer, Playtypes } from "tachi-common";
import { GameClasses } from "tachi-common/js/game-classes";

export type ScoreClasses = Partial<GameClasses<IDStrings>>;

export interface ClassHandler {
	(
		game: Game,
		playtype: Playtypes[Game],
		userID: integer,
		ratings: Record<string, number>,
		logger: KtLogger
	): Promise<ScoreClasses> | ScoreClasses | undefined;
}
