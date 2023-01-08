/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
// ^ ts eslint currently gets very confused about the complexity on show here
// sorry!

import { GetGrade } from "./common-utils";
import { IIDXLIKE_DERIVERS } from "./games/iidx-like";
import { PopnClearMedalToLamp } from "./games/popn";
import { SDVXLIKE_DERIVERS } from "./games/sdvx-like";
import { InternalFailure } from "../common/converter-failures";
import {
	CHUNITHM_GBOUNDARIES,
	GITADORA_GBOUNDARIES,
	GetGPTConfig,
	GetScoreMetrics,
	ITG_GBOUNDARIES,
	JUBEAT_GBOUNDARIES,
	MAIMAIDX_GBOUNDARIES,
	MUSECA_GBOUNDARIES,
	POPN_GBOUNDARIES,
	WACCA_GBOUNDARIES,
} from "tachi-common";
import type { DryScore, DryScoreData } from "../common/types";
import type { GPTDerivers } from "./types";
import type { KtLogger } from "lib/logger/logger";
import type { ChartDocument, DerivedMetrics, GPTString, ScoreData, integer } from "tachi-common";
import type { MetricValue } from "tachi-common/types/metrics";

type AllGPTDerivers = {
	[GPT in GPTString]: GPTDerivers<GPT>;
};

/**
 * How do we derive the "derivedMetrics" for each game?
 */
const GPT_DERIVERS: AllGPTDerivers = {
	// these games quite literally *all* work the same way.
	"bms:14K": IIDXLIKE_DERIVERS,
	"bms:7K": IIDXLIKE_DERIVERS,
	"pms:Controller": IIDXLIKE_DERIVERS,
	"pms:Keyboard": IIDXLIKE_DERIVERS,
	"iidx:SP": IIDXLIKE_DERIVERS,
	"iidx:DP": IIDXLIKE_DERIVERS,

	// same stuff.
	"sdvx:Single": SDVXLIKE_DERIVERS,
	"usc:Controller": SDVXLIKE_DERIVERS,
	"usc:Keyboard": SDVXLIKE_DERIVERS,

	"chunithm:Single": {
		grade: ({ score }) => GetGrade(CHUNITHM_GBOUNDARIES, score),
	},
	"wacca:Single": {
		grade: ({ score }) => GetGrade(WACCA_GBOUNDARIES, score),
	},
	"jubeat:Single": {
		grade: ({ score }) => GetGrade(JUBEAT_GBOUNDARIES, score),
	},
	"gitadora:Dora": {
		grade: ({ percent }) => GetGrade(GITADORA_GBOUNDARIES, percent),
	},
	"gitadora:Gita": {
		grade: ({ percent }) => GetGrade(GITADORA_GBOUNDARIES, percent),
	},
	"itg:Stamina": {
		finalPercent: (metrics) => {
			// *important*
			// don't check if metrics.survivedPercent === 100, as due to floating
			// point inaccuracies, it's possible to have a 100% fail
			// (on extremely long charts, for example)
			if (metrics.lamp === "FAILED") {
				return metrics.survivedPercent;
			}

			return 100 + metrics.scorePercent;
		},
		grade: ({ scorePercent, lamp }) => {
			if (lamp === "FAILED") {
				return "F";
			}

			return GetGrade(ITG_GBOUNDARIES, scorePercent);
		},
	},
	"maimaidx:Single": {
		grade: ({ percent }) => GetGrade(MAIMAIDX_GBOUNDARIES, percent),
	},
	"museca:Single": {
		grade: ({ score }) => GetGrade(MUSECA_GBOUNDARIES, score),
	},
	"popn:9B": {
		lamp: ({ clearMedal }) => PopnClearMedalToLamp(clearMedal),
		grade: ({ score, clearMedal }) => {
			const gradeString = GetGrade(POPN_GBOUNDARIES, score);

			// lol double-calc
			const lamp = PopnClearMedalToLamp(clearMedal);

			// grades are kneecapped at "A" if you failed.
			if (score >= 90_000 && lamp === "FAILED") {
				return "A";
			}

			return gradeString;
		},
	},
};

