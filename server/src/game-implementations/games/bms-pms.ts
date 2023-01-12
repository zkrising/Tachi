import {
	GoalFmtPercent,
	GoalFmtScore,
	GradeGoalFormatter,
	IIDXLIKE_DERIVERS,
	IIDXLIKE_VALIDATORS,
	SGLCalc,
} from "./_common";
import { ProfileAvgBestN } from "game-implementations/utils/profile-calc";
import { SessionAvgBest10For } from "game-implementations/utils/session-calc";
import { IIDXLIKE_GBOUNDARIES } from "tachi-common";
import type { GPTServerImplementation } from "game-implementations/types";
import type { GPTStrings } from "tachi-common";

// bms and pms currently have *identical*
// implementations. Nice.

const BMS_IMPL: GPTServerImplementation<GPTStrings["bms" | "pms"]> = {
	derivers: IIDXLIKE_DERIVERS,
	validators: IIDXLIKE_VALIDATORS,
	scoreCalcs: { sieglinde: SGLCalc },
	sessionCalcs: { sieglinde: SessionAvgBest10For("sieglinde") },
	profileCalcs: { sieglinde: ProfileAvgBestN("sieglinde", 20) },
	classDerivers: {},
	goalCriteriaFormatters: {
		percent: GoalFmtPercent,
		score: GoalFmtScore,
	},
	goalProgressFormatters: {
		percent: (pb) => `${pb.scoreData.percent.toFixed(2)}%`,

		// 4519 -> "4519". Don't add commas or anything.
		score: (pb) => pb.scoreData.score.toString(),

		lamp: (pb) => {
			// if bp exists
			if (typeof pb.scoreData.optional.bp === "number") {
				return `${pb.scoreData.lamp} (BP: ${pb.scoreData.optional.bp})`;
			}

			return pb.scoreData.lamp;
		},
		grade: (pb, goalValue) =>
			GradeGoalFormatter(
				IIDXLIKE_GBOUNDARIES,
				pb.scoreData.grade,
				pb.scoreData.percent,
				IIDXLIKE_GBOUNDARIES[goalValue]!.name,
				// use notecount to turn the percent deltas into whole ex-scores.
				(v) => Math.floor((v / 100) * pb.scoreData.score).toFixed(0)
			),
	},
};

export const BMS_14K_IMPL: GPTServerImplementation<"bms:14K"> = BMS_IMPL;

export const BMS_7K_IMPL: GPTServerImplementation<"bms:7K"> = BMS_IMPL;

export const PMS_CONTROLLER_IMPL: GPTServerImplementation<"pms:Controller"> = BMS_IMPL;
export const PMS_KEYBOARD_IMPL: GPTServerImplementation<"pms:Keyboard"> = BMS_IMPL;
