/* eslint-disable require-atomic-updates */
import { InternalFailure } from "../common/converter-failures";
import db from "external/mongo/db";
import { Volforce } from "rg-stats";
import { DeleteUndefinedProps } from "utils/misc";
import { FindChartWithChartID } from "utils/queries/charts";
import type { KtLogger } from "lib/logger/logger";
import type { FilterQuery } from "mongodb";
import type { PBScoreDocument, ScoreDocument } from "tachi-common";

export async function IIDXMergeFn(
	pbDoc: PBScoreDocument<"iidx:DP" | "iidx:SP">,
	scorePB: ScoreDocument<"iidx:DP" | "iidx:SP">,
	lampPB: ScoreDocument<"iidx:DP" | "iidx:SP">,
	logger: KtLogger,
	asOfTimestamp?: number
): Promise<boolean> {
	// lampRating needs to be updated.
	pbDoc.calculatedData.ktLampRating = lampPB.calculatedData.ktLampRating;

	// Update lamp related iidx-specific info from the lampPB.
	pbDoc.scoreData.optional.gsm = lampPB.scoreData.optional.gsm;
	pbDoc.scoreData.optional.gauge = lampPB.scoreData.optional.gauge;
	pbDoc.scoreData.optional.gaugeHistory = lampPB.scoreData.optional.gaugeHistory;

	pbDoc.scoreData.optional.comboBreak = lampPB.scoreData.optional.comboBreak;

	DeleteUndefinedProps(pbDoc.scoreData.optional);

	await MergeBPPB(pbDoc, scorePB, lampPB, logger, asOfTimestamp);

	return true;
}

export function PopnMergeFn(
	pbDoc: PBScoreDocument<"popn:9B">,
	scorePB: ScoreDocument<"popn:9B">,
	lampPB: ScoreDocument<"popn:9B">,
	_logger: KtLogger
) {
	pbDoc.scoreData.optional.specificClearType = lampPB.scoreData.optional.specificClearType;

	return true;
}

export async function BMSMergeFn(
	pbDoc: PBScoreDocument<"bms:7K" | "bms:14K">,
	scorePB: ScoreDocument<"bms:7K" | "bms:14K">,
	lampPB: ScoreDocument<"bms:7K" | "bms:14K">,
	logger: KtLogger,
	asOfTimestamp?: number
) {
	pbDoc.calculatedData.sieglinde = lampPB.calculatedData.sieglinde;

	pbDoc.scoreData.optional.gaugeHistory = lampPB.scoreData.optional.gaugeHistory;
	pbDoc.scoreData.optional.gauge = lampPB.scoreData.optional.gauge;

	await MergeBPPB(pbDoc, scorePB, lampPB, logger, asOfTimestamp);

	return true;
}

export async function PMSMergeFn(
	pbDoc: PBScoreDocument<"pms:Controller" | "pms:Keyboard">,
	scorePB: ScoreDocument<"pms:Controller" | "pms:Keyboard">,
	lampPB: ScoreDocument<"pms:Controller" | "pms:Keyboard">,
	logger: KtLogger,
	asOfTimestamp?: number
) {
	pbDoc.calculatedData.sieglinde = lampPB.calculatedData.sieglinde;

	await MergeBPPB(pbDoc, scorePB, lampPB, logger, asOfTimestamp);

	return true;
}

/**
 * This function recalculates and applies VF6 to the PB document.
 *
 * This is near-identical to the SDVXMergeFn. See that.
 */
export async function USCMergeFn(
	pbDoc: PBScoreDocument<"usc:Controller" | "usc:Keyboard">,
	scorePB: ScoreDocument<"usc:Controller" | "usc:Keyboard">,
	lampPB: ScoreDocument<"usc:Controller" | "usc:Keyboard">,
	logger: KtLogger
) {
	// @optimisable - see SDVXMergeFn
	const chart = await FindChartWithChartID("usc", pbDoc.chartID);

	if (!chart) {
		logger.severe(`Chart ${pbDoc.chartID} disappeared underfoot?`);
		throw new InternalFailure(`Chart ${pbDoc.chartID} disappeared underfoot?`);
	}

	pbDoc.calculatedData.VF6 = Volforce.calculateVF6(
		pbDoc.scoreData.score,
		pbDoc.scoreData.lamp,
		chart.levelNum
	);

	return true;
}

