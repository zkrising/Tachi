import {
	ChartDocument,
	IDStrings,
	IDStringToGame,
	integer,
	PBScoreDocument,
	PublicUserDocument,
	ScoreDocument,
	SongDocument,
	UserGameStats,
} from "tachi-common";

export type PBDataset<I extends IDStrings = IDStrings> = (PBScoreDocument<I> & {
	__related: {
		chart: ChartDocument<I>;
		song: SongDocument<IDStringToGame[I]>;
		index: integer;
		user?: PublicUserDocument;
	};
	__playcount?: integer;
})[];

export type ScoreDataset<I extends IDStrings = IDStrings> = (ScoreDocument<I> & {
	__related: {
		chart: ChartDocument<I>;
		song: SongDocument<IDStringToGame[I]>;
		index: integer;
		user: PublicUserDocument;
	};
})[];

export type FolderDataset<I extends IDStrings = IDStrings> = (ChartDocument<I> & {
	__related: {
		pb: PBScoreDocument<I> | null;
		song: SongDocument<IDStringToGame[I]>;
		user: PublicUserDocument;
	};
})[];

export type ChartLeaderboardDataset<I extends IDStrings = IDStrings> = (PBScoreDocument<I> & {
	__related: {
		user: PublicUserDocument;
	};
})[];

export type UGSDataset<I extends IDStrings = IDStrings> = (UserGameStats<I> & {
	__related: {
		user: PublicUserDocument;
		index: integer;
	};
})[];
