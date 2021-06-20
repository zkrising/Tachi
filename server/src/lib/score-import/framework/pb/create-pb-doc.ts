import db from "../../../../external/mongo/db";
import { integer, PBScoreDocument, ScoreDocument } from "tachi-common";

import { KtLogger } from "../../../logger/logger";
import { IIDXMergeFn, SDVXMergeFn } from "./game-specific-merge";
import { BulkWriteUpdateOneOperation } from "mongodb";
export type PBScoreDocumentNoRank = Omit<PBScoreDocument, "rankingData">;

export async function CreatePBDoc(userID: integer, chartID: string, logger: KtLogger) {
	const scorePB = await db.scores.findOne(
		{
			userID,
			chartID,
		},
		{
			sort: {
				"scoreData.percent": -1,
			},
		}
	);

	if (!scorePB) {
		logger.severe(`User has no scores on chart, but a PB was attempted to be created?`, {
			chartID,
			userID,
		});
		return; // ??
	}

	const lampPB = (await db.scores.findOne(
		{
			userID,
			chartID,
		},
		{
			sort: {
				"scoreData.lampIndex": -1,
			},
		}
	)) as ScoreDocument; // guaranteed to not be null, as this always resolves
	// to atleast one score (and we got ScorePB above, so we know there's
	// atleast one).

	const pbDoc = await MergeScoreLampIntoPB(userID, scorePB, lampPB, logger);

	if (!pbDoc) {
		return;
	}

	// finally, return our full pbDoc, that does NOT have the ranking props.
	// (We will add those later)
	return pbDoc;
}

/**
 * Updates users' rankings on a given chart.
 */
export async function UpdateChartRanking(chartID: string) {
	const scores = await db["personal-bests"].find(
		{ chartID },
		{
			sort: {
				"scoreData.percent": -1,
				timeAchieved: -1,
			},
		}
	);

	const bwrite: BulkWriteUpdateOneOperation<PBScoreDocument>[] = [];

	let rank = 0;

	for (let i = 0; i < scores.length; i++) {
		const score = scores[i];
		rank++;

		bwrite.push({
			updateOne: {
				filter: { chartID: score.chartID, userID: score.userID },
				update: {
					$set: {
						rankingInfo: {
							rank,
							outOf: scores.length,
						},
					},
				},
			},
		});
	}

	await db["personal-bests"].bulkWrite(bwrite, { ordered: false });
}

// Explicit acknowledgement that typing this properly simply takes too much time
// This is a function that is aptly described below when you see how its called.
// They return true on success, false on failure, and mutate their arguments.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GAME_SPECIFIC_MERGE_FNS: Record<string, any> = {
	iidx: IIDXMergeFn,
	sdvx: SDVXMergeFn,
};

async function MergeScoreLampIntoPB(
	userID: integer,
	scorePB: ScoreDocument,
	lampPB: ScoreDocument,
	logger: KtLogger
): Promise<PBScoreDocumentNoRank | void> {
	// @hack
	// since time cannot be negative, this is a rough hack
	// to resolve nullable timeAchieveds without hitting NaN.
	let timeAchieved: number | null = Math.max(
		scorePB.timeAchieved ?? -1,
		lampPB.timeAchieved ?? -1
	);

	if (timeAchieved === -1) {
		timeAchieved = null;
	}

	const pbDoc: PBScoreDocumentNoRank = {
		composedFrom: {
			scorePB: scorePB.scoreID,
			lampPB: lampPB.scoreID,
		},
		chartID: scorePB.chartID,
		comments: [scorePB.comment, lampPB.comment].filter((e) => e !== null) as string[],
		userID,
		songID: scorePB.songID,
		highlight: scorePB.highlight || lampPB.highlight,
		timeAchieved,
		game: scorePB.game,
		playtype: scorePB.playtype,
		isPrimary: scorePB.isPrimary,
		scoreData: {
			score: scorePB.scoreData.score,
			percent: scorePB.scoreData.percent,
			esd: scorePB.scoreData.esd,
			grade: scorePB.scoreData.grade,
			gradeIndex: scorePB.scoreData.gradeIndex,
			lamp: lampPB.scoreData.lamp,
			lampIndex: lampPB.scoreData.lampIndex,
			judgements: scorePB.scoreData.judgements,
			hitMeta: scorePB.scoreData.hitMeta, // this will probably be overrode by game-specific fns
		},
		calculatedData: scorePB.calculatedData,
	};

	const GameSpecificMergeFn = GAME_SPECIFIC_MERGE_FNS[scorePB.game];
	if (GameSpecificMergeFn) {
		const success = await GameSpecificMergeFn(pbDoc, scorePB, lampPB, logger);

		// If the mergeFn returns false, this means something has gone
		// rather wrong. We just return undefined here, which in turn
		// tells our calling code to skip this PB entirely.
		if (success === false) {
			return;
		}
	}

	return pbDoc;
}
