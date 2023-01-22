import { GoalFmtPercent, GradeGoalFormatter } from "./_common";
import { CreatePBMergeFor } from "game-implementations/utils/pb-merge";
import { ProfileSumBestN } from "game-implementations/utils/profile-calc";
import { SessionAvgBestNFor } from "game-implementations/utils/session-calc";
import { ITGHighestUnbroken } from "rg-stats";
import { GetGrade, ITG_GBOUNDARIES } from "tachi-common";
import { NumToDP } from "utils/misc";
import type { GPTServerImplementation } from "game-implementations/types";

export const ITG_STAMINA_IMPL: GPTServerImplementation<"itg:Stamina"> = {
	chartSpecificValidators: {},
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

			return chart.data.rankedLevel;
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
	goalCriteriaFormatters: {
		survivedPercent: (val) => `Survive ${NumToDP(val)}% through`,

		// maybe this whole metric is silly. help.
		finalPercent: (val) => {
			if (val === 100) {
				return "CLEAR";
			} else if (val < 100) {
				return `Survive ${NumToDP(val)}% through`;
			}

			return `CLEAR, and get ${NumToDP(val - 100)}% on`;
		},
		scorePercent: GoalFmtPercent,
	},
	goalProgressFormatters: {
		lamp: (pb) => {
			if (pb.scoreData.lamp === "FAILED") {
				return `Died ${pb.scoreData.survivedPercent.toFixed(2)}% in`;
			}

			return pb.scoreData.lamp;
		},
		scorePercent: (pb) => `${pb.scoreData.scorePercent.toFixed(2)}%`,
		survivedPercent: (pb) => `${pb.scoreData.survivedPercent.toFixed(2)}%`,
		finalPercent: (pb) => {
			if (pb.scoreData.finalPercent < 100) {
				return `Died ${pb.scoreData.survivedPercent.toFixed(2)}% in`;
			}

			return `${pb.scoreData.lamp} with ${pb.scoreData.scorePercent.toFixed(2)}%`;
		},
		grade: (pb, gradeIndex) =>
			GradeGoalFormatter(
				ITG_GBOUNDARIES,
				pb.scoreData.grade,
				pb.scoreData.scorePercent,
				ITG_GBOUNDARIES[gradeIndex]!.name,
				(v) => `${v.toFixed(2)}%`
			),
	},
	goalOutOfFormatters: {
		survivedPercent: (num) => `${NumToDP(num)}%`,
		scorePercent: (num) => `${NumToDP(num)}%`,
		finalPercent: (num) => {
			if (num >= 100) {
				return `CLEAR with ${NumToDP(num - 100)}%`;
			}

			return `${NumToDP(num)}%`;
		},
	},
	pbMergeFunctions: [
		// we'll pluck the best lamp, but this game has a pretty interesting concept
		// for merging PBs. This is probably fine.
		CreatePBMergeFor("largest", "enumIndexes.lamp", "Best Lamp", (base, score) => {
			base.scoreData.lamp = score.scoreData.lamp;
		}),
	],

	// this name sucks, what should we do instead? TODO.
	defaultMergeRefName: "Best Result",

	scoreValidators: [
		(s) => {
			if (s.scoreData.lamp !== "FAILED" && s.scoreData.survivedPercent < 100) {
				return "Cannot clear a chart that you didn't survive 100% of.";
			}
		},
		(s) => {
			let { fantastic, excellent, great, decent, wayoff, miss } = s.scoreData.judgements;

			fantastic ??= 0;
			excellent ??= 0;
			great ??= 0;
			decent ??= 0;
			wayoff ??= 0;
			miss ??= 0;

			if (s.scoreData.lamp === "QUINT") {
				if (fantastic + excellent + great + decent + wayoff + miss > 0) {
					return "Cannot have a QUINT with any fantastic (or worse) judgements.";
				}
			}

			if (s.scoreData.lamp === "QUAD") {
				if (excellent + great + decent + wayoff + miss > 0) {
					return "Cannot have a QUAD with any excellent (or worse) judgements.";
				}
			}

			if (s.scoreData.lamp === "FULL EXCELLENT COMBO") {
				if (great + decent + wayoff + miss > 0) {
					return "Cannot have a FULL EXCELLENT COMBO with any great (or worse) judgements.";
				}
			}

			if (s.scoreData.lamp === "FULL COMBO") {
				if (decent + wayoff + miss > 0) {
					return "Cannot have a FULL COMBO with any combo breaks.";
				}
			}
		},
	],
};