/**
 * This function recalculates and applies VF6 to the PB document.
 *
 * SDVX cannot just select the larger volforce - instead, volforce has to be
 * re-calculated for any different permutation of scorePB + lampPB.
 */
export async function SDVXMergeFn(
	pbDoc: PBScoreDocument<"sdvx:Single">,
	scorePB: ScoreDocument<"sdvx:Single">,
	lampPB: ScoreDocument<"sdvx:Single">,
	logger: KtLogger,
	asOfTimestamp?: number
): Promise<boolean> {
	// @optimisable
	// This is a re-fetch, but it's difficult to pass the chart all
	// the way down here due to how chartIDs (set) works. :(
	const chart = await FindChartWithChartID("sdvx", pbDoc.chartID);

	if (!chart) {
		logger.severe(`Chart ${pbDoc.chartID} disappeared underfoot?`);
		throw new InternalFailure(`Chart ${pbDoc.chartID} disappeared underfoot?`);
	}

	pbDoc.calculatedData.VF6 = Volforce.calculateVF6(
		pbDoc.scoreData.score,
		pbDoc.scoreData.lamp,
		chart.levelNum
	);

	const query: FilterQuery<ScoreDocument> = {
		chartID: pbDoc.chartID,
		"scoreData.optional.exScore": { $type: "number" },
	};

	if (asOfTimestamp !== undefined) {
		query.timeAchieved = { $lt: asOfTimestamp };
	}

	// find the users score with the highest exScore
	const bestExScore = (await db.scores.findOne(query, {
		sort: {
			"scoreData.optional.exScore": -1,
		},
	})) as ScoreDocument<"sdvx:Single"> | null;

	if (!bestExScore) {
		pbDoc.scoreData.optional.exScore = undefined;
	} else {
		pbDoc.scoreData.optional.exScore = bestExScore.scoreData.optional.exScore;

		pbDoc.composedFrom.other = [{ name: "exScorePB", scoreID: bestExScore.scoreID }];
	}

	return true;
}

type GPTStringWithBP =
	| "bms:7K"
	| "bms:14K"
	| "iidx:DP"
	| "iidx:SP"
	| "pms:Controller"
	| "pms:Keyboard";

/**
 * Given typical PB-Merge information, fetch the best `bp` for this user's scores
 * on this chart and merge it with the `pbDoc` if it's large enough.
 *
 * @returns NOTHING, mutates original input.
 */
async function MergeBPPB(
	pbDoc: PBScoreDocument<GPTStringWithBP>,
	scorePB: ScoreDocument<GPTStringWithBP>,
	lampPB: ScoreDocument<GPTStringWithBP>,
	logger: KtLogger,
	asOfTimestamp: number | undefined
) {
	// bad+poor PB document. This is a weird, third indepdenent metric that IIDX players sometimes care about.
	const query: FilterQuery<ScoreDocument> = {
		userID: scorePB.userID,
		chartID: scorePB.chartID,
		"scoreData.optional.bp": { $exists: true },
	};

	if (asOfTimestamp !== undefined) {
		query.timeAchieved = { $lt: asOfTimestamp };
	}

	const bpPB = (await db.scores.findOne(query, {
		sort: {
			// bp 0 is the best BP, bp 1 is worse, so on
			"scoreData.optional.bp": 1,
		},
	})) as ScoreDocument<"iidx:DP" | "iidx:SP"> | null;

	if (!bpPB) {
		logger.verbose(
			`Could not find BP PB for ${scorePB.userID} ${scorePB.chartID} in PB joining. User likely has no scores with BP defined.`,
			{ pbDoc }
		);

		// this isn't actually an error! we just don't have to do anything.
		return;
	}

	// by default scorePB is chosen for optional fields, so, we can skip any assignments here by returning here.
	if (bpPB.scoreID === scorePB.scoreID) {
		logger.debug(`Skipped merging BP PB as scorePB was also BP PB.`);
		return true;
	} else if (bpPB.scoreID === lampPB.scoreID) {
		pbDoc.scoreData.optional.bp = lampPB.scoreData.optional.bp;
		logger.debug(`Skipped adding BP PB as composedFrom because lampPB was also BP PB.`);
		return;
	}

	pbDoc.scoreData.optional.bp = bpPB.scoreData.optional.bp;

	pbDoc.composedFrom.other = [{ name: "Best BP", scoreID: bpPB.scoreID }];
}
