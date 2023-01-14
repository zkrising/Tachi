import {
	GoalFmtPercent,
	GoalFmtScore,
	GoalOutOfFmtPercent,
	GradeGoalFormatter,
	IIDXLIKE_DERIVERS,
	IIDXLIKE_VALIDATORS,
	SGLCalc,
} from "./_common";
import { CreatePBMergeFor } from "game-implementations/utils/pb-merge";
import { ProfileAvgBestN } from "game-implementations/utils/profile-calc";
import { SessionAvgBest10For } from "game-implementations/utils/session-calc";
import { IIDXLIKE_GBOUNDARIES } from "tachi-common";
import type { GPTServerImplementation, PBMergeFunction } from "game-implementations/types";
import type { GPTStrings } from "tachi-common";

const BMS_PMS_MERGERS: Array<PBMergeFunction<GPTStrings["bms" | "pms"]>> = [
	CreatePBMergeFor("largest", "enumIndexes.lamp", "Best Lamp", (base, lamp) => {
		base.scoreData.lamp = lamp.scoreData.lamp;

		// technically these don't exist on PMS scores but since undefined is a
		// legal value for these properties it works out.
		base.scoreData.optional.gauge = lamp.scoreData.optional.gauge;
		base.scoreData.optional.gaugeHistory = lamp.scoreData.optional.gaugeHistory;
	}),
	CreatePBMergeFor("smallest", "optional.bp", "Lowest BP", (base, bp) => {
		base.scoreData.optional.bp = bp.scoreData.optional.bp;
	}),
];

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
				(deltaPercent) => {
					const max = Math.floor(pb.scoreData.score / (pb.scoreData.percent / 100));

					return ((deltaPercent / 100) * max).toFixed(0);
				}
			),
	},
	goalOutOfFormatters: {
		percent: GoalOutOfFmtPercent,
		// don't insert commas or anything.
		score: (m) => m.toString(),
	},
	pbMergeFunctions: BMS_PMS_MERGERS,
	defaultMergeRefName: "Best Score",
};

export const BMS_14K_IMPL: GPTServerImplementation<"bms:14K"> = BMS_IMPL;

export const BMS_7K_IMPL: GPTServerImplementation<"bms:7K"> = BMS_IMPL;

export const PMS_CONTROLLER_IMPL: GPTServerImplementation<"pms:Controller"> = BMS_IMPL;
export const PMS_KEYBOARD_IMPL: GPTServerImplementation<"pms:Keyboard"> = BMS_IMPL;
