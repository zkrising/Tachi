/* eslint-disable no-confusing-arrow */
import { GoalFmtScore, GoalOutOfFmtScore, GradeGoalFormatter } from "./_common";
import { CreatePBMergeFor } from "game-implementations/utils/pb-merge";
import { ProfileAvgBestN } from "game-implementations/utils/profile-calc";
import { SessionAvgBest10For } from "game-implementations/utils/session-calc";
import { ONGEKIRating } from "rg-stats";
import { ONGEKI_GBOUNDARIES, FmtNum, GetGrade } from "tachi-common";
import { IsNullish } from "utils/misc";
import type { GPTServerImplementation } from "game-implementations/types";
import type { Difficulties } from "tachi-common";

export const OngekiPlatDiff = (diff: Difficulties["ongeki:Single"]) =>
	diff === "MASTER" || diff === "LUNATIC";

export const ONGEKI_IMPL: GPTServerImplementation<"ongeki:Single"> = {
	chartSpecificValidators: {
		platScore: (platScore, chart) => {
			if (!OngekiPlatDiff(chart.difficulty)) {
				// We don't care about other difficulties
				return true;
			}

			if (platScore < 0) {
				return `Platinum Score must be non-negative. Got ${platScore}`;
			}

			return true;
		},
		bellCount: (bellCount) => {
			if (bellCount < 0) {
				return `Bell Count must be non-negative. Got ${bellCount}`;
			}

			return true;
		},
		totalBellCount: (bellCount) => {
			if (bellCount < 0) {
				return `Total bell Count must be non-negative. Got ${bellCount}`;
			}

			return true;
		},
		damage: (damage) => {
			if (damage < 0) {
				return `Damage must be non-negative. Got ${damage}`;
			}

			return true;
		},
	},
	derivers: {
		grade: ({ score }) => GetGrade(ONGEKI_GBOUNDARIES, score),
	},
	scoreCalcs: {
		rating: (scoreData, chart) =>
			chart.data.isUnranked || chart.levelNum === 0.0
				? 0
				: ONGEKIRating.calculate(scoreData.score, chart.levelNum),
	},
	sessionCalcs: { naiveRating: SessionAvgBest10For("rating") },
	profileCalcs: {
		naiveRating: ProfileAvgBestN("rating", 45),
	},
	classDerivers: {
		colour: (ratings) => {
			const rating = ratings.naiveRating;

			if (IsNullish(rating)) {
				return null;
			}

			if (rating >= 15) {
				return "RAINBOW";
			} else if (rating >= 14.5) {
				return "PLATINUM";
			} else if (rating >= 14) {
				return "GOLD";
			} else if (rating >= 13) {
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
				ONGEKI_GBOUNDARIES,
				pb.scoreData.grade,
				pb.scoreData.score,
				ONGEKI_GBOUNDARIES[gradeIndex]?.name ?? "D"
			),
		noteLamp: (pb) => pb.scoreData.noteLamp,
		bellLamp: (pb) => pb.scoreData.bellLamp,
		score: (pb) => FmtNum(pb.scoreData.score),
	},
	goalOutOfFormatters: {
		score: GoalOutOfFmtScore,
	},
	pbMergeFunctions: [
		CreatePBMergeFor("largest", "optional.platScore", "Best Platinum Score", (base, score) => {
			base.scoreData.optional.platScore = score.scoreData.optional.platScore;
		}),
		CreatePBMergeFor("largest", "enumIndexes.noteLamp", "Best Note Lamp", (base, score) => {
			base.scoreData.noteLamp = score.scoreData.noteLamp;
		}),
		CreatePBMergeFor("largest", "enumIndexes.bellLamp", "Best Bell Lamp", (base, score) => {
			base.scoreData.bellLamp = score.scoreData.bellLamp;
		}),
	],
	defaultMergeRefName: "Best Score",
	scoreValidators: [
		(s) => {
			let { hit, miss } = s.scoreData.judgements;

			hit ??= 0;
			miss ??= 0;

			if (s.scoreData.noteLamp === "ALL BREAK") {
				if (hit + miss > 0) {
					return "Cannot have an ALL BREAK if not all hits were justice or better.";
				}
			}

			if (s.scoreData.noteLamp === "FULL COMBO") {
				if (miss > 0) {
					return "Cannot have a FULL COMBO if the score has misses.";
				}
			}
		},
	],
};
