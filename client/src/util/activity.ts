import { ActivityReturn } from "types/api-returns";
import { ClumpedActivity, ClumpedActivityScores } from "types/tachi";
import { ONE_HOUR } from "./constants/time";
import { CreateSongMap, CreateChartMap } from "./data";
import { NumericSOV } from "./sorts";

/**
 * Given recent activity data, clump it together so it's easier to work with,
 * by joining repeat-highlighted scores from the same user.
 */
export function ClumpActivity(data: ActivityReturn): ClumpedActivity {
	const songMap = CreateSongMap(data.songs);
	const chartMap = CreateChartMap(data.charts);

	const clumped: ClumpedActivity = [];

	let clump: ClumpedActivityScores["scores"] = [];
	let curUserID: number | null = null;
	let lastTime: number | null = null;

	for (const score of data.recentlyHighlightedScores
		.slice(0)
		.sort(NumericSOV((x) => x.timeAchieved ?? -Infinity, true))) {
		const song = songMap.get(score.songID);
		const chart = chartMap.get(score.chartID);

		if (!song || !chart) {
			console.warn(`Failed to resolve song or chart ${score.songID}, ${chart?.chartID}.`);
			continue;
		}

		if (
			(curUserID !== score.userID && curUserID !== null) ||
			(lastTime !== null && lastTime - (score.timeAchieved ?? 0) > ONE_HOUR * 8)
		) {
			clumped.push({ type: "SCORES", scores: clump });

			clump = [];
		}

		curUserID = score.userID;
		lastTime = score.timeAchieved;

		clump.push({
			...score,
			__related: {
				song,
				chart,
			},
		});
	}

	if (clump.length !== 0) {
		clumped.push({ type: "SCORES", scores: clump });
	}

	for (const session of data.recentSessions) {
		clumped.push({
			type: "SESSION",
			...session,
		});
	}

	return clumped.sort(
		NumericSOV(
			(x) => (x.type === "SESSION" ? x.timeEnded : x.scores[0]!.timeAchieved ?? -Infinity),
			true
		)
	);
}
