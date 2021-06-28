import db from "../external/mongo/db";
import {
	integer,
	PBScoreDocument,
	ScoreDocument,
	AnyChartDocument,
	AnySongDocument,
} from "tachi-common";
import { DedupeArr } from "./misc";

export function GetPBOnChart(userID: integer, chartID: string) {
	return db["personal-bests"].findOne({
		userID,
		chartID,
	});
}

export function GetServerRecordOnChart(chartID: string) {
	return db["personal-bests"].findOne({
		chartID,
		"rankingData.rank": 1,
	});
}

export function FilterChartsAndSongs(
	scores: (PBScoreDocument | ScoreDocument)[],
	charts: AnyChartDocument[],
	songs: AnySongDocument[]
) {
	const chartIDs = new Set();
	const songIDs = new Set();

	for (const score of scores) {
		chartIDs.add(score.chartID);
		songIDs.add(score.songID);
	}

	// filter out irrelevant songs and charts
	return {
		songs: songs.filter((e) => songIDs.has(e.id)),
		charts: charts.filter((e) => chartIDs.has(e.chartID)),
	};
}

export function GetScoreIDsFromComposed(pb: PBScoreDocument) {
	const arr = [pb.composedFrom.lampPB, pb.composedFrom.scorePB];

	if (pb.composedFrom.other) {
		arr.push(...pb.composedFrom.other.map((e) => e.scoreID));
	}

	return DedupeArr(arr);
}
