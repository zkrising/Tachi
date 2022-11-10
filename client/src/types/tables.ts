import {
	ChartDocument,
	IDStrings,
	IDStringToGame,
	ImportDocument,
	ImportTrackerFailed,
	integer,
	PBScoreDocument,
	UserDocument,
	ScoreDocument,
	SongDocument,
	UserGameStats,
} from "tachi-common";

export type PBDataset<I extends IDStrings = IDStrings> = (PBScoreDocument<I> & {
	__related: {
		chart: ChartDocument<I>;
		song: SongDocument<IDStringToGame[I]>;
		index: integer;
		user?: UserDocument;
	};
	__playcount?: integer;
})[];

export type ScoreDataset<I extends IDStrings = IDStrings> = (ScoreDocument<I> & {
	__related: {
		chart: ChartDocument<I>;
		song: SongDocument<IDStringToGame[I]>;
		index: integer;
		user: UserDocument;
	};
})[];

export type FolderDataset<I extends IDStrings = IDStrings> = (ChartDocument<I> & {
	__related: {
		pb: PBScoreDocument<I> | null;
		song: SongDocument<IDStringToGame[I]>;
		user: UserDocument;
	};
})[];

export type ChartLeaderboardDataset<I extends IDStrings = IDStrings> = (PBScoreDocument<I> & {
	__related: {
		user: UserDocument;
	};
})[];

export type UGSDataset<I extends IDStrings = IDStrings> = (UserGameStats<I> & {
	__related: {
		user: UserDocument;
		index: integer;
	};
})[];

export type RivalChartDataset<I extends IDStrings = IDStrings> = (UserDocument & {
	__related: {
		pb: PBScoreDocument<I> | null;
		index: number;
	};
})[];

export type ComparePBsDataset<I extends IDStrings = IDStrings> = Array<{
	base: PBScoreDocument<I> | null;
	compare: PBScoreDocument<I> | null;
	chart: ChartDocument;
	song: SongDocument;
}>;

export type ImportDataset = Array<
	ImportDocument & {
		__related: {
			user: UserDocument;
		};
	}
>;

export type FailedImportDataset = Array<
	ImportTrackerFailed & {
		__related: {
			user: UserDocument;
		};
	}
>;
