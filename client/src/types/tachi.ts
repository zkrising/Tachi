import { ChartDocument, ScoreDocument, SessionDocument, SongDocument } from "tachi-common";

export type ClumpedActivityScores = {
	type: "SCORES";
	scores: Array<ScoreDocument & { __related: { song: SongDocument; chart: ChartDocument } }>;
};

export type ClumpedActivity = Array<
	| ({
			type: "SESSION";
	  } & SessionDocument)
	| ClumpedActivityScores
>;
