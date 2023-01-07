import { PopnClearMedalToLamp } from "../derivers/games/popn";
import {
	CHUNITHMRating,
	CuratorSkill,
	GITADORASkill,
	ITGHighestUnbroken,
	Jubility,
	MaimaiDXRate,
	PopnClassPoints,
	PoyashiBPI,
	Volforce,
	WACCARate,
} from "rg-stats";
import { GetGPTString } from "tachi-common";
import type { DryScore } from "../common/types";
import type { ScoreCalculator, GPTScoreCalculators } from "./types";
import type { ChartDocument, GPTString, GPTStrings } from "tachi-common";

const SkillCalc: ScoreCalculator<"gitadora:Dora" | "gitadora:Gita"> = (dryScore, chart) =>
	GITADORASkill.calculate(dryScore.scoreData.percent, chart.levelNum);

const SGLCalc: ScoreCalculator<GPTStrings["bms" | "pms"]> = (dryScore, chart) => {
	const ecValue = chart.data.sglEC ?? 0;
	const hcValue = chart.data.sglHC ?? 0;

	switch (dryScore.scoreData.lamp) {
		case "FULL COMBO":
		case "EX HARD CLEAR":
		case "HARD CLEAR":
			return Math.max(hcValue, ecValue);
		case "CLEAR":
		case "EASY CLEAR":
			return ecValue;
		default:
			return 0;
	}
};

const VF6Calc: ScoreCalculator<GPTStrings["sdvx" | "usc"]> = (dryScore, chart) =>
	Volforce.calculateVF6(dryScore.scoreData.score, dryScore.scoreData.lamp, chart.levelNum);

const BPICalc: ScoreCalculator<GPTStrings["iidx"]> = (dryScore, chart) => {
	if (chart.data.kaidenAverage === null || chart.data.worldRecord === null) {
		return null;
	}

	return PoyashiBPI.calculate(
		dryScore.scoreData.score,
		chart.data.kaidenAverage,
		chart.data.worldRecord,
		chart.data.notecount * 2,
		chart.data.bpiCoefficient
	);
};

/**
 * We calculate some statistics to attach onto scores. What statistics exist for a game
 * are controlled by its config.
 *
 * This is the implementation for those calculators.
 */
export const SCORE_CALCULATORS: GPTScoreCalculators = {
	"iidx:SP": {
		BPI: BPICalc,
		ktLampRating: (dryScore, chart) => {
			// if chart has no ncValue, use the rating of the chart instead.
			const ncValue = chart.data.ncTier?.value ?? chart.levelNum;

			// if hc < nc, hcValue = ncValue
			// this means you can't lose score from getting a better clear.
			// same for exhc < hc.
			const hcValue = Math.max(chart.data.hcTier?.value ?? 0, ncValue);
			const exhcValue = Math.max(chart.data.exhcTier?.value ?? 0, hcValue);

			switch (dryScore.scoreData.lamp) {
				case "FULL COMBO":
				case "EX HARD CLEAR":
					return exhcValue;
				case "HARD CLEAR":
					return hcValue;
				case "CLEAR":
					return ncValue;
				default:
					return 0;
			}
		},
	},
	"iidx:DP": {
		BPI: BPICalc,
		ktLampRating: (dryScore, chart) => {
			// if chart has no tier, use the rating of the chart instead.
			const ecValue = chart.data.dpTier?.value ?? chart.levelNum;

			switch (dryScore.scoreData.lamp) {
				case "FULL COMBO":
				case "EX HARD CLEAR":
				case "HARD CLEAR":
				case "CLEAR":
				case "EASY CLEAR":
					return ecValue;
				default:
					return 0;
			}
		},
	},

	"bms:7K": { sieglinde: SGLCalc },
	"bms:14K": { sieglinde: SGLCalc },

	"gitadora:Dora": { skill: SkillCalc },
	"gitadora:Gita": { skill: SkillCalc },

	"pms:Controller": { sieglinde: SGLCalc },
	"pms:Keyboard": { sieglinde: SGLCalc },

	"usc:Controller": { VF6: VF6Calc },
	"usc:Keyboard": { VF6: VF6Calc },

	"maimaidx:Single": {
		rate: (dryScore, chart) =>
			MaimaiDXRate.calculate(dryScore.scoreData.percent, chart.levelNum),
	},
	"museca:Single": {
		curatorSkill: (dryScore, chart) =>
			CuratorSkill.calculate(dryScore.scoreData.score, chart.levelNum),
	},
	"chunithm:Single": {
		rating: (dryScore, chart) =>
			CHUNITHMRating.calculate(dryScore.scoreData.score, chart.levelNum),
	},
	"jubeat:Single": {
		jubility: (dryScore, chart) =>
			Jubility.calculate(
				dryScore.scoreData.score,
				dryScore.scoreData.musicRate,
				chart.levelNum
			),
	},

	"itg:Stamina": {
		blockRating: (dryScore, chart) => {
			if (dryScore.scoreData.lamp === "FAILED") {
				return null;
			}

			return chart.levelNum;
		},
		fastest32: (dryScore, chart) => {
			const diedAtMeasure =
				dryScore.scoreData.lamp === "FAILED"
					? (dryScore.scoreData.survivedPercent / 100) * chart.data.notesPerMeasure.length
					: null;

			const fastest32 = ITGHighestUnbroken.calculateFromNPSPerMeasure(
				chart.data.npsPerMeasure,
				chart.data.notesPerMeasure,
				diedAtMeasure,
				32 // 32 measures is generally peoples go-to.
			);

			if (fastest32 === null) {
				return null;
			}

			// To avoid confusing players, we reject highest 32s less than
			// 100bpm. Due to how highest32 is calculated, it correctly comes
			// to the confusing conclusion that sometimes you technically just hit
			// 32 unbroken measures at like 14 BPM. This is confusing to end users,
			// so we should hide it.
			if (fastest32 < 100) {
				return null;
			}

			return fastest32;
		},
	},

	"popn:9B": {
		classPoints: (dryScore, chart) =>
			PopnClassPoints.calculate(
				dryScore.scoreData.score,
				PopnClearMedalToLamp(dryScore.scoreData.clearMedal),
				chart.levelNum
			),
	},
	"sdvx:Single": { VF6: VF6Calc },

	"wacca:Single": {
		rate: (dryScore, chart) => WACCARate.calculate(dryScore.scoreData.score, chart.levelNum),
	},
};

/**
 * Create calculated data for a score.
 * @param scores - All of the scores in this session.
 */
export function CreateScoreCalcData<GPT extends GPTString>(
	dryScore: DryScore<GPT>,
	chart: ChartDocument<GPT>
) {
	const gptString = GetGPTString(dryScore.game, chart.playtype);

	const calcData: Record<string, number | null> = {};

	for (const [key, fn] of Object.entries(SCORE_CALCULATORS[gptString])) {
		calcData[key] = fn(dryScore, chart);
	}

	return calcData;
}
