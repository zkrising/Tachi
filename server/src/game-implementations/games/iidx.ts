import { IIDXLIKE_DERIVERS, IIDXLIKE_VALIDATORS } from "./_common";
import { ProfileAvgBestN } from "game-implementations/utils/profile-calc";
import { SessionAvgBest10For } from "game-implementations/utils/session-calc";
import { PoyashiBPI } from "rg-stats";
import type { GPTServerImplementation, ScoreCalculator } from "game-implementations/types";
import type { GPTStrings } from "tachi-common";

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

const IIDX_SESSION_CALCS: GPTServerImplementation<"iidx:DP" | "iidx:SP">["sessionCalcs"] = {
	BPI: SessionAvgBest10For("BPI"),
	ktLampRating: SessionAvgBest10For("ktLampRating"),
};

const IIDX_PROFILE_CALCS: GPTServerImplementation<"iidx:DP" | "iidx:SP">["profileCalcs"] = {
	BPI: ProfileAvgBestN("BPI", 20, true),
	ktLampRating: ProfileAvgBestN("ktLampRating", 20),
};

export const IIDX_SP_IMPL: GPTServerImplementation<"iidx:SP"> = {
	derivers: IIDXLIKE_DERIVERS,
	validators: IIDXLIKE_VALIDATORS,
	scoreCalcs: {
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
	sessionCalcs: IIDX_SESSION_CALCS,
	profileCalcs: IIDX_PROFILE_CALCS,
	classDerivers: {},
};

export const IIDX_DP_IMPL: GPTServerImplementation<"iidx:DP"> = {
	derivers: IIDXLIKE_DERIVERS,
	validators: IIDXLIKE_VALIDATORS,
	scoreCalcs: {
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
	sessionCalcs: IIDX_SESSION_CALCS,
	profileCalcs: IIDX_PROFILE_CALCS,
	classDerivers: {},
};
