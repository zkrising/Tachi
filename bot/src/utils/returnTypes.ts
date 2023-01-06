import type {
	APIPermissions,
	ChartDocument,
	Game,
	GPTString,
	ImportDocument,
	ImportTypes,
	integer,
	ScoreDocument,
	SongDocument,
	ProfileRatingLookup,
	UserGameStats,
} from "tachi-common";

export interface ServerConfig {
	games: Array<Game>;
	importTypes: Array<ImportTypes>;
	name: string;
	type: "btchi" | "ktchi" | "omni";
}

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
	rankingData: Record<ProfileRatingLookup[I], { ranking: integer; outOf: integer }>;
}

export interface ChartQueryReturns {
	charts: Array<ChartDocument & { __playcount: integer }>;
	songs: Array<SongDocument>;
}
