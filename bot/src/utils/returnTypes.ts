import {
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
	games: Game[];
	importTypes: ImportTypes[];
	name: string;
	type: "ktchi" | "btchi" | "omni";
}

export interface ServerStatus {
	serverTime: number;
	startTime: number;
	version: string;
	whoami: integer | null;
	permissions: APIPermissions[];
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
	charts: (ChartDocument & { __playcount: integer })[];
	songs: SongDocument[];
}

export interface UGPTFolderStat<I extends IDStrings = IDStrings> {
	folderID: string;
	grades: Record<Grades[I], integer>;
	lamps: Record<Lamps[I], integer>;
	chartCount: integer;
}

export interface UGPTFolderTimeline<I extends IDStrings = IDStrings> {
	songs: SongDocument<IDStringToGame[I]>[];
	charts: ChartDocument<I>[];
	scores: ScoreDocument<I>[];
	folder: FolderDocument;
}

export interface SessionInfo {
	session: SessionDocument;
	songs: SongDocument[];
	charts: ChartDocument[];
	scores: ScoreDocument[];
	user: PublicUserDocument;
}
