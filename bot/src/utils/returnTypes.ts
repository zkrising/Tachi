import type {
	APIPermissions,
	ChartDocument,
	FolderDocument,
	Game,
	Grades,
	IDStrings,
	IDStringToGame,
	ImportDocument,
	ImportTypes,
	integer,
	Lamps,
	PublicUserDocument,
	ScoreDocument,
	SessionDocument,
	SongDocument,
	UGSRatingsLookup,
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

export interface UGPTStats<I extends IDStrings = IDStrings> {
	gameStats: UserGameStats;
	firstScore: ScoreDocument;
	mostRecentScore: ScoreDocument;
	totalScores: integer;
	rankingData: Record<UGSRatingsLookup[I], { ranking: integer; outOf: integer }>;
}

export interface ChartQueryReturns {
	charts: Array<ChartDocument & { __playcount: integer }>;
	songs: Array<SongDocument>;
}

export interface UGPTFolderStat<I extends IDStrings = IDStrings> {
	folderID: string;
	grades: Partial<Record<Grades[I], integer>>;
	lamps: Partial<Record<Lamps[I], integer>>;
	chartCount: integer;
}

export interface UGPTFolderTimeline<I extends IDStrings = IDStrings> {
	songs: Array<SongDocument<IDStringToGame[I]>>;
	charts: Array<ChartDocument<I>>;
	scores: Array<ScoreDocument<I>>;
	folder: FolderDocument;
}

export interface SessionInfo {
	session: SessionDocument;
	songs: Array<SongDocument>;
	charts: Array<ChartDocument>;
	scores: Array<ScoreDocument>;
	user: PublicUserDocument;
}
