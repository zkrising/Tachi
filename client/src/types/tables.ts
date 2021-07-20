import {
	IDStrings,
	PBScoreDocument,
	ChartDocument,
	SongDocument,
	IDStringToGame,
	integer,
	ScoreDocument,
} from "tachi-common";

export type PBDataset<I extends IDStrings = IDStrings> = (PBScoreDocument<I> & {
	__related: { chart: ChartDocument<I>; song: SongDocument<IDStringToGame[I]>; index: integer };
})[];

export type ScoreDataset<I extends IDStrings = IDStrings> = (ScoreDocument<I> & {
	__related: { chart: ChartDocument<I>; song: SongDocument<IDStringToGame[I]>; index: integer };
})[];
