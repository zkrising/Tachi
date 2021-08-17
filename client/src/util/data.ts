import {
	ChartDocument,
	Game,
	IDStrings,
	integer,
	SessionScoreInfo,
	SongDocument,
	ScoreDocument,
} from "tachi-common";

export function GetPBs(scoreInfo: SessionScoreInfo[]) {
	return scoreInfo.map(e => e.isNewScore === true || e.lampDelta > 0 || e.scoreDelta > 0);
}

export function CreateSongMap<G extends Game = Game>(songs: SongDocument<G>[]) {
	const songMap = new Map<integer, SongDocument<G>>();

	for (const song of songs) {
		songMap.set(song.id, song);
	}

	return songMap;
}

export function CreateChartMap<I extends IDStrings = IDStrings>(charts: ChartDocument<I>[]) {
	const chartMap = new Map<string, ChartDocument<I>>();

	for (const chart of charts) {
		chartMap.set(chart.chartID, chart);
	}

	return chartMap;
}

export function CreateScoreMap<I extends IDStrings = IDStrings>(scores: ScoreDocument<I>[]) {
	const scoreMap = new Map<string, ScoreDocument<I>>();

	for (const score of scores) {
		scoreMap.set(score.scoreID, score);
	}

	return scoreMap;
}

export function CreateChartLink(chart: ChartDocument, game: Game) {
	if (chart.isPrimary) {
		return `/dashboard/games/${game}/${chart.playtype}/songs/${
			chart.songID
		}/${encodeURIComponent(chart.difficulty)}`;
	}

	return `/dashboard/games/${game}/${chart.playtype}/songs/${chart.songID}/${chart.chartID}`;
}
