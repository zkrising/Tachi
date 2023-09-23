import { GoalFmtScore, GoalOutOfFmtScore, GradeGoalFormatter } from "./_common";
import { CreatePBMergeFor } from "game-implementations/utils/pb-merge";
import { ProfileAvgBestN } from "game-implementations/utils/profile-calc";
import { SessionAvgBest10For } from "game-implementations/utils/session-calc";
import { ARCAEA_GBOUNDARIES, GetGrade } from "tachi-common";
import { IsNullish } from "utils/misc";
import type { GPTServerImplementation } from "game-implementations/types";

export const ARCAEA_IMPL: GPTServerImplementation<"arcaea:Single"> = {
	chartSpecificValidators: {
		score: (score, chart) => {
			if (score < 0) {
				return `Score must be non-negative. Got ${score}`;
			}

			return true;
		},
	},
	derivers: {
		grade: ({ score }) => GetGrade(ARCAEA_GBOUNDARIES, score),
	},
	sessionCalcs: {
		naivePotential: SessionAvgBest10For("potential"),
	},
	profileCalcs: {
		naivePotential: ProfileAvgBestN("potential", 50),
	},
	classDerivers: {
		badge: (ratings) => {
			const potential = ratings.naivePotential;

			if (IsNullish(potential)) {
				return null;
			}

			if (potential >= 13.0) {
				return "THREE_STARS";
			} else if (potential >= 12.5) {
				return "TWO_STARS";
			} else if (potential >= 12.0) {
				return "ONE_STAR";
			} else if (potential >= 11.0) {
				return "RED";
			} else if (potential >= 10.0) {
				return "PURPLE";
			} else if (potential >= 7.0) {
				return "ASH_PURPLE";
			} else if (potential >= 3.5) {
				return "GREEN";
			}

			return "BLUE";
		},
	},
	goalCriteriaFormatters: {
		score: GoalFmtScore,
	},
	goalProgressFormatters: {
		score: (pb) => `${pb.scoreData.score}`,
		lamp: (pb) => pb.scoreData.lamp,
		grade: (pb, gradeIndex) =>
			GradeGoalFormatter(
				ARCAEA_GBOUNDARIES,
				pb.scoreData.grade,
				pb.scoreData.score,
				ARCAEA_GBOUNDARIES[gradeIndex]!.name,
				(v) => `$v`
			),
	},
	goalOutOfFormatters: {
		score: GoalOutOfFmtScore,
	},
	pbMergeFunctions: [
		CreatePBMergeFor("largest", "enumIndexes.lamp", "Best Lamp", (base, score) => {
			base.scoreData.lamp = score.scoreData.lamp;
		}),
	],
	defaultMergeRefName: "Best Score",
	scoreValidators: [
		(s) => {
			const { far, lost } = s.scoreData.judgements;

			if (s.scoreData.lamp === "PURE MEMORY" && (lost ?? 0) + (far ?? 0) > 0) {
				return "Cannot have a PURE MEMORY with any fars or losts.";
			} else if (s.scoreData.lamp === "FULL RECALL" && (lost ?? 0) > 0) {
				return "Cannot have a PURE MEMORY with non-zero lost count.";
			}
		},
	],
};
