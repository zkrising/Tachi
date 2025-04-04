import { GoalFmtScore, GoalOutOfFmtScore, GradeGoalFormatter } from "./_common";
import { CreatePBMergeFor } from "game-implementations/utils/pb-merge";
import { ProfileAvgBestN } from "game-implementations/utils/profile-calc";
import { SessionAvgBest10For } from "game-implementations/utils/session-calc";
import { CHUNITHMRating } from "rg-stats";
import { CHUNITHM_GBOUNDARIES, FmtNum, GetGrade } from "tachi-common";
import { IsNullish } from "utils/misc";
import type { GPTServerImplementation } from "game-implementations/types";

export const CHUNITHM_IMPL: GPTServerImplementation<"chunithm:Single"> = {
	chartSpecificValidators: {},
	derivers: {
		grade: ({ score }) => GetGrade(CHUNITHM_GBOUNDARIES, score),
	},
	scoreCalcs: {
		rating: (scoreData, chart) => CHUNITHMRating.calculate(scoreData.score, chart.levelNum),
	},
	sessionCalcs: { naiveRating: SessionAvgBest10For("rating") },
	profileCalcs: { naiveRating: ProfileAvgBestN("rating", 50, false, 100) },
	classDerivers: {
		colour: (ratings) => {
			const rating = ratings.naiveRating;

			if (IsNullish(rating)) {
				return null;
			}

			if (rating >= 17.5) {
				return "RAINBOW_EX_III";
			} else if (rating >= 17.25) {
				return "RAINBOW_EX_II";
			} else if (rating >= 17) {
				return "RAINBOW_EX_I";
			} else if (rating >= 16.75) {
				return "RAINBOW_IV";
			} else if (rating >= 16.5) {
				return "RAINBOW_III";
			} else if (rating >= 16.25) {
				return "RAINBOW_II";
			} else if (rating >= 16) {
				return "RAINBOW";
			} else if (rating >= 15.25) {
				return "PLATINUM";
			} else if (rating >= 14.5) {
				return "GOLD";
			} else if (rating >= 13.25) {
				return "SILVER";
			} else if (rating >= 12) {
				return "COPPER";
			} else if (rating >= 10) {
				return "PURPLE";
			} else if (rating >= 7) {
				return "RED";
			} else if (rating >= 4) {
				return "ORANGE";
			} else if (rating >= 2) {
				return "GREEN";
			}

			return "BLUE";
		},
	},
	goalCriteriaFormatters: {
		score: GoalFmtScore,
	},
	goalProgressFormatters: {
		grade: (pb, gradeIndex) =>
			GradeGoalFormatter(
				CHUNITHM_GBOUNDARIES,
				pb.scoreData.grade,
				pb.scoreData.score,
				CHUNITHM_GBOUNDARIES[gradeIndex]!.name
			),
		clearLamp: (pb) => pb.scoreData.clearLamp,
		comboLamp: (pb) => pb.scoreData.comboLamp,
		score: (pb) => FmtNum(pb.scoreData.score),
	},
	goalOutOfFormatters: {
		score: GoalOutOfFmtScore,
	},
	pbMergeFunctions: [
		CreatePBMergeFor("largest", "enumIndexes.clearLamp", "Best Lamp", (base, score) => {
			base.scoreData.clearLamp = score.scoreData.clearLamp;
		}),
		CreatePBMergeFor("largest", "enumIndexes.comboLamp", "Best Lamp", (base, score) => {
			base.scoreData.comboLamp = score.scoreData.comboLamp;
		}),
	],
	defaultMergeRefName: "Best Score",
	scoreValidators: [
		(s) => {
			if (
				s.scoreData.comboLamp === "ALL JUSTICE CRITICAL" &&
				s.scoreData.score !== 1_010_000
			) {
				return "An ALL JUSTICE CRITICAL must have a score of 1.01 million.";
			}

			if (
				s.scoreData.comboLamp !== "ALL JUSTICE CRITICAL" &&
				s.scoreData.score === 1_010_000
			) {
				return "A score of 1.01 million must have a lamp of ALL JUSTICE CRITICAL.";
			}

			if (s.scoreData.comboLamp === "ALL JUSTICE" && s.scoreData.score < 1_000_000) {
				return `A score of ${s.scoreData.score} cannot be an ALL JUSTICE.`;
			}

			if (s.scoreData.comboLamp === "FULL COMBO" && s.scoreData.score < 500_000) {
				return `A score of ${s.scoreData.score} cannot be a FULL COMBO.`;
			}
		},
		(s) => {
			let { attack, justice, miss } = s.scoreData.judgements;

			justice ??= 0;
			attack ??= 0;
			miss ??= 0;

			if (s.scoreData.comboLamp === "ALL JUSTICE CRITICAL") {
				if (attack + justice + miss > 0) {
					return "Cannot have an ALL JUSTICE CRITICAL with any non-jcrit judgements.";
				}
			}

			if (s.scoreData.comboLamp === "ALL JUSTICE") {
				if (attack + miss > 0) {
					return "Cannot have an ALL JUSTICE if not all hits were justice or better.";
				}
			}

			if (s.scoreData.comboLamp === "FULL COMBO") {
				if (miss > 0) {
					return "Cannot have a FULL COMBO if the score has misses.";
				}
			}
		},
		(s) => {
			const { maxCombo } = s.scoreData.optional;
			const { attack, jcrit, justice, miss } = s.scoreData.judgements;

			if (
				IsNullish(maxCombo) ||
				IsNullish(attack) ||
				IsNullish(jcrit) ||
				IsNullish(justice) ||
				IsNullish(miss)
			) {
				return;
			}

			if (s.scoreData.comboLamp !== "NONE" && jcrit + justice + attack + miss !== maxCombo) {
				const article = s.scoreData.comboLamp === "FULL COMBO" ? "a" : "an";

				return `Cannot have ${article} ${s.scoreData.comboLamp} if maxCombo is not equal to the sum of judgements.`;
			}
		},
		(s) => {
			const { attack, justice, miss } = s.scoreData.judgements;

			// Assume the clear lamp is correct if judgements aren't provided.
			if (IsNullish(attack) || IsNullish(justice) || IsNullish(miss)) {
				return;
			}

			if (s.scoreData.clearLamp === "CATASTROPHY" && justice + attack + miss >= 10) {
				return "Cannot have a CATASTROPHY clear with 10 or more non-jcrit judgements.";
			}

			if (s.scoreData.clearLamp === "ABSOLUTE" && justice + attack + miss >= 50) {
				return "Cannot have an ABSOLUTE clear with 50 or more non-jcrit judgements.";
			}

			if (s.scoreData.clearLamp === "BRAVE" && justice + attack + miss >= 150) {
				return "Cannot have a BRAVE clear with 150 or more non-jcrit judgements.";
			}

			// The condition for a HARD clear varies based on the skill used:
			// - JUDGE: 20 misses
			// - JUDGE+: 10 misses
			// - EMBLEM: 300 justices or below
			// Since we do not have information about the skill used, we simply validate that a
			// hard clear is not completely impossible, i.e. more than 20 misses and more than 300 justices.
			if (s.scoreData.clearLamp === "HARD" && justice + attack + miss >= 300 && miss >= 20) {
				return "Cannot have a HARD clear with 300 or more non-jcrit judgements, and over 20 misses.";
			}
		},
	],
};
