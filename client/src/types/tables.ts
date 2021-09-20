import {
	IDStrings,
	PBScoreDocument,
	ChartDocument,
	SongDocument,
	IDStringToGame,
	integer,
	ScoreDocument,
	PublicUserDocument,
} from "tachi-common";

export type PBDataset<I extends IDStrings = IDStrings> = (PBScoreDocument<I> & {
	__related: { chart: ChartDocument<I>; song: SongDocument<IDStringToGame[I]>; index: integer };
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
