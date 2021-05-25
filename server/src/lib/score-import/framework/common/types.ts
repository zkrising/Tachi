import { IDStrings, ScoreDocument, Playtypes, Game } from "kamaitachi-common";

/**
 * An intermediate score format that will be filled out by
 * HydrateScore.
 */
export type DryScore<I extends IDStrings = IDStrings> = Pick<
    ScoreDocument<I>,
    "service" | "game" | "scoreMeta" | "timeAchieved" | "comment" | "importType"
> & {
    scoreData: Omit<ScoreDocument<I>["scoreData"], "gradeIndex" | "lampIndex" | "esd">;
};

export type ScorePlaytypeMap = Partial<Record<Playtypes[Game], ScoreDocument[]>>;
