import {
	ChartDocument,
	ClassAchievementDocument,
	ScoreDocument,
	SessionDocument,
	SongDocument,
} from "tachi-common";

export type ClumpedActivityScores = {
	type: "SCORES";
	scores: Array<ScoreDocument & { __related: { song: SongDocument; chart: ChartDocument } }>;
};

export type ClumpedActivitySession = {
	type: "SESSION";
} & SessionDocument;

export type ClumpedActivityClassAchievement = {
	type: "CLASS_ACHIEVEMENT";
} & ClassAchievementDocument;

export type ClumpedActivity = Array<
	ClumpedActivitySession | ClumpedActivityScores | ClumpedActivityClassAchievement
>;
