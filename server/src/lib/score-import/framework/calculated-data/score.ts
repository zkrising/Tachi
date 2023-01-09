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
import type { DryScoreData } from "../common/types";
import type { ScoreCalculator, GPTScoreCalculators } from "./types";
import type { ChartDocument, GPTString, GPTStrings, Game } from "tachi-common";

const SkillCalc: ScoreCalculator<"gitadora:Dora" | "gitadora:Gita"> = (scoreData, chart) =>
	GITADORASkill.calculate(scoreData.percent, chart.levelNum);

const SGLCalc: ScoreCalculator<GPTStrings["bms" | "pms"]> = (scoreData, chart) => {
	const ecValue = chart.data.sglEC ?? 0;
	const hcValue = chart.data.sglHC ?? 0;

	switch (scoreData.lamp) {
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

const VF6Calc: ScoreCalculator<GPTStrings["sdvx" | "usc"]> = (scoreData, chart) =>
	Volforce.calculateVF6(scoreData.score, scoreData.lamp, chart.levelNum);

const BPICalc: ScoreCalculator<GPTStrings["iidx"]> = (scoreData, chart) => {
	if (chart.data.kaidenAverage === null || chart.data.worldRecord === null) {
		return null;
	}

	return PoyashiBPI.calculate(
		scoreData.score,
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
		ktLampRating: (scoreData, chart) => {
			// if chart has no ncValue, use the rating of the chart instead.
			const ncValue = chart.data.ncTier?.value ?? chart.levelNum;

			// if hc < nc, hcValue = ncValue
			// this means you can't lose score from getting a better clear.
			// same for exhc < hc.
			const hcValue = Math.max(chart.data.hcTier?.value ?? 0, ncValue);
			const exhcValue = Math.max(chart.data.exhcTier?.value ?? 0, hcValue);

			switch (scoreData.lamp) {
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
		ktLampRating: (scoreData, chart) => {
			// if chart has no tier, use the rating of the chart instead.
			const ecValue = chart.data.dpTier?.value ?? chart.levelNum;

			switch (scoreData.lamp) {
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
		rate: (scoreData, chart) => MaimaiDXRate.calculate(scoreData.percent, chart.levelNum),
	},
	"museca:Single": {
		curatorSkill: (scoreData, chart) => CuratorSkill.calculate(scoreData.score, chart.levelNum),
	},
	"chunithm:Single": {
		rating: (scoreData, chart) => CHUNITHMRating.calculate(scoreData.score, chart.levelNum),
	},
	"jubeat:Single": {
		jubility: (scoreData, chart) =>
			Jubility.calculate(scoreData.score, scoreData.musicRate, chart.levelNum),
	},

	"itg:Stamina": {
		blockRating: (scoreData, chart) => {
			if (scoreData.lamp === "FAILED") {
				return null;
			}

			return chart.levelNum;
		},
		fastest32: (scoreData, chart) => {
			const diedAtMeasure =
				scoreData.lamp === "FAILED"
					? (scoreData.survivedPercent / 100) * chart.data.notesPerMeasure.length
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
		classPoints: (scoreData, chart) =>
			PopnClassPoints.calculate(
				scoreData.score,
				PopnClearMedalToLamp(scoreData.clearMedal),
				chart.levelNum
			),
	},
	"sdvx:Single": { VF6: VF6Calc },

	"wacca:Single": {
		rate: (scoreData, chart) => WACCARate.calculate(scoreData.score, chart.levelNum),
	},
};

/**
 * Create calculated data for a score.
 * @param scores - All of the scores in this session.
 */
export function CreateScoreCalcData<GPT extends GPTString>(
	game: Game,
	dryScoreData: DryScoreData<GPT>,
	chart: ChartDocument<GPT>
) {
	const gptString = GetGPTString(game, chart.playtype);

	const calcData: Record<string, number | null> = {};

	for (const [key, fn] of Object.entries(SCORE_CALCULATORS[gptString])) {
		calcData[key] = fn(dryScoreData, chart);
	}

	return calcData;
}
