import { integer, PBScoreDocument, ScoreDocument, ChartDocument } from "tachi-common";
import CreateLogCtx from "lib/logger/logger";
import { GetPBOnChart, GetServerRecordOnChart } from "utils/scores";
import { MStoS } from "utils/misc";
import { USCIR_ADJACENT_SCORE_N } from "lib/constants/usc-ir";
import db from "external/mongo/db";
import { USCServerScore } from "./types";

const logger = CreateLogCtx(__filename);

export const TACHI_LAMP_TO_USC: Record<
	PBScoreDocument<"usc:Single">["scoreData"]["lamp"],
	USCServerScore["lamp"]
> = {
	// we don't do NO PLAY, so its not handled.
	FAILED: 1,
	CLEAR: 2,
	"EXCESSIVE CLEAR": 3,
	"ULTIMATE CHAIN": 4,
	"PERFECT ULTIMATE CHAIN": 5,
};

/**
 * Converts a Kamaitachi Score to the ServerScoreDocument
 * as specified in the USCIR spec. This function silently
 * returns sentinel values in the case that certain
 * fields are null.
 */
export async function TachiScoreToServerScore(
	tachiScore: PBScoreDocument<"usc:Single">
): Promise<USCServerScore> {
	// @optimisable
	// Repeated calls to this may pre-emptively provide usernames
	// and score PBs.
	const userDoc = await db.users.findOne(
		{
			id: tachiScore.userID,
		},
		{
			projection: {
				username: 1,
			},
		}
	);

	if (!userDoc) {
		logger.severe(
			`User ${tachiScore.userID} from PB on chart ${tachiScore.chartID} has no user document?`
		);
		throw new Error(
			`User ${tachiScore.userID} from PB on chart ${tachiScore.chartID} has no user document?`
		);
	}

	const scorePB = (await db.scores.findOne({
		scoreID: tachiScore.composedFrom.scorePB,
	})) as ScoreDocument<"usc:Single"> | null;

	if (!scorePB) {
		logger.severe(
			`Score ${tachiScore.composedFrom.scorePB} does not exist, but is referenced in ${tachiScore.userID}'s PBDoc on ${tachiScore.chartID}?`
		);

		throw new Error(
			`Score ${tachiScore.composedFrom.scorePB} does not exist, but is referenced in ${tachiScore.userID}'s PBDoc on ${tachiScore.chartID}?`
		);
	}

	return {
		score: tachiScore.scoreData.score,
		timestamp: MStoS(tachiScore.timeAchieved ?? 0),
		crit: tachiScore.scoreData.judgements.critical ?? 0,
		near: tachiScore.scoreData.judgements.near ?? 0,
		error: tachiScore.scoreData.judgements.miss ?? 0,
		ranking: tachiScore.rankingData.rank,
		lamp: TACHI_LAMP_TO_USC[tachiScore.scoreData.lamp],
		username: userDoc.username,
		noteMod: scorePB.scoreMeta.noteMod ?? "NORMAL",
		gaugeMod: scorePB.scoreMeta.gaugeMod ?? "NORMAL",
	};
}

export async function CreatePOSTScoresResponseBody(
	userID: integer,
	chartDoc: ChartDocument<"usc:Single">,
	scoreID: string
): Promise<POSTScoresResponseBody> {
	const scorePB = (await GetPBOnChart(
		userID,
		chartDoc.chartID
	)) as PBScoreDocument<"usc:Single"> | null;

	if (!scorePB) {
		logger.severe(`Score was imported for chart, but no ScorePB was available on this chart?`, {
			chartDoc,
			scoreID,
		});
		throw new Error(
			`Score was imported for chart, but no ScorePB was available on this chart?`
		);
	}

	const ktServerRecord = (await GetServerRecordOnChart(
		chartDoc.chartID
	)) as PBScoreDocument<"usc:Single"> | null;

	// this is impossible to trigger without making a race-condition.
	/* istanbul ignore next */
	if (!ktServerRecord) {
		logger.severe(
			`Score was imported for chart, but no Server Record was available on this chart?`,
			{
				chartDoc,
				scoreID,
			}
		);
		throw new Error(
			`Score was imported for chart, but no Server Record was available on this chart?`
		);
	}

	const usersRanking = scorePB.rankingData.rank;

	// This returns immediately ranked higher
	// than the current user.

	const adjAbove = (await db["personal-bests"].find(
		{
			chartID: chartDoc.chartID,
			"rankingData.rank": { $lt: usersRanking },
		},
		{
			limit: USCIR_ADJACENT_SCORE_N,
			sort: { "rankingData.rank": -1 },
		}
	)) as PBScoreDocument<"usc:Single">[];

	// The specification enforces that we return them in
	// ascending order, though, so we reverse this after
	// the query.
	adjAbove.reverse();

	// if the users ranking implies that the above query
	// returned the server record (i.e. they are ranked
	// between #1 and #1 + N)
	// delete the server record from adjAbove.
	if (usersRanking - USCIR_ADJACENT_SCORE_N <= 1) {
		adjAbove.shift();
	}

	// Similar to above, this returns the N most immediate
	// scores below the given user.
	const adjBelow = (await db["personal-bests"].find(
		{
			chartID: chartDoc.chartID,
			"rankingData.rank": { $gt: usersRanking },
		},
		{
			limit: USCIR_ADJACENT_SCORE_N,
			sort: { "rankingData.rank": 1 },
		}
	)) as PBScoreDocument<"usc:Single">[];

	const [score, serverRecord, adjacentAbove, adjacentBelow] = await Promise.all([
		TachiScoreToServerScore(scorePB),
		TachiScoreToServerScore(ktServerRecord),
		Promise.all(adjAbove.map(TachiScoreToServerScore)),
		Promise.all(adjBelow.map(TachiScoreToServerScore)),
	]);

	const originalScore = (await db.scores.findOne({
		scoreID,
	})) as ScoreDocument<"usc:Single">;

	if (!originalScore) {
		logger.severe(
			`Score with ID ${scoreID} is not in the database, but was claimed to be inserted?`
		);
		throw new Error(
			`Score with ID ${scoreID} is not in the database, but was claimed to be inserted?`
		);
	}

	return {
		score,
		serverRecord,
		isServerRecord: scorePB.userID === ktServerRecord?.userID,
		isPB: scorePB.composedFrom.scorePB === scoreID,
		sendReplay: originalScore.scoreID,
		adjacentAbove,
		adjacentBelow,
	};
}

export interface POSTScoresResponseBody {
	score: USCServerScore;
	serverRecord: USCServerScore;
	adjacentAbove: USCServerScore[];
	adjacentBelow: USCServerScore[];
	isPB: boolean;
	isServerRecord: boolean;
	sendReplay: string;
}
