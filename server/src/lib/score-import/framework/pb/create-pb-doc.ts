import {
	BMSMergeFn,
	IIDXMergeFn,
	PMSMergeFn,
	PopnMergeFn,
	SDVXMergeFn,
	USCMergeFn,
} from "./game-specific-merge";
import db from "external/mongo/db";
import { GetEveryonesRivalIDs } from "lib/rivals/rivals";
import type { KtLogger } from "lib/logger/logger";
import type { BulkWriteUpdateOneOperation, FilterQuery } from "mongodb";
import type {
	Game,
	GPTString,
	integer,
	PBScoreDocument,
	Playtype,
	ScoreDocument,
} from "tachi-common";

export type PBScoreDocumentNoRank<GPT extends GPTString = GPTString> = Omit<
	PBScoreDocument<GPT>,
	"rankingData"
>;

/**
 * Create a PB document for this user on this chart. Optionally, provide an "As Of"
 * timestamp to constrain the generated PB to only one before the provided time.
 */
export async function CreatePBDoc(
	userID: integer,
	chartID: string,
	logger: KtLogger,
	asOfTimestamp?: number
) {
	const query: FilterQuery<ScoreDocument> = {
		userID,
		chartID,
	};

	if (asOfTimestamp !== undefined) {
		query.timeAchieved = { $lt: asOfTimestamp };
	}

	const scorePB = await db.scores.findOne(query, {
		sort: {
			"scoreData.percent": -1,
		},
	});

	if (!scorePB) {
		if (asOfTimestamp !== undefined) {
			// if we were constraining the PB on a timestamp, this is likely to happen.
			// ignore it.
			return;
		}

		logger.warn(
			`User ${userID} has no scores on chart, but a PB was attempted to be created?`,
			{
				chartID,
				userID,
			}
		);
		return;
	}

	const lampPB = (await db.scores.findOne(query, {
		sort: {
			"scoreData.lampIndex": -1,
		},
	})) as ScoreDocument;

	// ^ guaranteed to not be null, as this always resolves
	// to atleast one score (and we got ScorePB above, so we know there's
	// atleast one).

	const pbDoc = await MergeScoreLampIntoPB(userID, scorePB, lampPB, logger, asOfTimestamp);

	if (!pbDoc) {
		return;
	}

	// finally, return our full pbDoc, that does NOT have the ranking props.
	// (We will add those later)
	return pbDoc;
}

/**
 * Updates rankings on a given chart.
 */
export async function UpdateChartRanking(game: Game, playtype: Playtype, chartID: string) {
	const scores = await db["personal-bests"].find(
		{ chartID },
		{
			sort: {
				"scoreData.percent": -1,
				timeAchieved: 1,
			},
		}
	);

	const allRivals = await GetEveryonesRivalIDs(game, playtype);

	const bwrite: Array<BulkWriteUpdateOneOperation<PBScoreDocument>> = [];

	let rank = 0;

	// what users have we saw so far? used for rivalRanking calculations
	const seenUserIDs: Array<integer> = [];

	for (const score of scores) {
		rank++;
		seenUserIDs.push(score.userID);

		const thisUsersRivals = allRivals[score.userID];

		let rivalRank: integer | null = null;

		if (thisUsersRivals && thisUsersRivals.length > 0) {
			rivalRank = thisUsersRivals.filter((e) => seenUserIDs.includes(e)).length + 1;
		}

		bwrite.push({
			updateOne: {
				filter: { chartID: score.chartID, userID: score.userID },
				update: {
					$set: {
						rankingData: {
							rank,
							outOf: scores.length,
							rivalRank,
						},
					},
				},
			},
		});
	}

	// If a score is deleted such that the chart is now empty of
	// scores, the below statement will crash with no op specified.
	if (bwrite.length === 0) {
		return;
	}

	await db["personal-bests"].bulkWrite(bwrite, { ordered: false });
}

async function MergeScoreLampIntoPB(
	userID: integer,
	scorePB: ScoreDocument,
	lampPB: ScoreDocument,
	logger: KtLogger,
	asOfTimestamp?: number
): Promise<PBScoreDocumentNoRank | undefined> {
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
			grade: scorePB.scoreData.grade.string,
			gradeIndex: scorePB.scoreData.grade.string,
			lamp: lampPB.scoreData.lamp,
			lampIndex: lampPB.scoreData.lamp.index,
			judgements: scorePB.scoreData.judgements,

			// this will probably be overrode by game-specific fns
			optional: scorePB.scoreData.optional,
		},
		calculatedData: scorePB.calculatedData,
	};

	const GameSpecificMergeFn = GetGameSpecificMergeFn(scorePB.game);

	if (GameSpecificMergeFn) {
		// @ts-expect-error Yeah, this call sucks. It correctly warns us that scorePB and lampPB
		// might've diverged, but we know they haven't.
		const success = await GameSpecificMergeFn(pbDoc, scorePB, lampPB, logger, asOfTimestamp);

		// If the mergeFn returns false, this means something has gone
		// rather wrong. We just return undefined here, which in turn
		// tells our calling code to skip this PB entirely.
		if (!success) {
			return;
		}
	}

	return pbDoc;
}

function GetGameSpecificMergeFn(game: Game) {
	switch (game) {
		case "iidx":
			return IIDXMergeFn;
		case "usc":
			return USCMergeFn;
		case "sdvx":
			return SDVXMergeFn;
		case "popn":
			return PopnMergeFn;
		case "bms":
			return BMSMergeFn;
		case "pms":
			return PMSMergeFn;
		default:
			return null;
	}
}
