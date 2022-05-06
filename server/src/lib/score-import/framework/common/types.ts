import { Game } from "tachi-common";
import type { IDStrings, ScoreDocument, Playtype } from "tachi-common";

/**
 * An intermediate score format that will be filled out by
 * HydrateScore.
 */
export type DryScore<I extends IDStrings = IDStrings> = Pick<
	ScoreDocument<I>,
	"comment" | "game" | "importType" | "scoreMeta" | "service" | "timeAchieved"
> & {
	scoreData: Omit<ScoreDocument<I>["scoreData"], "esd" | "gradeIndex" | "lampIndex">;
};

export type ScorePlaytypeMap = Partial<Record<Playtype, Array<ScoreDocument>>>;
