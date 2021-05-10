import { Difficulties, Game, Playtypes } from "kamaitachi-common";

export type BatchManualScore = MatchType & {
    score: number;
    lamp: string;
    timeAchieved?: number;
    hitData?: Record<string, unknown>;
    hitMeta?: Record<string, unknown>;
};

interface TitleMatchType {
    matchType: "title";
    identifier: string;
    playtype: Playtypes[Game];
    difficulty: string; // lazy...
}

interface OtherMatchTypes {
    matchType: "hash" | "songID" | "songHash";
    identifier: string;
}

type MatchType = TitleMatchType | OtherMatchTypes;

export interface BatchManual {
    head: {
        service: string;
        game: Game;
    };
    body: BatchManualScore[];
}
