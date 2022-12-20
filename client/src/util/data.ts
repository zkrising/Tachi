import {
	ChartDocument,
	Game,
	GoalDocument,
	IDStrings,
	integer,
	UserDocument,
	ScoreDocument,
	SessionScoreInfo,
	SongDocument,
	QuestDocument,
} from "tachi-common";
import { GoalsOnChartReturn, GoalsOnFolderReturn } from "types/api-returns";

export function GetPBs(scoreInfo: SessionScoreInfo[]) {
	return scoreInfo.filter((e) => e.isNewScore === true || e.lampDelta > 0 || e.scoreDelta > 0);
}

export function CreateSongMap<G extends Game = Game>(songs: SongDocument<G>[]) {
	const songMap = new Map<integer, SongDocument<G>>();

	for (const song of songs) {
		songMap.set(song.id, song);
	}

	return songMap;
}

export function CreateUserMap(users: UserDocument[]) {
	const userMap = new Map<integer, UserDocument>();

	for (const user of users) {
		userMap.set(user.id, user);
	}

	return userMap;
}

export function CreateGoalMap(goals: GoalDocument[]) {
	const goalMap = new Map<string, GoalDocument>();

	for (const goal of goals) {
		goalMap.set(goal.goalID, goal);
	}

	return goalMap;
}

export function CreateChartIDMap<T extends { chartID: string }>(arr: T[]): Map<string, T> {
	const map = new Map();

	for (const t of arr) {
		map.set(t.chartID, t);
	}

	return map;
}

export function CreateChartMap<I extends IDStrings = IDStrings>(charts: ChartDocument<I>[]) {
	const chartMap = new Map<string, ChartDocument<I>>();

	for (const chart of charts) {
		chartMap.set(chart.chartID, chart);
	}

	return chartMap;
}

export function CreateScoreIDMap<I extends IDStrings = IDStrings>(scores: ScoreDocument<I>[]) {
	const scoreMap = new Map<string, ScoreDocument<I>>();

	for (const score of scores) {
		scoreMap.set(score.scoreID, score);
	}

	return scoreMap;
}

export function CreateChartLink(chart: ChartDocument, game: Game) {
	if (chart.isPrimary) {
		return `/games/${game}/${chart.playtype}/songs/${chart.songID}/${encodeURIComponent(
			chart.difficulty
		)}`;
	}

	return `/games/${game}/${chart.playtype}/songs/${chart.songID}/${chart.chartID}`;
}

// stolen from server
export function GetGoalIDsFromQuest(quest: QuestDocument) {
	// this sucks - maybe a nicer way to do this, because nested
	// maps are just ugly
	return quest.questData.map((e) => e.goals.map((e) => e.goalID)).flat(1);
}

export function CreateGoalSubDataset(
	data: GoalsOnChartReturn | GoalsOnFolderReturn,
	userMap: Map<integer, UserDocument>
) {
	const dataset = [];
	const goalMap = CreateGoalMap(data.goals);

	for (const sub of data.goalSubs) {
		const goal = goalMap.get(sub.goalID);

		if (!goal) {
			console.warn(
				`No goal was sent for ${sub.userID}:${sub.goalID}, yet was a subscription?`
			);
			continue;
		}

		const user = userMap.get(sub.userID);

		if (!user) {
			console.warn(
				`No user was set for ${sub.userID}:${sub.goalID}, yet was a subscription?`
			);
			continue;
		}

		const parentQuests = data.quests.filter((q) =>
			GetGoalIDsFromQuest(q).includes(goal.goalID)
		);

		dataset.push({
			...sub,
			__related: {
				goal,
				user,
				parentQuests,
			},
		});
	}

	return dataset;
}
