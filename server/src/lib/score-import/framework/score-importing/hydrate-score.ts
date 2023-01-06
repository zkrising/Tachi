import { CreateCalculatedData } from "../score-calculated-data/calculated-data";
import { CreateFullScoreData } from "../derivers/derivers";
import { GetGPTString } from "tachi-common";
import type { DryScore } from "../common/types";
import type { KtLogger } from "lib/logger/logger";
import type { ChartDocument, integer, ScoreDocument, SongDocument } from "tachi-common";

/**
 * Takes an "intermediate" score and appends the rest of the data it needs.
 * @param dryScore The intermediate score to make into a real score.
 * @param userID The userID this score is for.
 */
export async function HydrateScore(
	userID: integer,
	dryScore: DryScore,
	chart: ChartDocument,
	song: SongDocument,
	scoreID: string,
	logger: KtLogger
): Promise<ScoreDocument> {
	const gpt = GetGPTString(dryScore.game, chart.playtype);

	const scoreData = CreateFullScoreData(gpt, dryScore.scoreData, chart);

	const calculatedData = await CreateCalculatedData(dryScore, chart, logger);

	const score: ScoreDocument = {
		...dryScore,

		// then push our new score data.
		scoreData,

		// everything below this point is sane
		highlight: false,
		timeAdded: Date.now(),
		userID,
		calculatedData,
		songID: song.id,
		chartID: chart.chartID,
		scoreID,
		playtype: chart.playtype,
		isPrimary: chart.isPrimary,
	};

	return score;
}
