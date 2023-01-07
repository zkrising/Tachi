import type { KtLogger } from "lib/logger/logger";
import type { Game, GPTString, integer, Playtype } from "tachi-common";
import type { ClassRecords } from "tachi-common/game-classes";

export type ScoreClasses = Partial<ClassRecords<GPTString>>;

export type ClassHandler = (
	game: Game,
	playtype: Playtype,
	userID: integer,
	ratings: Record<string, number | null>,
	logger: KtLogger
) => Promise<ScoreClasses> | ScoreClasses | undefined;
