import { GetGrade } from "./_common";
import { ProfileSumBestN } from "game-implementations/utils/profile-calc";
import { SessionAvgBestNFor } from "game-implementations/utils/session-calc";
import { ITGHighestUnbroken } from "rg-stats";
import { ITG_GBOUNDARIES } from "tachi-common";
import type { GPTServerImplementation } from "game-implementations/types";

export const ITG_STAMINA_IMPL: GPTServerImplementation<"itg:Stamina"> = {
	validators: {},
	derivers: {
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
	scoreCalcs: {
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
	sessionCalcs: { blockRating: SessionAvgBestNFor("blockRating", 5) },
	profileCalcs: {
		// the sum of your 1 best blockrating/fastest32 is basically just
		// picking your best blockrating/fastest32. neat.
		highestBlock: ProfileSumBestN("blockRating", 1, true),
		fastest32: ProfileSumBestN("fastest32", 1, true),
	},
	classDerivers: {},
};
