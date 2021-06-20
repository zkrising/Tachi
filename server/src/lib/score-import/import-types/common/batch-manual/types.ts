import { Game, Playtypes, Lamps, IDStrings } from "tachi-common";

export type BatchManualScore = {
	score: number;
	lamp: Lamps[IDStrings];
	timeAchieved?: number | null;
	comment?: string | null;
	judgements?: Record<string, unknown> | null;
	hitMeta?: Record<string, unknown> | null;
	identifier: string;
	matchType:
		| "songTitle"
		| "ddrSongHash"
		| "kamaitachiSongID"
		| "bmsChartHash"
		| "title" // title is legacy - use songTitle
		| "songHash" // songHash is legacy - use ddrSongHash
		| "songID" // songID is legacy - use kamaitachiSongID
		| "hash"; // hash is legacy - use bmsChartHash

	difficulty?: string | null; // lazy...
};

export interface BatchManual {
	head: {
		service: string;
		game: Game;
		version?: string | null;
	};
	body: BatchManualScore[];
}

export interface BatchManualContext {
	game: Game;
	playtype: Playtypes[Game];
	service: string;
	version: string | null;
}
