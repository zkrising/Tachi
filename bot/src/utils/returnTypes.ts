import type {
	APIPermissions,
	ChartDocument,
	GPTString,
	ImportDocument,
	integer,
	ProfileRatingAlgorithms,
	ScoreDocument,
	SongDocument,
	UserGameStats,
} from "tachi-common";

export interface ServerStatus {
	serverTime: number;
	startTime: number;
	version: string;
	whoami: integer | null;
	permissions: Array<APIPermissions>;
}

export interface ImportDeferred {
	url: string;
	importID: string;
}

export type ImportPollStatus =
	| {
			importStatus: "completed";
			import: ImportDocument;
	  }
	| {
			importStatus: "ongoing";
			progress: {
				description: string;
				value: integer;
			};
	  };

export interface UGPTStats<GPT extends GPTString = GPTString> {
	gameStats: UserGameStats;
	firstScore: ScoreDocument;
	mostRecentScore: ScoreDocument;
	totalScores: integer;
	rankingData: Record<ProfileRatingAlgorithms[GPT], { ranking: integer; outOf: integer }>;
}

export interface ChartQueryReturns {
	charts: Array<ChartDocument & { __playcount: integer }>;
	songs: Array<SongDocument>;
}