/**
 * Given the providedMetrics and chart this score is on, derive the rest of the metrics
 * we want to store.
 */
function DeriveMetrics<GPT extends GPTString>(
	gpt: GPT,
	metrics: DryScoreData<GPT>,
	chart: ChartDocument<GPT>
) {
	const deriverImplementation: GPTDerivers<GPT> = GPT_DERIVERS[gpt];

	const derivedMetrics: Record<string, MetricValue> = {};

	const gptConfig = GetGPTConfig(gpt);

	for (const [key, fn] of Object.entries(deriverImplementation)) {
		const metricConfig = gptConfig.derivedMetrics[key];

		if (!metricConfig) {
			throw new InternalFailure(
				`${gpt} has a deriver defined for '${key}', but no such field exists in the config?`
			);
		}

		const value = fn(metrics, chart);

		derivedMetrics[key] = value;
	}

	return derivedMetrics as DerivedMetrics[GPT];
}

export function CreateEnumIndexes<GPT extends GPTString>(gpt: GPT, metrics: any, logger: KtLogger) {
	const gptConfig = GetGPTConfig(gpt);

	const indexes: Record<string, integer> = {};
	const optionalIndexes: Record<string, integer> = {};

	for (const [key, conf] of [
		...Object.entries(gptConfig.providedMetrics),
		...Object.entries(gptConfig.derivedMetrics),
	]) {
		if (conf.type !== "ENUM") {
			continue;
		}

		const index = conf.values.indexOf(metrics[key]);

		if (index === -1) {
			logger.error(
				`Got an invalid enum value of ${metrics[key]} for ${gpt} ${key} on DryScore. Can't add indexes?`,
				{ metrics, key, conf }
			);

			throw new InternalFailure(
				`Got an invalid enum value of ${metrics[key]} for ${gpt} ${key} on DryScore. Can't add indexes?`
			);
		}

		indexes[key] = index;
	}

	for (const [key, conf] of [
		...Object.entries(gptConfig.providedMetrics),
		...Object.entries(gptConfig.derivedMetrics),
	]) {
		if (conf.type !== "ENUM") {
			continue;
		}

		// skip undefined metrics
		if (!metrics.optional[key]) {
			continue;
		}

		const index = conf.values.indexOf(metrics.optional[key]);

		if (index === -1) {
			logger.error(
				`Got an invalid enum value of ${metrics.optional[key]} for ${gpt} optional.${key} on DryScore. Can't add indexes?`,
				{ metrics, key, conf }
			);

			throw new InternalFailure(
				`Got an invalid enum value of ${metrics.optional[key]} for ${gpt} optional.${key} on DryScore. Can't add indexes?`
			);
		}

		indexes[key] = index;
	}

	return { indexes, optionalIndexes };
}

/**
 * Return a full piece of scoreData.
 */
export function CreateFullScoreData<GPT extends GPTString>(
	gpt: GPT,
	dryScoreData: DryScore<GPT>["scoreData"],
	chart: ChartDocument<GPT>,
	logger: KtLogger
) {
	const derivedMetrics = DeriveMetrics(gpt, dryScoreData, chart);

	const scoreData = {
		...dryScoreData,
		...derivedMetrics,
	} as unknown as ScoreData<GPT>;
	// ^ hacky force-cast because these types are *really* unstable.

	const { indexes, optionalIndexes } = CreateEnumIndexes(gpt, scoreData, logger);

	// again, silly hacks aorund typesafety here because to be honest
	// this stuff is more generic than TS really should ever have to implement.
	scoreData.enumIndexes = indexes;
	scoreData.optional.enumIndexes = optionalIndexes;

	return scoreData;
}
