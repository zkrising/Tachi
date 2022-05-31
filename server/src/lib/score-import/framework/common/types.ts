import type { IDStrings, Playtype, ScoreDocument } from "tachi-common";

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
