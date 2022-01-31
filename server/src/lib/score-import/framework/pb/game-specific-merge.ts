import db from "external/mongo/db";
import { KtLogger } from "lib/logger/logger";
import { PBScoreDocument, ScoreDocument } from "tachi-common";
import { FindChartWithChartID } from "utils/queries/charts";
import { InternalFailure } from "../common/converter-failures";
import { Volforce } from "rg-stats";

export async function IIDXMergeFn(
	pbDoc: PBScoreDocument<"iidx:SP" | "iidx:DP">,
	scorePB: ScoreDocument<"iidx:SP" | "iidx:DP">,
	lampPB: ScoreDocument<"iidx:SP" | "iidx:DP">,
	logger: KtLogger
): Promise<boolean> {
	// lampRating needs to be updated.
	pbDoc.calculatedData.ktLampRating = lampPB.calculatedData.ktLampRating;

	// bad+poor PB document. This is a weird, third indepdenent metric that IIDX players sometimes care about.
	const bpPB = (await db.scores.findOne(
		{
			userID: scorePB.userID,
			chartID: scorePB.chartID,
			"scoreData.hitMeta.bp": { $exists: true },
		},
		{
			sort: {
				"scoreData.hitMeta.bp": 1, // bp 0 is the best BP, bp 1 is worse, so on
			},
		}
	)) as ScoreDocument<"iidx:SP" | "iidx:DP">;

	if (!bpPB) {
		logger.verbose(
			`Could not find BP PB for ${scorePB.userID} ${scorePB.chartID} in PB joining. User likely has no scores with BP defined.`,
			{ pbDoc }
		);
		// this isn't actually an error! we just don't have to do anything.
		return true;
	}

	// by default scorePB is chosen for hitMeta fields, so, we can skip any assignments here by returning here.
	if (bpPB.scoreID === scorePB.scoreID) {
		logger.debug(`Skipped merging BP PB as scorePB was also BP PB.`);
		return true;
	} else if (bpPB.scoreID === lampPB.scoreID) {
		pbDoc.scoreData.hitMeta.bp = lampPB.scoreData.hitMeta.bp;
		logger.debug(`Skipped adding BP PB as composedFrom because lampPB was also BP PB.`);
		return true;
	}

	pbDoc.scoreData.hitMeta.bp = bpPB.scoreData.hitMeta.bp!;

	pbDoc.composedFrom.other = [{ name: "Best BP", scoreID: bpPB.scoreID }];

	// Update lamp related iidx-specific info from the lampPB.
	pbDoc.scoreData.hitMeta.gsm = lampPB.scoreData.hitMeta.gsm ?? null;
	pbDoc.scoreData.hitMeta.gauge = lampPB.scoreData.hitMeta.gauge ?? null;
	pbDoc.scoreData.hitMeta.gaugeHistory = lampPB.scoreData.hitMeta.gaugeHistory ?? null;

	return true;
}

export function PopnMergeFn(
	pbDoc: PBScoreDocument<"popn:9B">,
	scorePB: ScoreDocument<"popn:9B">,
	lampPB: ScoreDocument<"popn:9B">,
	logger: KtLogger
) {
	pbDoc.scoreData.hitMeta.specificClearType = lampPB.scoreData.hitMeta.specificClearType;

	return true;
}

export function BMSMergeFn(
	pbDoc: PBScoreDocument<"bms:7K" | "bms:14K">,
	scorePB: ScoreDocument<"bms:7K" | "bms:14K">,
	lampPB: ScoreDocument<"bms:7K" | "bms:14K">,
	logger: KtLogger
) {
	pbDoc.calculatedData.sieglinde = lampPB.calculatedData.sieglinde;

	return true;
}

/**
 * This function recalculates and applies VF6 to the PB document.
 *
 * This is near-identical to the SDVXMergeFn. See that.
 */
export async function USCMergeFn(
	pbDoc: PBScoreDocument<"usc:Keyboard" | "usc:Controller">,
	scorePB: ScoreDocument<"usc:Keyboard" | "usc:Controller">,
	lampPB: ScoreDocument<"usc:Keyboard" | "usc:Controller">,
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
	logger: KtLogger
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

	return true;
}
